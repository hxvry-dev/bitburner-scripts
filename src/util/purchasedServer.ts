import { NS } from '@ns';
import { BaseServer } from './baseServer';
import { Logger } from '@/logger/logger';
import { BatchScriptBundle } from './types';

export class PServer extends BaseServer {
	protected logger: Logger;
	protected maxRam: number;
	protected mult: number;
	protected isFull: boolean;
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
		this.isFull = this.pServerList.length === this.ns.getPurchasedServerLimit();
		this.maxRam = Math.pow(2, 20);
	}
	protected generateServerName() {
		const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		const length: number = 5;
		let result: string = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
	protected calcRam(): number {
		let ram: number = Math.min(this.maxRam, Math.pow(2, this.mult));
		const potentialMaxRam: number = this.pServerList.reduce<number>(
			(a, e) => Math.max(a, this.ns.getServerMaxRam(e)),
			3,
		);
		while (ram < potentialMaxRam) this.mult++;
		return ram;
	}
	protected purchase(ram: number): void {
		const cost: number = this.ns.getPurchasedServerCost(ram);
		const cash: number = this.ns.getServerMoneyAvailable('home');
		const name: string = `pserv-${this.generateServerName()}`;
		if (this.pServerList.length < this.ns.getPurchasedServerLimit()) {
			if (cost <= cash) {
				this.ns.purchaseServer(name, ram);
				this.logger.info(
					`Purchased Server (Hostname: ${name}) with ${ram} GB of RAM for ${Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
					}).format(cost)}`,
				);
				this.copy(this.workers.all);
				this.pServerList = this.ns
					.getPurchasedServers()
					.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
			}
		}
	}
	protected upgradeAll(): void {
		let ram: number = this.calcRam();
		this.pServerList = this.ns
			.getPurchasedServers()
			.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
		if (this.isFull) {
			for (const server of this.pServerList) {
				const cost: number = this.ns.getPurchasedServerUpgradeCost(server, ram);
				const cash: number = this.ns.getServerMoneyAvailable('home');
				if (cost <= cash && ram <= this.ns.getServerMaxRam(server)) {
					this.mult += 1;
					ram = Math.min(this.maxRam, Math.pow(2, this.mult));
					this.ns.upgradePurchasedServer(server, ram);
					this.logger.info(
						`Purchased Server (Hostname: ${server}) successfully upgraded to ${ram} GB of RAM for ${Intl.NumberFormat(
							'en-US',
							{
								style: 'currency',
								currency: 'USD',
							},
						).format(cost)}`,
					);
					this.pServerList = this.ns
						.getPurchasedServers()
						.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
				} else {
					this.ns.upgradePurchasedServer(server, ram);
					this.copy(this.workers.all);
					this.logger.info(
						`Purchased Server (Hostname: ${server}) successfully upgraded to ${ram} GB of RAM for ${Intl.NumberFormat(
							'en-US',
							{
								style: 'currency',
								currency: 'USD',
							},
						).format(cost)}`,
					);
					this.pServerList = this.ns
						.getPurchasedServers()
						.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
				}
			}
		} else {
			return this.purchase(ram);
		}
	}
	run(): void {
		return this.upgradeAll();
	}
}
