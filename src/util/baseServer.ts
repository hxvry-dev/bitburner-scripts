import { NS, Server } from '@ns';

type PortInfo = Pick<
	Server,
	| 'ftpPortOpen'
	| 'sqlPortOpen'
	| 'sshPortOpen'
	| 'httpPortOpen'
	| 'smtpPortOpen'
	| 'openPortCount'
	| 'numOpenPortsRequired'
>;

export class BaseServer {
	private ns: NS;
	private host: string;
	private data: Server;
	constructor(ns: NS, host?: string) {
		this.ns = ns;
		this.host = host ? host : this.ns.getHostname();
		this.data = this.ns.getServer(this.host);
	}
}
