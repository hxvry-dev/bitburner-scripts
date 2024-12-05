import { NS } from '@ns';
import { BatchThreads, Timings } from '../types';
import { V2Ports } from '../const';

export class BatchJob {
	protected ns: NS;
	protected pid: number;
	protected timings: Timings;
	protected port: number;
	constructor(ns: NS) {
		this.ns = ns;
		this.pid = 0;
		this.timings = {
			hTime: 0,
			wTime: 0,
			gTime: 0,
			delays: {
				hDelay: 0,
				wDelay: 0,
				w2Delay: 0,
				gDelay: 0,
			},
		};
		this.port = V2Ports.job;
	}

	calc(target: string): Timings {
		let hTime: number = 0;
		let wTime: number = 0;
		let gTime: number = 0;
		let hDelay: number = 0;
		let w2Delay: number = 0;
		let gDelay: number = 0;

		hTime = this.ns.getHackTime(target);
		gTime = this.ns.getGrowTime(target);
		wTime = this.ns.getWeakenTime(target);

		hDelay = wTime - hTime - 100;
		gDelay = wTime - gTime + 100;
		w2Delay = gDelay + gTime - wTime;

		return {
			hTime: hTime,
			wTime: wTime,
			gTime: gTime,
			delays: {
				hDelay: hDelay,
				wDelay: 0,
				w2Delay: w2Delay,
				gDelay: gDelay,
			},
		} as Timings;
	}
	getThreads(target: string): BatchThreads {
		let hackPercent: number = 0.25;
		let hThreads: number = 0;
		let wThreads: number = 0;
		let w2Threads: number = 0;
		let gThreads: number = 0;

		if (this.ns.getServerMoneyAvailable(target) > 0) {
			hackPercent = this.ns.getServerMaxMoney(target) / this.ns.getServerMoneyAvailable(target);
		}

		hThreads = this.ns.hackAnalyzeThreads(target, this.ns.getServerMaxMoney(target) * 0.25);
		gThreads = Math.ceil(this.ns.growthAnalyze(target, hackPercent));
		// wThreads is Weaken threads required after `hack`ing the server.
		wThreads = Math.ceil(hThreads * 0.05);
		// w2Threads refers to Weaken threads required after `grow`ing the server.
		w2Threads = Math.ceil((gThreads * 0.004) / 0.05);
		return {
			hThreads: hThreads,
			wThreads: wThreads,
			w2Threads: w2Threads,
			gThreads: gThreads,
		} as BatchThreads;
	}
	genJobs(): BatchJob[] {
		const jobs: BatchJob[] = [];
		const job: BatchJob = new BatchJob(this.ns);
		return jobs;
	}
}

export async function main(ns: NS) {
	const temp: BatchJob = new BatchJob(ns);
	ns.tprint(temp.calc('n00dles'));
	ns.tprint(temp.getThreads('n00dles'));
	ns.tprint(
		`Max Money: ${ns.getServerMaxMoney('n00dles')}\nMoney Available: ${ns.getServerMoneyAvailable(
			'n00dles',
		)}\n\nMult: ${ns.getServerMaxMoney('n00dles') / ns.getServerMoneyAvailable('n00dles')}`,
	);
	//ns.tprint(temp.getThreads('n00dles'));
}
