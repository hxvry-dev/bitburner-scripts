import { Logger } from '@/logger/logger';
import { BaseServer } from '@/util/baseServer';
import { NS } from '@ns';

type BatchThreads = {
	hackThreads: number;
	w1Threads: number;
	growThreads: number;
	w2Threads: number;
	totalThreads: number;
};
export class Batcher extends BaseServer {
	protected logger: Logger;
	constructor(ns: NS) {
		super(ns);
		this.logger = new Logger(ns, 'batcher');
	}
	// https://github.com/emirdero/bitburner_scripts/blob/main/pwn.js#L92
	private genBatches(target: string): BatchThreads {
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
		const totalThreads: number = hackThreads + w1Threads + growThreads + w2Threads;
		return {
			hackThreads: hackThreads,
			w1Threads: w1Threads,
			growThreads: growThreads,
			w2Threads: w2Threads,
			totalThreads: totalThreads,
		};
	}
	// https://github.com/emirdero/bitburner_scripts/blob/main/prep.js#L42
	private prepThreads(target: string) {
		const growAmount: number = this.ns.getServerMaxMoney(target) / this.ns.getServerMoneyAvailable(target);
		const growThreads: number = Math.ceil(this.ns.growthAnalyze(target, growAmount));
		const growOffset: number = this.ns.growthAnalyzeSecurity(growThreads) / 0.05;
		const distToMinSec: number =
			(this.ns.getServerSecurityLevel(target) - this.ns.getServerMinSecurityLevel(target)) / 0.05;
		const weakenThreads = Math.ceil(growOffset + distToMinSec);
		return { growThreads: growThreads, weakenThreads: weakenThreads };
	}
	// https://github.com/emirdero/bitburner_scripts/blob/main/prep.js#L18
	prep(target: string) {
		const ramPerThread: number = this.ns.getScriptRam(this.workers.grow, 'home');
		let { growThreads, weakenThreads } = this.prepThreads(target);
		const growRatio = growThreads / (growThreads + weakenThreads);
		const weakenRatio = weakenThreads / (growThreads + weakenThreads);
		for (const server of this.args.serverList) {
			const availableRam: number = this.ns.getServerMaxRam(server) - this.ns.getServerUsedRam(server);
			const availableThreads: number = Math.floor(availableRam / ramPerThread);
			if (availableThreads == 0) continue;
			const gt: number = Math.min(Math.floor(growRatio * availableThreads));
			const wt: number = Math.min(Math.floor(weakenRatio * availableThreads), weakenThreads);
			if (gt > 0 && this.ns.hasRootAccess(server)) this.ns.exec(this.workers.grow, server, gt, gt, 0, target);
			if (wt > 0 && this.ns.hasRootAccess(server)) this.ns.exec(this.workers.weaken, server, wt, wt, 0, target);
			growThreads -= gt;
			weakenThreads -= wt;
			if (growThreads <= 0 && weakenThreads <= 0) break;
		}
	}
	// https://github.com/emirdero/bitburner_scripts/blob/main/pwn.js#L45
	async execute(target: string, reservedRam: number): Promise<void> {
		this.copy(target);
		const weakenTime: number = this.ns.getWeakenTime(target);
		const delayInc: number = 1;
		let runningDelay: number = 0;
		const hDelay: number = Math.floor(weakenTime - this.ns.getHackTime(target));
		const gDelay: number = Math.floor(weakenTime - this.ns.getGrowTime(target)) + 2 * delayInc;
		const ramPerThread: number = this.ns.getScriptRam(this.workers.grow, 'home');
		const { hackThreads, w1Threads, growThreads, w2Threads, totalThreads } = this.genBatches(target);
		if (w1Threads == 0 || w2Threads == 0 || growThreads == 0 || hackThreads == 0) {
			this.logger.error('Could not spin up batch due to error in thread allocation!', {
				hackThreads,
				w1Threads,
				w2Threads,
				growThreads,
				totalThreads,
			});
			return;
		}
		for (const server of this.args.serverList) {
			let availableRam: number = this.ns.getServerMaxRam(server) - this.ns.getServerUsedRam(server);
			const availableThreads: number = Math.floor(availableRam / ramPerThread);
			if (server == 'home') availableRam -= reservedRam;
			const cycles: number = Math.floor(availableThreads / totalThreads);
			for (let i = 0; i < Math.min(cycles, 10000); i++) {
				this.ns.exec(this.workers.hack, server, hackThreads, hackThreads, hDelay + runningDelay, target);
				this.ns.exec(this.workers.weaken, server, w1Threads, w1Threads, delayInc + runningDelay, target);
				this.ns.exec(this.workers.grow, server, growThreads, growThreads, gDelay + runningDelay, target);
				this.ns.exec(this.workers.weaken, server, w2Threads, w2Threads, delayInc * 3 + runningDelay, target);
				runningDelay += 4 * delayInc;
			}
		}
		for (const server of this.args.serverList) {
			let availableRam: number = this.ns.getServerMaxRam(server) - this.ns.getServerUsedRam(server);
			if (server == 'home') availableRam -= reservedRam;
			const availableThreads: number = Math.floor(availableRam / ramPerThread);
			const growThreads: number = Math.floor(availableThreads / 2);
			const weakenThreads: number = Math.ceil(availableThreads / 2);
			if (growThreads > 0)
				this.ns.exec(this.workers.grow, server, growThreads, growThreads, gDelay + runningDelay + 100, target);
			if (weakenThreads > 0)
				this.ns.exec(this.workers.weaken, server, weakenThreads, weakenThreads, runningDelay + 200, target);
		}
		await this.ns.sleep(weakenTime + runningDelay + 2000);
		return;
	}
	/**
	 * @returns True if this server's security is at the lowest possible value, and that the money available is equal to the maximum money available on the server. False otherwise.
	 */
	isPrepped(target: string): boolean {
		if (
			this.ns.getServerMinSecurityLevel(target) == this.ns.getServerSecurityLevel(target) &&
			this.ns.getServerMoneyAvailable(target) == this.ns.getServerMaxMoney(target)
		) {
			return true;
		}
		return false;
	}
}
