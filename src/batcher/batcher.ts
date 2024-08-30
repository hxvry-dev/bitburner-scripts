import { NS } from '@ns';

interface DatabaseOpts {
	pid: number;
	jobs: Job[];
}

class Job {
	ns: NS;
	pid: number;
	threadsToRunWith: number;
	scriptName: string;
	constructor(ns: NS) {
		this.ns = ns;
		this.pid = this.ns.pid;
		this.threadsToRunWith = 0;
		this.scriptName = '';
	}
}

class Database {
	private readonly ns: NS;
	readonly options: DatabaseOpts | undefined;
	constructor(ns: NS, options: DatabaseOpts = { pid: 0, jobs: [] }) {
		this.ns = ns;
		this.options = options;
	}
}
