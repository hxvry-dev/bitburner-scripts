import { Logger } from '@/logger/logger';
import { NS } from '@ns';
import { BaseServerV2 } from '../util/baseServerV2';

export class PurchasedServerV2 extends BaseServerV2 {
	protected serverList: string[];
	protected ramMult: number;
	protected maxMult: number;
	protected maxRam: number;
	constructor(ns: NS, hostname?: string) {
		super(ns, hostname);
		this.logger = new Logger(ns, 'PServerV2');
		this.serverList = (this.recursiveScan() as string[])
			.filter((server) => server.toLowerCase().startsWith('pserv-'))
			.sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b));
		this.workers = {
			hack: 'v2/payloads/_hack.js',
			grow: 'v2/payloads/_grow.js',
			weaken: 'v2/payloads/_weaken.js',
			all: ['v2/payloads/_hack.js', 'v2/payloads/_grow.js', 'v2/payloads/_weaken.js'],
		};
		this.ramMult = 3;
		this.maxMult = 20;
		this.maxRam = Math.pow(2, 20);
	}
	protected generateServerName(): string {
		const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		const length: number = 5;
		let result: string = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
	protected calcRam(): number {
		let ram: number = Math.min(this.maxRam, Math.pow(2, this.ramMult));
		const ramToBeat: number = this.ns.getServerMaxRam(this.serverList[0]);
		while (ram < ramToBeat) {
			ram = Math.min(this.maxRam, Math.pow(2, this.ramMult));
			this.ramMult++;
		}
		return ram;
	}
	protected getMult(ram: number): number {
		return Math.log2(ram);
	}
	async upgrade(): Promise<void> {
		let cash: number = this.ns.getServerMoneyAvailable('home');
		let ramToBuy: number = this.calcRam();
		const isFull: boolean = this.serverList.length === 25;
		if (isFull) {
			for (const server of this.serverList) {
				if (ramToBuy >= this.ns.getServerMaxRam(server)) {
					const newMult: number = this.getMult(this.ns.getServerMaxRam(server)) + 1;
					const newRam: number = Math.min(this.maxRam, Math.pow(2, newMult));
					const cost = this.ns.getPurchasedServerUpgradeCost(server, newRam);
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
					}
				}
			}
		} else {
			ramToBuy = 8;
			const cost: number = this.ns.getPurchasedServerCost(ramToBuy); // $ 440,000
			while (cost <= cash && !isFull) {
				const name: string = `pserv-${this.generateServerName()}`;
				this.ns.purchaseServer(name, ramToBuy);
				this.copyWorkersToAllServers(this.workers.all);
				await this.ns.sleep(100);
				this.logger.info(
					`Purchased Server (Hostname: ${name}) with 8 GB of RAM for ${Intl.NumberFormat('en-US', {
						style: 'currency',
						currency: 'USD',
					}).format(cost)}`,
				);
				cash -= cost;
			}
		}
	}
	get pServerList() {
		return this.serverList;
	}
}
