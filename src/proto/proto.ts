import { BaseServer } from '@/util/baseServer';
import { PServer } from '@/util/purchasedServer';
import { BatchScriptBundle } from '@/util/types';
import { NS } from '@ns';

export class WaterfallHack extends BaseServer {
	workers: BatchScriptBundle;
	constructor(ns: NS) {
		super(ns);
		this.serverList = this.recursiveScan().sort((a, b) => this.ns.getServerMaxRam(b) - this.ns.getServerMaxRam(a));
		this.workers = {
			hack: 'proto/payloads/_hack.js',
			grow: 'proto/payloads/_grow.js',
			weaken: 'proto/payloads/_weaken.js',
			all: ['proto/payloads/_hack.js', 'proto/payloads/_grow.js', 'proto/payloads/_weaken.js'],
		};
		const killLogs: string[] = [
			'scan',
			'sleep',
			'exec',
			'getHackingLevel',
			'getServerMaxRam',
			'getServerUsedRam',
			'getServerMinSecurityLevel',
			'getServerSecurityLevel',
			'getServerMaxMoney',
			'getServerMoneyAvailable',
			'getServerNumPortsRequired',
			'brutessh',
			'ftpcrack',
			'relaysmtp',
			'httpworm',
			'sqlinject',
			'nuke',
		];
		killLogs.forEach((log) => {
			this.ns.disableLog(log);
		});
		ns.clearLog();
		this.root();
		this.copy(this.workers.all);
	}
	isMinSec(hostname: string): boolean {
		return this.ns.getServerSecurityLevel(hostname) === this.ns.getServerMinSecurityLevel(hostname);
	}
	isMaxMoney(hostname: string): boolean {
		return this.ns.getServerMoneyAvailable(hostname) === this.ns.getServerMaxMoney(hostname);
	}
	_serverList(): string[] {
		return this.recursiveScan().sort((a, b) => this.ns.getServerMaxRam(b) - this.ns.getServerMaxRam(a));
	}
}

export async function main(ns: NS) {
	const hacker: WaterfallHack = new WaterfallHack(ns);
	const pServer: PServer = new PServer(ns);
	while (true) {
		await pServer.run();
		const serverList: string[] = hacker._serverList().sort((a, b) => ns.getServerMaxRam(a) - ns.getServerMaxRam(b));
		for (const server of serverList) {
			if (ns.hasRootAccess(server)) {
				let numThreads: number = Math.floor(
					ns.getServerMaxRam(server) / ns.getScriptRam(hacker.workers.weaken),
				);
				if (server === 'home') {
					numThreads = Math.floor(
						ns.getServerMaxRam(server) / ns.getScriptRam(hacker.workers.weaken) -
							ns.getScriptRam('proto/proto.js', 'home'),
					);
				}
				if (!hacker.isMinSec(server)) {
					if (numThreads > 0) ns.exec(hacker.workers.weaken, server, numThreads, 'n00dles', numThreads);
				} else if (!hacker.isMaxMoney(server)) {
					if (numThreads > 0) ns.exec(hacker.workers.grow, server, numThreads, 'n00dles', numThreads);
				} else {
					if (numThreads > 0) ns.exec(hacker.workers.hack, server, numThreads, 'n00dles', numThreads);
				}
			}
		}
		await ns.sleep(100);
	}
}
