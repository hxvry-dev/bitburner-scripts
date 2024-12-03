import { NS } from '@ns';
import { JobTask, Timings } from '../types';
import { V2Ports } from '../const';

export class BatchJob {
	protected ns: NS;
	protected pid: number;
	protected task: JobTask;
	protected timings: Timings;
	protected port: number;
	constructor(ns: NS) {
		this.ns = ns;
		this.pid = 0;
		this.task = 'init';
		this.timings = {
			hTime: 0,
			wTime: 0,
			gTime: 0,
			delays: {
				hDelay: 0,
				wDelay: 0,
				gDelay: 0,
			},
		};
		this.port = V2Ports.job;
	}
}
