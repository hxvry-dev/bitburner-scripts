import { NS } from '@ns';
import { BaseServer } from './baseServer';
import { Logger } from '@/logger/logger';

export class PServer extends BaseServer {
	protected logger: Logger;
	protected maxRam: number;
	protected mult: number;
	protected isFull: boolean;
	pServerList: string[];
	constructor(ns: NS) {
		super(ns);
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
		while (ram < potentialMaxRam) {
			this.mult++;
			ram = Math.min(this.maxRam, Math.pow(2, this.mult));
		}
		return ram;
	}
	protected _purchase(ram: number): void {
		const cost: number = this.ns.getPurchasedServerCost(ram);
		const cash: number = this.ns.getServerMoneyAvailable('home');
		const name: string = `pserv-${this.generateServerName()}`;
		if (this.pServerList.length < this.ns.getPurchasedServerLimit()) {
			if (cost <= cash) {
				this.ns.purchaseServer(name, ram);
				this.logger.info(`Purchased Server (Hostname: ${name}) with ${ram} GB of RAM!`);
				this.pServerList = this.ns
					.getPurchasedServers()
					.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
			}
		}
	}
	protected _upgrade(hostname: string): void {
		let ram: number = this.calcRam();
		const cost: number = this.ns.getPurchasedServerUpgradeCost(hostname, ram);
		const cash: number = this.ns.getServerMoneyAvailable('home');
		const sorted: string[] = this.pServerList.sort(
			(a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b),
		);
		if (this.isFull && cost <= cash) {
			if (ram <= this.ns.getServerMaxRam(hostname)) {
				this.mult = this.mult + 1;
				ram = Math.min(this.maxRam, Math.pow(2, this.mult));
				this.ns.upgradePurchasedServer(sorted[0], ram);
				this.logger.info(`Purchased Server (Hostname: ${hostname}) successfully upgraded to ${ram} GB of RAM!`);
				this.pServerList = this.ns
					.getPurchasedServers()
					.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
			} else {
				this.ns.upgradePurchasedServer(sorted[0], ram);
				this.logger.info(`Purchased Server (Hostname: ${hostname}) successfully upgraded to ${ram} GB of RAM!`);
				this.pServerList = this.ns
					.getPurchasedServers()
					.sort((a, b) => this.ns.getServerMaxRam(a) - this.ns.getServerMaxRam(b));
			}
		} else if (!this.isFull && cost <= cash) {
			this._purchase(ram);
		}
	}
	buy(): void {
		const ram: number = this.calcRam();
		return this._purchase(ram);
	}
	run(hostname: string): void {
		return this._upgrade(hostname);
	}
}
