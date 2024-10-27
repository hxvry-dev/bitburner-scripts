import { NS } from '@ns';
import { BaseServerV2 } from './baseServer_v2';

export class PServer extends BaseServerV2 {
	protected maxRAM: number;
	protected pServerList: string[];
	protected mult: number;
	protected currentRam: number;
	protected newRam: number;
	constructor(ns: NS) {
		super(ns);
		this.mult = 3;
		this.currentRam = Math.pow(2, this.mult);
		this.newRam = Math.pow(2, this.mult + 1);
		this.maxRAM = Math.pow(2, 20);

		this.pServerList = this.ns.getPurchasedServers();
		if (this.pServerList.length > 0) {
			const potentialMaxRAM: number = this.pServerList.reduce<number>(
				(a, e) => Math.max(a, ns.getServerMaxRam(e)),
				3,
			);
			while (Math.pow(2, this.mult) < potentialMaxRAM) this.mult++;
		}
	}
	generateServerName() {
		const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		const length: number = 5;
		let result: string = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
	incMult(hostname: string) {
		if (Math.min(this.maxRAM, Math.pow(2, this.mult)) <= this.ns.getServerMaxRam(hostname)) {
			this.logger.info(`Bumping RAM multiplier from ${this.mult} to ${this.mult + 1}`);
			this.mult += 1;
		}
	}
	/**
	 * Gets the amount of possible threads for a specific hacking script
	 * @param scriptRAM Required amount of free RAM needed to execute a script
	 * @returns The maximum amount of threads possible given the constraints
	 */
	threadCount(scriptRAM: number, target: string): number {
		return Math.floor((this.ns.getServerMaxRam(target) - this.ns.getServerUsedRam(target)) / scriptRAM);
	}
	purchaseServer(ram: number) {
		const count: number = this.ns.getPurchasedServers().length;
		const canAfford: boolean = this.ns.getPurchasedServerCost(ram) <= this.ns.getServerMoneyAvailable('home');
		if (canAfford && this.ns.getPurchasedServerLimit() >= count) {
			this.ns.purchaseServer(`pserv-${this.generateServerName()}`, ram);
		}
	}
	upgradeServer(serverList: string[], currentMult: number) {
		serverList.forEach((server) => {
			const count: number = this.ns.getPurchasedServers().length;
			const mult: number = currentMult + 1;
			const newRam: number = Math.pow(2, mult);
			const canAfford: boolean =
				this.ns.getPurchasedServerCost(newRam) <= this.ns.getServerMoneyAvailable('home');
			if (canAfford && this.ns.getPurchasedServerLimit() >= count) {
				this.ns.upgradePurchasedServer(server, newRam);
			}
		});
	}
}
