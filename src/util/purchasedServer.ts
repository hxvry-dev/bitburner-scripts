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
	 * @returns The largest amount of RAM in {@link pServerList}
	 */
	protected calcMaxRam(): number {
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
	 *
	 * @returns The smallest amount of RAM in {@link pServerList}
	 */
	protected calcMinRam(): number {
		let ram: number = Math.min(this.maxRam, Math.pow(2, this.mult));
		const potentialMaxRam: number = this.pServerList.reduce<number>(
			(a, e) => Math.min(a, this.ns.getServerMaxRam(e)),
			3,
		);
		while (ram < potentialMaxRam) {
			ram = Math.min(this.maxRam, Math.pow(2, this.mult));
			this.mult++;
		}
		return ram;
	}
	protected getMultFromRam(ram: number): number {
		return Math.log2(ram);
	}
	/**
	 * Loop for upgrading p-servers
	 */
	protected async upgrade(): Promise<void> {
		this.pServerList = this.ns
			.getPurchasedServers()
			.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
		let ramToPurchase: number = this.calcMaxRam();
		const isFull: boolean = this.pServerList.length === this.ns.getPurchasedServerLimit();

		// If the purchased server list is full, we can only upgrade
		if (isFull) {
			// Upgrade server
			for (const server of this.pServerList) {
				if (this.ns.getServerMaxRam(server) >= this.maxRam) return;
				let cashOnHand: number = this.ns.getServerMoneyAvailable('home');
				// Calculate the baseline cost of upgrading the server
				let cost: number = this.ns.getPurchasedServerUpgradeCost(server, ramToPurchase);
				// If the amount of RAM we're buying is less than or equal to the current servers' max RAM...
				if (ramToPurchase <= this.ns.getServerMaxRam(server)) {
					this.logger.info(`Bumping RAM multiplier from ${this.mult} to ${this.mult + 1}`);
					this.mult += 1;
					// Re-calculate the `ramToPurchase`
					ramToPurchase = this.calcMaxRam();
					// Re-calculate the cost to upgrade
					cost = this.ns.getPurchasedServerUpgradeCost(server, ramToPurchase);
					// If the cost to upgrade is less than or equal to the amount of cash that the player has...
					if (cost <= cashOnHand) {
						// Upgrade the p-server
						this.ns.upgradePurchasedServer(server, ramToPurchase);
						this.logger.info(
							`Purchased Server (Hostname: ${server}) was successfully upgraded to ${ramToPurchase} GB of RAM for ${Intl.NumberFormat(
								'en-US',
								{
									style: 'currency',
									currency: 'USD',
								},
							).format(cost)}`,
						);
					} else {
						continue;
					}
				} else {
					// This is a weird case, the amount of RAM being bought is greater than or equal to the amount of RAM
					// Calculate the current RAM multiplier based on the amount of ram currently on the server.
					const newMult: number = this.getMultFromRam(this.ns.getServerMaxRam(server)) + 1;
					// Re-calculate the amount of ram we're buying
					const newRam: number = Math.min(this.maxRam, Math.pow(2, newMult));
					// Re-calculate the cost of upgrading
					cost = this.ns.getPurchasedServerUpgradeCost(server, newRam);
					// If the cost to upgrade is less than or equal to the amount of cash that the player has...
					if (cost <= cashOnHand) {
						// Upgrade the p-server
						this.ns.upgradePurchasedServer(server, newRam);
						this.logger.info(
							`Purchased Server (Hostname: ${server}) was successfully upgraded to ${ramToPurchase} GB of RAM for ${Intl.NumberFormat(
								'en-US',
								{
									style: 'currency',
									currency: 'USD',
								},
							).format(cost)}`,
						);
					} else {
						continue;
					}
				}
			}
		} else {
			// The purchased server list is not full, so we can purchase bulk 8GB at cost to fill the list.
			let cashOnHand: number = this.ns.getServerMoneyAvailable('home');
			const cost: number = this.ns.getPurchasedServerCost(8); // 440,000
			while (cost <= cashOnHand && !isFull) {
				const name: string = `pserv-${this.generateServerName()}`;
				this.ns.purchaseServer(name, 8);
				this.copy(this.workers.all);
				await this.ns.sleep(100);
				this.logger.info(
					`Purchased Server (Hostname: ${name}) with 8 GB of RAM for ${Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
					}).format(cost)}`,
				);
				// Remove the cash that was spent to buy/upgrade servers from our local tally
				cashOnHand -= cost;
			}
		}
	}
	/**
	 * Shell for upgradeAll
	 */
	async run(): Promise<void> {
		return await this.upgrade();
	}
}
