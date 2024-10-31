import { NS } from '@ns';
import { BaseServer } from './baseServer';
import { Logger } from '@/logger/logger';
import { BatchScriptBundle } from './types';

export class PServer extends BaseServer {
	protected logger: Logger;
	protected maxRam: number;
	protected mult: number;
	protected workers: BatchScriptBundle;
	pServerList: string[];
	constructor(ns: NS) {
		super(ns);
		this.workers = {
			hack: 'batcher/payloads/batchHack.js',
			grow: 'batcher/payloads/batchGrow.js',
			weaken: 'batcher/payloads/batchWeaken.js',
			all: ['batcher/payloads/batchHack.js', 'batcher/payloads/batchGrow.js', 'batcher/payloads/batchWeaken.js'],
		};
		this.logger = new Logger(ns, 'PServer');

		this.mult = 3;
		this.pServerList = this.ns
			.getPurchasedServers()
			.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
		this.maxRam = Math.pow(2, 20);
	}
	/**
	 *
	 * @returns The name of the newly purchased p-server
	 */
	protected generateServerName() {
		const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		const length: number = 5;
		let result: string = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
	/**
	 *
	 * @returns The amount of RAM
	 */
	protected calcRam(): number {
		let ram: number = Math.min(this.maxRam, Math.pow(2, this.mult));
		const potentialMaxRam: number = this.pServerList.reduce<number>(
			(a, e) => Math.max(a, this.ns.getServerMaxRam(e)),
			3,
		);
		while (ram < potentialMaxRam) {
			ram = Math.min(this.maxRam, Math.pow(2, this.mult));
			this.mult++;
		}
		return ram;
	}
	/**
	 * Loop for upgrading p-servers
	 */
	protected async upgradeAll(): Promise<void> {
		const ram: number = this.calcRam();
		let cash: number = this.ns.getServerMoneyAvailable('home');

		/**
		 * It's always good to upgrade, rather than delete and re-buy p-servers
		 * So, we check to see if the purchased server limit has been hit
		 */
		if (this.pServerList.length === this.ns.getPurchasedServerLimit()) {
			for (const server of this.pServerList) {
				if (ram <= this.ns.getServerMaxRam(server)) {
					// Bump the multiplier so we can upgrade servers
					this.mult += 1;
					// Get the new RAM amount once we've incremented the multiplier
					const newRam: number = this.calcRam();
					const cost: number = this.ns.getPurchasedServerUpgradeCost(server, newRam);
					if (cost <= cash) {
						this.ns.upgradePurchasedServer(server, newRam);
						this.logger.info(
							`Purchased Server (Hostname: ${server}) was successfully upgraded to ${newRam} GB of RAM for ${Intl.NumberFormat(
								'en-US',
								{
									style: 'currency',
									currency: 'USD',
								},
							).format(cost)}`,
						);
						// Remove the cash that was spent to buy/upgrade servers from our local tally
						cash -= cost;
					}
				}
			}
		} else {
			/** The purchased server list was NOT full, so we just buy an 8GB server, and move on */
			const cost: number = this.ns.getPurchasedServerCost(ram);
			let cash: number = this.ns.getServerMoneyAvailable('home');
			if (this.pServerList.length < this.ns.getPurchasedServerLimit() && cost <= cash) {
				while (cost < cash) {
					const name: string = `pserv-${this.generateServerName()}`;
					this.ns.purchaseServer(name, ram);
					await this.ns.sleep(100);
					this.logger.info(
						`Purchased Server (Hostname: ${name}) with ${ram} GB of RAM for ${Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: 'USD',
						}).format(cost)}`,
					);
					// Remove the cash that was spent to buy/upgrade servers from our local tally
					cash -= cost;
				}
				// Make sure we re-set the pServerList, because we've added to it
				this.pServerList = this.ns
					.getPurchasedServers()
					.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
				// We need to make sure the newly purchased server has access to the required payloads
				this.copy(this.workers.all);
			}
		}
	}
	/**
	 * Shell for upgradeAll
	 */
	async run(): Promise<void> {
		await this.upgradeAll();
	}
}
