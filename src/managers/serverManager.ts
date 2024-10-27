import { Logger } from '@/logger/logger';
import { NS } from '@ns';
import { BaseServerV2 } from './baseServer_v2';
import { BatchScriptBundle } from '@/util/types';

export class ServerManager extends BaseServerV2 {
	logger: Logger;
	constructor(ns: NS) {
		super(ns);
		this.logger = new Logger(this.ns, 'ServerManager');
	}
	/**
	 * Tries to copy the specified hacking scripts to all target servers
	 */
	protected copyToAll(): void {
		const scripts: BatchScriptBundle = this.workers;
		for (let i = 0; i < this.serverList.length; i++) {
			for (const script of scripts.all) {
				if (!this.ns.fileExists(script, this.serverList[i])) {
					this.ns.scp(script, this.serverList[i], 'home');
				}
			}
		}
	}
	/**
	 * Attempts to force kill any/all scripts running on the target server.
	 */
	protected killAll(): void {
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
			this.logger.warn(`Nothing to kill. Aborting...`);
			return;
		} else {
			this.logger.info(`# Killed Scripts This Run: ${killedScripts}`);
		}
	}
	/**
	 * Attempts to gain root/adminstrator permissions on all target servers.
	 */
	protected tryRootAll(): void {
		for (let i = 0; i < this.serverList.length; i++) {
			let hostname = this.serverList[i];
			let openPorts: number = 0;
			if (this.data.hasAdminRights) {
				return;
			}
			try {
				this.ns.nuke(hostname);
			} catch {
				if (this.ns.fileExists('brutessh.exe', 'home')) {
					this.ns.brutessh(hostname);
					openPorts += 1;
				}
				if (this.ns.fileExists('ftpcrack.exe', 'home')) {
					this.ns.ftpcrack(hostname);
					openPorts += 1;
				}
				if (this.ns.fileExists('relaysmtp.exe', 'home')) {
					this.ns.relaysmtp(hostname);
					openPorts += 1;
				}
				if (this.ns.fileExists('httpworm.exe', 'home')) {
					this.ns.httpworm(hostname);
					openPorts += 1;
				}
				if (this.ns.fileExists('sqlinject.exe', 'home')) {
					this.ns.sqlinject(hostname);
					openPorts += 1;
				}
				if (this.ns.getServerNumPortsRequired(hostname) <= openPorts) {
					this.ns.nuke(hostname);
					this.ns.scp(
						[
							'batcher/payloads/batchGrow.js',
							'batcher/payloads/batchHack.js',
							'batcher/payloads/batchWeaken.js',
						],
						hostname,
						'home',
					);
				}
			}
		}
	}
}
