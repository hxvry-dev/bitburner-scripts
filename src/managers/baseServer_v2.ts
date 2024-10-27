import { Logger } from '@/logger/logger';
import { NS } from '@ns';
import { Server } from '@ns';
import { BatchScriptBundle } from '@/util/types';

export class BaseServerV2 {
	public hostname: string;
	protected ns: NS;
	protected logger: Logger;
	protected data: Server;
	protected workers: BatchScriptBundle;
	protected hackPrograms: string[];
	protected serverList: string[];
	constructor(ns: NS, hostname?: string) {
		this.ns = ns;
		this.logger = new Logger(ns, 'baseServerV2');
		this.hostname = hostname ? hostname : this.ns.getHostname();
		this.data = this.ns.getServer(this.hostname);
		this.hackPrograms = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
		this.workers = {
			hack: '',
			grow: '',
			weaken: '',
			all: [],
		};
		this.serverList = this.recursiveScan();

		const killLogs: string[] = ['scan', 'getHackingLevel', 'killall'];
		killLogs.forEach((log) => {
			this.ns.disableLog(log);
		});
	}
	/**
	 * @returns An array of all server hostnames.
	 */
	protected recursiveScan(): Array<string> {
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
		this.logger.debug('Generated Server List => ', servers);
		this.serverList = servers;
		return servers;
	}
	/**
	 * Tries to copy the specified hacking scripts to the specified target server
	 */
	protected copyToSingleServer(): void {
		const scripts: BatchScriptBundle = this.workers;
		for (const script of scripts.all) {
			if (!this.ns.fileExists(script, this.hostname)) {
				this.ns.scp(script, this.hostname, 'home');
			}
		}
	}
	/**
	 * Attempts to gain root/adminstrator permissions on the target server.
	 */
	protected rootSingleServer(): void {
		let openPorts: number = 0;
		if (this.data.hasAdminRights) {
			return;
		}
		try {
			this.ns.nuke(this.hostname);
		} catch {
			if (this.ns.fileExists('brutessh.exe', 'home')) {
				this.ns.brutessh(this.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('ftpcrack.exe', 'home')) {
				this.ns.ftpcrack(this.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('relaysmtp.exe', 'home')) {
				this.ns.relaysmtp(this.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('httpworm.exe', 'home')) {
				this.ns.httpworm(this.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('sqlinject.exe', 'home')) {
				this.ns.sqlinject(this.hostname);
				openPorts += 1;
			}
			if (this.data.numOpenPortsRequired! <= openPorts) {
				this.ns.nuke(this.hostname);
				this.ns.scp(
					[
						'batcher/payloads/batchGrow.js',
						'batcher/payloads/batchHack.js',
						'batcher/payloads/batchWeaken.js',
					],
					this.hostname,
					'home',
				);
			}
		}
	}
}
