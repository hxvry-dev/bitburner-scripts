import { Logger } from '@/logger/logger';
import { NS, Server } from '@ns';
import { BatchScriptBundle } from '@/util/types';

export class BaseServer {
	protected ns: NS;
	protected logger: Logger;
	protected workers: BatchScriptBundle;
	protected serverList: string[];
	protected score: number;
	protected bestTarget: string;
	constructor(ns: NS) {
		this.ns = ns;
		this.logger = new Logger(ns, 'baseServerV2');
		this.workers = {
			hack: '',
			grow: '',
			weaken: '',
			all: [],
		};
		this.serverList = this.recursiveScan();
		this.score = 0;
		this.bestTarget = '';

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
	/**
	 * @returns An array of all server hostnames.
	 */
	protected recursiveScan(debug?: boolean): string[] {
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
		if (debug) this.logger.debug('Generated Server List => ', servers);
		this.serverList = servers;
		return servers;
	}
	/**
	 * Tries to copy the specified hacking scripts to all specified target servers
	 */
	protected copy(scripts: string[]): void {
		const hosts: string[] = this.recursiveScan();
		for (const hostname of hosts) {
			for (const script of scripts) {
				if (!this.ns.fileExists(script, hostname)) {
					this.ns.scp(script, hostname, 'home');
				}
			}
		}
	}
	/**
	 * Attempts to gain root/adminstrator permissions on the target server.
	 */
	root(): void {
		for (const server of this.serverList) {
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
						this.copy(this.workers.all);
					} catch {}
				default:
					break;
			}
		}
	}
	pathToServer(target: string): string[] {
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
	findTarget(): string {
		let bestScore: number = 0;
		const calculateScore = (server: string) => {
			const maxMoney: number = this.ns.getServerMaxMoney(server);
			const minSec: number = this.ns.getServerMinSecurityLevel(server);
			const weakenTime: number = this.ns.getWeakenTime(server);
			const hackTime: number = this.ns.getHackTime(server);
			return maxMoney / (minSec * (hackTime + weakenTime));
		};
		this.serverList.forEach((server) => {
			if (this.ns.hasRootAccess(server) && this.ns.getServerMaxMoney(server) > 0) {
				const score: number = calculateScore(server);
				if (score > bestScore) {
					bestScore = score;
					this.bestTarget = server;
				}
			}
		});
		return this.bestTarget;
	}
}
