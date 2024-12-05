import { NS } from '@ns';
import { BatchJob } from './batchJob';
import { Logger } from '@/logger/logger';

export class BatcherV2 {
	protected ns: NS;
	private logger: Logger;
	constructor(ns: NS) {
		this.ns = ns;
		this.logger = new Logger(ns, 'BatcherV2');
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
	}
	prep(): BatchJob[] {
		return [] as BatchJob[];
	}
	protected recursiveScan(): string[] {
		const visited: Set<string> = new Set<string>();
		const queue: string[] = ['home'];
		const servers: string[] = [];
		while (queue.length > 0) {
			const current: string | undefined = queue.shift();
			if (visited.has(current!)) {
				continue;
			}
			visited.add(current!);
			servers.push(current!);
			const neighbors: string[] = this.ns.scan(current!);
			for (const neighbor of neighbors) {
				if (!visited.has(neighbor)) {
					queue.push(neighbor);
				}
			}
		}
		return servers;
	}
	protected rootAllTargets(): void {
		const hosts: string[] = this.recursiveScan();
		const scripts = [
			'v2/batcher/payloads/batchHack.js',
			'v2/batcher/payloads/batchWeaken.js',
			'v2/batcher/payloads/batchGrow.js',
		];
		for (const server of hosts) {
			switch (this.ns.getServerNumPortsRequired(server)) {
				case 5:
					if (this.ns.fileExists('SQLInject.exe')) this.ns.sqlinject(server);
				case 4:
					if (this.ns.fileExists('HTTPWorm.exe')) this.ns.httpworm(server);
				case 3:
					if (this.ns.fileExists('relaySMTP.exe')) this.ns.relaysmtp(server);
				case 2:
					if (this.ns.fileExists('FTPCrack.exe')) this.ns.ftpcrack(server);
				case 1:
					if (this.ns.fileExists('BruteSSH.exe')) this.ns.brutessh(server);
				case 0:
					try {
						this.ns.nuke(server);
						for (const hostname of hosts) {
							for (const script of scripts) {
								if (!this.ns.fileExists(script, hostname)) {
									this.ns.scp(script, hostname, 'home');
								}
							}
						}
					} catch {}
				default:
					break;
			}
		}
	}
	protected pathToServer(target: string): string[] {
		const serversToVisit: string[] = ['home'];
		const visitedServers: Set<string> = new Set(serversToVisit);
		const paths: { [key: string]: string[] } = { home: [] };
		while (serversToVisit.length > 0) {
			const current: string = serversToVisit.shift() as string;
			const neighbors: string[] = this.ns.scan(current);
			for (const server of neighbors) {
				if (!visitedServers.has(server)) {
					visitedServers.add(server);
					serversToVisit.push(server);
					paths[server] = [...paths[current], server];
					if (server === target) {
						return paths[server];
					}
				}
			}
		}
		return [];
	}
}
