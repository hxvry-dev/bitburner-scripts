import { NS } from '@ns';

type HackScripts = {
	hack: string;
	grow: string;
	weaken: string;
	all: string[];
};

export class WaterfallHack {
	ns: NS;
	hackScripts: HackScripts;
	constructor(ns: NS) {
		this.ns = ns;
		this.hackScripts = {
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
	}
	/**
	 * Attempts to gain root/adminstrator permissions on the target server.
	 */
	root(host: string): void {
		switch (this.ns.getServerNumPortsRequired(host)) {
			case 5:
				if (this.ns.fileExists('SQLInject.exe')) this.ns.sqlinject(host);
			case 4:
				if (this.ns.fileExists('HTTPWorm.exe')) this.ns.httpworm(host);
			case 3:
				if (this.ns.fileExists('relaySMTP.exe')) this.ns.relaysmtp(host);
			case 2:
				if (this.ns.fileExists('FTPCrack.exe')) this.ns.ftpcrack(host);
			case 1:
				if (this.ns.fileExists('BruteSSH.exe')) this.ns.brutessh(host);
			case 0:
				try {
					this.ns.nuke(host);
					this.copy(this.hackScripts.all);
				} catch {}
			default:
				break;
		}
	}
	/**
	 * @returns An array of all server hostnames.
	 */
	recursiveScan(): string[] {
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
	/**
	 * Tries to copy the specified hacking scripts to all specified target servers
	 */
	copy(scripts: string[]): void {
		const hosts: string[] = this.recursiveScan();
		for (const hostname of hosts) {
			for (const script of scripts) {
				if (!this.ns.fileExists(script, hostname)) {
					this.ns.scp(script, hostname, 'home');
				}
			}
		}
	}
	isMinSec(hostname: string): boolean {
		return this.ns.getServerSecurityLevel(hostname) === this.ns.getServerMinSecurityLevel(hostname);
	}
	isMaxMoney(hostname: string): boolean {
		return this.ns.getServerMoneyAvailable(hostname) === this.ns.getServerMaxMoney(hostname);
	}
}

export async function main(ns: NS) {
	const hacker: WaterfallHack = new WaterfallHack(ns);
	while (true) {
		const serverList: string[] = hacker.recursiveScan();
		for (const server of serverList) {
			if (ns.hasRootAccess(server)) {
				let numThreads: number = Math.floor(
					ns.getServerMaxRam(server) / ns.getScriptRam(hacker.hackScripts.weaken),
				);
				if (server === 'home') {
					numThreads = Math.floor(
						ns.getServerMaxRam(server) / ns.getScriptRam(hacker.hackScripts.weaken) -
							ns.getScriptRam('proto/init.js', 'home'),
					);
				}
				if (!hacker.isMinSec(server)) {
					if (numThreads > 0) ns.exec(hacker.hackScripts.weaken, server, numThreads, 'n00dles', numThreads);
				} else if (!hacker.isMaxMoney(server)) {
					if (numThreads > 0) ns.exec(hacker.hackScripts.grow, server, numThreads, 'n00dles', numThreads);
				} else {
					if (numThreads > 0) ns.exec(hacker.hackScripts.hack, server, numThreads, 'n00dles', numThreads);
				}
			} else {
				hacker.root(server);
			}
		}
		await ns.sleep(100);
	}
}
