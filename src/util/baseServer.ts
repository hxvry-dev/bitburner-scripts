import { BaseServerArgs, WorkerScripts } from '@/util/types';
import { NS, Server } from '@ns';
import { Logger } from './logger';

export class BaseServer {
	protected ns: NS;
	public data: Server;
	public hostname: string;
	public args: BaseServerArgs;
	private logger: Logger;
	constructor(ns: NS, hostname?: string) {
		this.ns = ns;
		this.hostname = hostname ? hostname : this.ns.getHostname();

		const killLogs: string[] = ['scan', 'getHackingLevel', 'killall'];
		killLogs.forEach((log) => {
			this.ns.disableLog(log);
		});

		this.args = {
			host: '',
			serverList: '',
			isReady: false,
		};

		this.data = this.ns.getServer(this.hostname);
		this.logger = new Logger(ns);
	}
	hackPrograms = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
	workers: WorkerScripts = {
		hack: 'payloads/batchHack.js',
		grow: 'payloads/batchGrow.js',
		weaken: 'payloads/batchWeaken.js',
		all: ['payloads/batchHack.js', 'payloads/batchGrow.js', 'payloads/batchWeaken.js'],
	};
	legacyWorkers: WorkerScripts = {
		hack: 'scripts/hack_v2.js',
		grow: 'scripts/grow_v2.ts',
		weaken: 'scripts/weaken_v2.js',
		all: ['scripts/hack_v2.ts', 'scripts/weaken_v2.ts', 'scripts/grow_v2.ts'],
	};
	/**
	 * Initialize/set some defaults that we'll be using later.
	 */
	async init(): Promise<void> {
		this.args.serverList = this.recursiveScan().toString();
		this.args.host = this.hostname;
		this.killAll();
		if (this.isPrepped && this.isHackable) {
			this.args.isReady = true;
		}
		this.logger.deferLog('The server has successfully initialized!', 'info');
		this.logger.processQueue();
	}
	/**
	 * Copies the specified hacking scripts to the target server
	 * @param legacy Whether or not the server in question is using the legacy IServer method
	 */
	copy(legacy?: boolean): void {
		const scripts: WorkerScripts = legacy ? this.legacyWorkers : this.workers;
		for (const script of scripts.all) {
			if (!this.ns.fileExists(script, this.hostname)) {
				this.ns.scp(script, this.hostname, 'home');
			}
		}
		this.logger.deferLog(`Copied file(s) successfully! Filenames are as follows: ${scripts.all}`, 'info');
	}
	/**
	 * @returns An array of all server hostnames.
	 */
	recursiveScan(): Array<string> {
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
	 * @returns True if this server's security is at the lowest possible value, and that the money available is equal to the maximum money available on the server. False otherwise.
	 */
	get isPrepped(): boolean {
		if (this.data.minDifficulty == this.data.hackDifficulty && this.data.moneyAvailable == this.data.moneyMax) {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * @returns True if the server has money, administrator privileges, and if the hacking level required to hack the server is less than the players' hacking level. False otherwise.
	 */
	get isHackable(): boolean {
		if (
			this.data.moneyMax! > 0 &&
			this.data.hasAdminRights &&
			this.data.requiredHackingSkill! < this.ns.getHackingLevel()
		) {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * Attempts to gain root/adminstrator permissions on the target server.
	 */
	root(): void {
		let openPorts: number = 0;
		if (this.isHackable) {
			return;
		}
		try {
			this.ns.nuke(this.data.hostname);
		} catch {
			if (this.ns.fileExists('brutessh.exe', 'home')) {
				this.ns.brutessh(this.data.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('ftpcrack.exe', 'home')) {
				this.ns.ftpcrack(this.data.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('relaysmtp.exe', 'home')) {
				this.ns.relaysmtp(this.data.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('httpworm.exe', 'home')) {
				this.ns.httpworm(this.data.hostname);
				openPorts += 1;
			}
			if (this.ns.fileExists('sqlinject.exe', 'home')) {
				this.ns.sqlinject(this.data.hostname);
				openPorts += 1;
			}
			if (this.data.numOpenPortsRequired! <= openPorts) {
				this.ns.nuke(this.data.hostname);
				this.logger.deferLog(`Nuked! ${this.data.hostname}`, 'info');
				this.ns.scp(
					[
						'batcher/payloads/batchGrow.js',
						'batcher/payloads/batchHack.js',
						'batcher/payloads/batchWeaken.js',
					],
					this.data.hostname,
					'home',
				);
			}
		}
	}
	/**
	 * Attempts to force kill any/all scripts running on the target server.
	 */
	killAll(): void {
		const servers: string[] = this.recursiveScan();
		let killedScripts: number = 0;
		servers.forEach((target) => {
			if (target !== 'home') {
				const serverKilled: boolean = this.ns.killall(target);
				if (serverKilled) {
					killedScripts++;
				}
			}
		});

		if (killedScripts == 0) {
			this.logger.deferLog(`Zero Scripts to Kill, Aborting.`, 'info');
			return;
		} else {
			this.logger.deferLog(`# Killed Scripts This Run: ${killedScripts}`, 'info');
		}
	}
}

export async function main(ns: NS) {
	const baseServer: BaseServer = new BaseServer(ns, 'n00dles');
	await baseServer.init();
	ns.print(baseServer.args);
}
