import { Logger } from '@/logger/logger';
import { Workers } from '@/util/types';
import { NS } from '@ns';

/** This baseServer implementation will minimize the RAM footprint */
export class BaseServerV2 {
	protected ns: NS;
	protected logger: Logger;
	protected workers: Workers;
	protected serverList: string[];
	hostname: string;
	constructor(ns: NS, hostname?: string) {
		this.ns = ns;
		this.hostname = hostname ? hostname : this.ns.getHostname();
		this.logger = new Logger(ns, 'BaseServerV2');
		// Override this object with the implementations' actual workers.
		this.workers = {
			hack: '',
			grow: '',
			weaken: '',
			all: [],
		};
		this.serverList = [];
		[
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
		].forEach((log) => {
			this.ns.disableLog(log);
		});
		ns.clearLog();
	}
	/**
	 * Attempts to copy all worker scripts to all available hostnames
	 */
	protected copyWorkersToAllServers(workers: string[]) {
		for (const server of this.serverList) {
			try {
				this.ns.scp(workers, server, 'home');
			} catch {}
		}
	}
	/**
	 * Attempts to gain root/adminstrator permissions on the target server.
	 */
	protected rootAllHostnames(): void {
		for (const server of this.serverList) {
			switch (this.ns.getServerNumPortsRequired(server)) {
				case 5:
					if (this.ns.fileExists('SQLInject.exe', 'home')) this.ns.sqlinject(server);
				case 4:
					if (this.ns.fileExists('HTTPWorm.exe', 'home')) this.ns.httpworm(server);
				case 3:
					if (this.ns.fileExists('relaySMTP.exe', 'home')) this.ns.relaysmtp(server);
				case 2:
					if (this.ns.fileExists('FTPCrack.exe', 'home')) this.ns.ftpcrack(server);
				case 1:
					if (this.ns.fileExists('BruteSSH.exe', 'home')) this.ns.brutessh(server);
				case 0:
					try {
						this.ns.nuke(server);
						this.copyWorkersToAllServers(this.workers.all);
					} catch {}
				default:
					break;
			}
		}
	}
	protected recursiveScan(debug?: boolean, target?: string): void | string[] {
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
					if (target != '') {
						paths[server] = [...paths[current], server];
						if (server === target) {
							this.logger.debug(
								'Path to Server',
								`${paths[server].map((server) => `connect ${server}`).join('; ')};`,
							);
						}
					}
				}
			}
		}
		const servers: string[] = Array.from(visitedServers);
		if (debug) this.logger.debug('Generated Server List => ', servers);
		this.serverList = servers;
		return servers;
	}
	/**
	 *
	 * @param debug Prints all server hostnames as returned by the function
	 * @param target If provided, will return a connect string to the provided server. Useful for backdooring servers
	 * @returns
	 * Either the full list of server hostnames, or the connect string to the provided hostname
	 *
	 * If you're after the connect string, **DO NOT** wrap this call with `tprint`.
	 * It will return `undefined`, as the return signature of this function will be `void`
	 */
	_scanAll(debug?: boolean, target?: string): void | string[] {
		return this.recursiveScan(debug, target);
	}
	_root(): void {
		return this.rootAllHostnames();
	}
	_copy(workers: string[]) {
		return this.copyWorkersToAllServers(workers);
	}
}
