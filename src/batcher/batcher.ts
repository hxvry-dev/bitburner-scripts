import { Logger } from '@/logger/logger';
import { BaseServer } from '@/util/baseServer';
import { NS } from '@ns';

type BatchThreads = {
	hackThreads: number;
	w1Threads: number;
	growThreads: number;
	w2Threads: number;
};
export class Batcher extends BaseServer {
	protected logger: Logger;
	constructor(ns: NS) {
		super(ns);
		this.logger = new Logger(ns, 'batcher');
		if (this.isPrepped && this.isHackable) {
			this.args.isReady = true;
		}
	}
	// https://github.com/emirdero/bitburner_scripts/blob/main/pwn.js#L92
	genBatches(target: string): BatchThreads {
		const marginForError: number = 1.01;
		const hackPercent: number = 0.25; // How much money we want to hack per batch.
		const moneyGenerated: number = this.ns.getServerMaxMoney(target) * hackPercent;
		const hackThreads: number = Math.floor(this.ns.hackAnalyzeThreads(target, moneyGenerated));
		const growThreads: number = Math.ceil(marginForError * this.ns.growthAnalyze(target, 1 / (1 - hackPercent)));
		const secChangePerHack: number = marginForError * this.ns.hackAnalyzeSecurity(hackThreads);
		const secChangePerGrow: number = marginForError * this.ns.growthAnalyzeSecurity(growThreads);
		let w1Threads: number = Math.ceil(secChangePerHack / 0.05);
		let w2Threads: number = Math.ceil(secChangePerGrow / 0.05);
		while (this.ns.weakenAnalyze(w1Threads) < secChangePerHack) w1Threads += 5;
		while (this.ns.weakenAnalyze(w2Threads) < secChangePerGrow) w2Threads += 5;
		return { hackThreads: hackThreads, w1Threads: w1Threads, growThreads: growThreads, w2Threads: w2Threads };
	}
	execute(target: string, hosts: string[], reservedRam: number) {
		const weakenTime: number = this.ns.getWeakenTime(target);
		const delayInc: number = 1;
		let runningDelay: number = 0;
		const hDelay: number = Math.floor(weakenTime - this.ns.getHackTime(target));
		const gDelay: number = Math.floor(weakenTime - this.ns.getGrowTime(target)) + 2 * delayInc;
		const ramPerThread: number = this.ns.getScriptRam(this.workers.grow, 'home');
		const { hackThreads, w1Threads, growThreads, w2Threads } = this.genBatches(target);
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
}
