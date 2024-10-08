import { NS, Server } from '@ns';

type IsHackable = Pick<Server, 'openPortCount' | 'numOpenPortsRequired'>;

export class BaseServer {
	private ns: NS;
	private host: string;
	private data: Server;
	private args: Record<string, string | boolean | number>;
	constructor(ns: NS, host?: string) {
		this.ns = ns;
		this.host = host ? host : this.ns.getHostname();
		this.data = this.ns.getServer(this.host);
		this.args = {};
	}
	isHackable(): boolean {
		const isHackable: IsHackable = this.data;
		if (isHackable.numOpenPortsRequired === isHackable.openPortCount) {
			this.args.isHackable = true;
			return true;
		} else {
			this.root();
			this.args.isHackable = false;
			return false;
		}
	}
	/**
	 * Attempts to gain access to a server by using any/all hacking methods available to the player
	 */
	root(): void {
		let openPorts: number = 0;
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
}

export async function main(ns: NS) {
	const baseServer: BaseServer = new BaseServer(ns);
}
