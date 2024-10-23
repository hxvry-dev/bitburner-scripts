import { NS, Server } from '@ns';

export type BaseServerArgs = {
	serverList: string;
	isReady: boolean;
};
export type WorkerScripts = {
	hack: string;
	grow: string;
	weaken: string;
	all: Array<string>;
};

export class BaseServer {
	protected ns: NS;
	public data: Server;
	public hostname: string;
	public args: BaseServerArgs;
	constructor(ns: NS, hostname?: string) {
		this.ns = ns;
		this.hostname = hostname ? hostname : this.ns.getHostname();

		const killLogs: string[] = ['scan', 'getHackingLevel', 'killall'];
		killLogs.forEach((log) => {
			this.ns.disableLog(log);
		});

		this.args = {
			serverList: '',
			isReady: false,
		};

		this.data = this.ns.getServer(this.hostname);
	}
	hackPrograms = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
	workers: WorkerScripts = {
		hack: 'batcher/payloads/batchHack.js',
		grow: 'batcher/payloads/batchGrow.js',
		weaken: 'batcher/payloads/batchWeaken.js',
		all: ['batcher/payloads/batchHack.js', 'batcher/payloads/batchGrow.js', 'batcher/payloads/batchWeaken.js'],
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
	init(): void {
		this.args.serverList = this.recursiveScan().toString();
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
	 * Attempts to gain root/adminstrator permissions on the target server.
	 */
	root(): void {
		let openPorts: number = 0;
		if (this.data.hasAdminRights) {
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
			this.ns.tprint(`Nothing to kill, aborting...`);
			return;
		} else {
			this.ns.tprint(`# Killed Scripts This Run: ${killedScripts}`);
		}
	}
}

export async function main(ns: NS) {
	const baseServer: BaseServer = new BaseServer(ns, 'n00dles');
	baseServer.init();
	ns.print(baseServer.args);
}
