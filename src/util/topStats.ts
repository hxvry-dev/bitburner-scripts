import { NS, Server } from '@ns';
import { BaseServer } from '@/util/baseServer';
import { Logger } from '@/logger/logger';

export class TopStats extends BaseServer {
	protected servers: Server[] = [];
	constructor(ns: NS) {
		super(ns);
		this.servers = [];
		this.logger = new Logger(ns, 'topStats');
	}
	getServers() {
		const serverList: string[] = this.recursiveScan()
			.sort((a, b) => this.ns.getServerMaxRam(b) - this.ns.getServerMaxRam(a))
			.slice(0, 5);
		serverList.forEach((server) => {
			this.servers.push(this.ns.getServer(server));
		});
		return this.servers;
	}
	generateProgressBar(value: number, size: number = 26): string {
		const prog: number = Math.round(size * value);
		const emptyProg: number = size - prog;
		const progText = '▇'.repeat(prog);
		const emptyProgText: string = '—'.repeat(emptyProg);
		const percentText: string = Math.round(value * 100) + `%`;
		const bar: string = `[${progText}${emptyProgText}] ${percentText}`;
		return bar;
	}
	genBlock(servers: Server[]): void {
		servers.forEach((s) => {
			const progBar: string = this.generateProgressBar(s.ramUsed / s.maxRam);
			this.ns.print(`
${`―`.repeat(60)}―
│ Server Hostname: ${s.hostname}${` `.repeat(60 - `│ Server Hostname: ${s.hostname}`.length)}│
│ Server Max RAM: ${s.maxRam} GB${` `.repeat(60 - `│ Server Max RAM: ${s.maxRam} GB`.length)}│
│ Server RAM Used: ${s.ramUsed} GB${` `.repeat(60 - `│ Server RAM Used: ${s.ramUsed} GB`.length)}│
│ Total RAM Usage: ${progBar}${` `.repeat(60 - `│ Total RAM Usage: ${progBar}`.length)}│
${`―`.repeat(60)}―
`);
		});
	}
	doUpdate(): void {
		return this.genBlock(this.getServers());
	}
}

export async function main(ns: NS): Promise<void> {
	const topStats: TopStats = new TopStats(ns);
	const pid: number = ns.pid;
	ns.tail(pid);
	ns.resizeTail(625, 850, pid);
	ns.moveTail(1025, 250, ns.pid);
	while (true) {
		await ns.sleep(1000);
		topStats.doUpdate();
	}
}
