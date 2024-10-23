import { BaseServer } from '@/util/baseServer';
import { PrepThreadObject } from '@/util/types';
import { NS } from '@ns';

export class Batcher extends BaseServer {
	constructor(ns: NS) {
		super(ns);
		if (this.isPrepped && this.isHackable) {
			this.args.isReady = true;
			this.logger.info('The server has successfully initialized!');
		}
	}
	/**
	 * @returns True if this server's security is at the lowest possible value, and that the money available is equal to the maximum money available on the server. False otherwise.
	 */
	get isPrepped(): boolean {
		if (this.data.minDifficulty == this.data.hackDifficulty && this.data.moneyAvailable == this.data.moneyMax) {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * @returns True if the server has money, administrator privileges, and if the hacking level required to hack the server is less than the players' hacking level. False otherwise.
	 */
	get isHackable(): boolean {
		if (
			this.data.moneyMax! > 0 &&
			this.data.hasAdminRights &&
			this.data.requiredHackingSkill! < this.ns.getHackingLevel()
		) {
			return true;
		} else {
			return false;
		}
	}
	prepTarget(target: string, hosts: string[]) {
		const costPerThread: number = this.ns.getScriptRam('batcher/payloads/batchWeaken.js', 'home');
		let { growThreads, weakenThreads }: PrepThreadObject = this.prepThreads(target);
		const gRatio: number = growThreads / (growThreads + weakenThreads);
		const wRatio: number = weakenThreads / (growThreads + weakenThreads);
		for (const server of hosts) {
			const usableRam: number = this.ns.getServerMaxRam(server) - this.ns.getServerUsedRam(server);
			const availableThreads: number = Math.floor(usableRam / costPerThread);
			if (availableThreads == 0) continue;
			const gThreads: number = Math.min(Math.floor(gRatio * availableThreads));
			const wThreads: number = Math.min(Math.floor(wRatio * availableThreads), weakenThreads);
			if (gThreads > 0) this.ns.exec(this.workers.grow, server, gThreads, gThreads, 0, target);
			if (wThreads > 0) this.ns.exec(this.workers.weaken, server, wThreads, wThreads, 0, target);
			growThreads -= gThreads;
			weakenThreads -= wThreads;
			if (growThreads <= 0 && weakenThreads <= 0) break;
		}
	}
	// https://github.com/emirdero/bitburner_scripts/blob/main/prep.js
	prepThreads(target: string): PrepThreadObject {
		const growAmount: number = this.ns.getServerMaxMoney(target) / this.ns.getServerMoneyAvailable(target);
		const growThreads: number = Math.ceil(this.ns.growthAnalyze(target, growAmount));
		const growOffset: number = this.ns.growthAnalyzeSecurity(growThreads) / 0.05;
		const distToMinSecurity: number =
			(this.ns.getServerSecurityLevel(target) - this.ns.getServerMinSecurityLevel(target)) / 0.05;
		const weakenThreads: number = Math.ceil(growOffset + distToMinSecurity);
		this.logger.info(`Threads on ${target} prepped! GT: ${growThreads}\tWT: ${weakenThreads}`);
		return { growThreads: growThreads, weakenThreads: weakenThreads } as PrepThreadObject;
	}
}
