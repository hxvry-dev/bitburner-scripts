import { NS } from '@ns';

interface Job {
	target: string;
	actionExecTime: number;
	actionExecEndTime: number;
	actionType: string;
	actionPort: number;
}

export class Batcher {
	ns: NS;
	constructor(ns: NS) {
		this.ns = ns;
	}
	createJob(target: string, execTime: number, actionType: string) {
		const job: Job = {
			target: target,
			actionExecTime: execTime,
			actionExecEndTime: Date.now() + execTime,
			actionType: actionType,
			actionPort: 69,
		};
		return JSON.stringify(job);
	}
}
