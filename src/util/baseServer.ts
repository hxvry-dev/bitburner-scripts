import { NS, Server } from '@ns';

type IsHackable = Pick<Server, 'openPortCount' | 'numOpenPortsRequired'>;
type Packet = {
	port: number;
	payload: string;
};

type Args = {
	payloadPort: number;
	serverList: string;
	dispatchJob: boolean;
	isHackable: boolean;
	openPorts: number;
};

export class BaseServer {
	protected ns: NS;
	public data: Server;
	public hostname: string;
	public args: Args;
	constructor(ns: NS, hostname?: string) {
		this.ns = ns;
		this.hostname = hostname ? hostname : this.ns.getHostname();
		this.args = {
			payloadPort: 0,
			serverList: '',
			dispatchJob: false,
			isHackable: false,
			openPorts: 0,
		};
		this.data = this.ns.getServer();
	}
	recursiveScan() {
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
		this.args.serverList = servers.toString();
		return servers;
	}
	sendPacket(payload: string) {
		if (this.args.dispatchJob) {
			const packet: Packet = {
				port: this.args.payloadPort as number,
				payload: payload,
			};
			return packet;
		}
	}
	isHackable(): boolean {
		const isHackable: IsHackable = this.data;
		if (isHackable.numOpenPortsRequired === isHackable.openPortCount) {
			this.args.isHackable = true;
			this.args.dispatchJob = true;
			this.args.payloadPort = 22;
			return true;
		} else {
			this.root();
			this.args.isHackable = false;
			this.args.dispatchJob = false;
			return false;
		}
	}
	root(): void {
		this.args.openPorts = 0;
		if (this.args.isHackable) {
			this.args.openPorts = -1;
			return;
		}
		try {
			this.ns.nuke(this.data.hostname);
		} catch {
			if (this.ns.fileExists('brutessh.exe', 'home')) {
				this.ns.brutessh(this.data.hostname);
				this.args.openPorts += 1;
			}
			if (this.ns.fileExists('ftpcrack.exe', 'home')) {
				this.ns.ftpcrack(this.data.hostname);
				this.args.openPorts += 1;
			}
			if (this.ns.fileExists('relaysmtp.exe', 'home')) {
				this.ns.relaysmtp(this.data.hostname);
				this.args.openPorts += 1;
			}
			if (this.ns.fileExists('httpworm.exe', 'home')) {
				this.ns.httpworm(this.data.hostname);
				this.args.openPorts += 1;
			}
			if (this.ns.fileExists('sqlinject.exe', 'home')) {
				this.ns.sqlinject(this.data.hostname);
				this.args.openPorts += 1;
			}
			if (this.data.numOpenPortsRequired! <= this.args.openPorts) {
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
	const killLogs: string[] = ['scan'];
	killLogs.forEach((log) => {
		ns.disableLog(log);
	});

	const baseServer: BaseServer = new BaseServer(ns);
	baseServer.recursiveScan();
	baseServer.isHackable();
	baseServer.root();
	ns.print(baseServer.args);
}
