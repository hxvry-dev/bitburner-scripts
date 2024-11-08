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
			hack: 'payloads/_hack.js',
			grow: 'payloads/_grow.js',
			weaken: 'payloads/_weaken.js',
			all: ['payloads/_hack.js', 'payloads/_grow.js', 'payloads/_weaken.js'],
		};
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
				this.ns.nuke(host);
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
}

export async function main(ns: NS) {
	const hacker: WaterfallHack = new WaterfallHack(ns);
	while (true) {
		const serverList: string[] = hacker.recursiveScan();
		for (const server of serverList) {
			const numThreads: number = Math.floor(
				(ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / ns.getScriptRam(hacker.hackScripts.weaken),
			);
			hacker.root(server);
			hacker.copy(hacker.hackScripts.all);
			if (!hacker.isMinSec(server)) {
				ns.exec(hacker.hackScripts.weaken, server);
			}
		}
		await ns.sleep(100);
	}
}
