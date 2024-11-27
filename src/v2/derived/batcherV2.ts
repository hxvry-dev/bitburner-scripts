import { NS } from '@ns';
import { BaseServerV2 } from '../util/baseServerV2';
import { Logger } from '@/logger/logger';

export class BatcherV2 extends BaseServerV2 {
	protected margin: number;
	protected hackPercent: number;

	constructor(ns: NS) {
		super(ns);
		this.workers = {
			hack: 'v2/payloads/_hack.js',
			grow: 'v2/payloads/_grow.js',
			weaken: 'v2/payloads/_weaken.js',
			all: ['v2/payloads/_hack.js', 'v2/payloads/_grow.js', 'v2/payloads/_weaken.js'],
		};
		this.logger = new Logger(ns, 'BatcherV2');
		this.rootAllHostnames();
		this.copyWorkersToAllServers(this.workers.all);
		this.margin = 1.1;
		this.hackPercent = 0.25;
	}
	protected genBatchThreads(target: string) {
		const moneyPerBatch: number = this.ns.getServerMaxMoney(target) * this.hackPercent;
		const hackThreads: number = Math.floor(this.ns.hackAnalyzeThreads(target, moneyPerBatch));
		const growThreads: number = Math.ceil(this.margin * this.ns.growthAnalyze(target, 1 / (1 - this.hackPercent)));
		const secChangePerHack: number = this.margin * this.ns.hackAnalyzeSecurity(hackThreads);
		const secChangePerGrow: number = this.margin * this.ns.growthAnalyzeSecurity(growThreads);
		let w1Threads: number = Math.ceil(secChangePerHack / 0.05);
		let w2Threads: number = Math.ceil(secChangePerHack / 0.05);
		while (this.ns.weakenAnalyze(w1Threads) < secChangePerHack) w1Threads += 5;
		while (this.ns.weakenAnalyze(w2Threads) < secChangePerGrow) w2Threads += 5;
		const totalThreads: number = hackThreads + w1Threads + growThreads + w2Threads;
		this.logger.debug('BatchThreads', {
			hackThreads: hackThreads,
			w1Threads: w1Threads,
			growThreads: growThreads,
			w2Threads: w2Threads,
			totalThreads: totalThreads,
		});
		return {
			hackThreads: hackThreads,
			w1Threads: w1Threads,
			growThreads: growThreads,
			w2Threads: w2Threads,
			totalThreads: totalThreads,
		};
	}
}
