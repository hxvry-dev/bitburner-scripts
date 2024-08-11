import { Server, NS } from '@ns';
import { pad } from './util_v2';

interface ServerPortInformation {
	/** Whether or not the SSH Port is open */
	readonly sshPortOpen: boolean;
	/** Whether or not the FTP port is open */
	readonly ftpPortOpen: boolean;
	/** Whether or not the SMTP Port is open */
	readonly smtpPortOpen: boolean;
	/** Whether or not the HTTP Port is open */
	readonly httpPortOpen: boolean;
	/** Whether or not the SQL Port is open */
	readonly sqlPortOpen: boolean;
	/** Number of open ports required in order to gain admin/root access */
	readonly numOpenPortsRequired?: number;
	/** How many ports are currently opened on the server */
	readonly openPortCount?: number;
}

interface ServerInformation {
	/** Hostname. Must be unique */
	readonly hostname: string;
	/** IP Address. Must be unique */
	readonly ip: string;
	/** Flag indicating whether player has admin/root access to this server */
	readonly hasAdminRights: boolean;
	/** How many CPU cores this server has. Affects magnitude of grow and weaken ran from this server. */
	readonly cpuCores: number;
	/** Flag indicating whether player is currently connected to this server */
	readonly isConnectedTo: boolean;
	/** Name of company/faction/etc. that this server belongs to, not applicable to all Servers */
	readonly organizationName: string;
	/** Flag indicating whether this is a purchased server */
	readonly purchasedByPlayer: boolean;
	/** Flag indicating whether this server has a backdoor installed by a player */
	readonly backdoorInstalled?: boolean;
}

interface SecurityInformation {
	/** Server's initial server security level at creation. */
	readonly baseDifficulty?: number;
	/** Server Security Level */
	readonly hackDifficulty?: number;
	/** Minimum server security level that this server can be weakened to */
	readonly minDifficulty?: number;
	/** Hacking level required to hack this server */
	readonly requiredHackingSkill?: number;
}

interface RAMInformation {
	/** RAM (GB) used. i.e. unavailable RAM */
	readonly ramUsed: number;
	/** Total amount of RAM (GB) available on this server */
	readonly maxRam: number;
	/** RAM (GB) available on this server at any given time */
	readonly freeRam: number;
}

interface MoneyInformation {
	/** How much money currently resides on the server and can be hacked */
	readonly moneyAvailable?: number;
	/** Maximum amount of money that this server can hold */
	readonly moneyMax?: number;
	/** Growth effectiveness statistic. Higher values produce more growth with ns.grow() */
	readonly serverGrowth?: number;
}

interface InfoDump {
	ports: ServerPortInformation;
	serverInfo: ServerInformation;
	securityInfo: SecurityInformation;
	RAMInfo: RAMInformation;
	moneyInfo: MoneyInformation;
}

export class Queue extends Array {
	add(val: string | IServer) {
		this.push(val);
	}
	remove() {
		return this.shift();
	}
	removeElem(elem: string | IServer) {
		this.forEach((item, index) => {
			if (item === elem) {
				this.splice(index, 1);
			}
		});
	}
	peek() {
		return this[0];
	}
	isEmpty() {
		return this.length === 0;
	}
}

export class IServer {
	constructor(public ns: NS, public host?: string, protected scripts?: string[]) {
		this.ns = ns;
		this.host = host;
		this.scripts = ['scripts/_grow.js', 'scripts/_hack.js', 'scripts/_weaken.js'];
	}
	get data(): Server {
		return this.ns.getServer();
	}
	get generalInfo(): ServerInformation {
		return {
			hostname: this.data.hostname,
			ip: this.data.ip,
			hasAdminRights: this.data.hasAdminRights,
			cpuCores: this.data.cpuCores,
			isConnectedTo: this.data.isConnectedTo,
			organizationName: this.data.organizationName,
			purchasedByPlayer: this.data.purchasedByPlayer,
			backdoorInstalled: this.data.backdoorInstalled,
		};
	}
	get serverPortInfo(): ServerPortInformation {
		return {
			numOpenPortsRequired: this.data.numOpenPortsRequired,
			openPortCount: this.data.openPortCount,
			sshPortOpen: this.data.sshPortOpen,
			ftpPortOpen: this.data.ftpPortOpen,
			smtpPortOpen: this.data.smtpPortOpen,
			httpPortOpen: this.data.httpPortOpen,
			sqlPortOpen: this.data.sqlPortOpen,
		};
	}
	get securityInfo(): SecurityInformation {
		return {
			baseDifficulty: this.data.baseDifficulty,
			hackDifficulty: this.data.hackDifficulty,
			minDifficulty: this.data.minDifficulty,
			requiredHackingSkill: this.data.requiredHackingSkill,
		};
	}
	get RAMInfo(): RAMInformation {
		return {
			ramUsed: this.data.ramUsed,
			maxRam: this.data.maxRam,
			freeRam: this.data.maxRam - this.data.ramUsed,
		};
	}
	get moneyInfo(): MoneyInformation {
		return {
			moneyAvailable: this.data.moneyAvailable,
			moneyMax: this.data.moneyMax,
			serverGrowth: this.data.serverGrowth,
		};
	}
	get info(): InfoDump {
		return {
			ports: this.serverPortInfo,
			serverInfo: this.generalInfo,
			securityInfo: this.securityInfo,
			RAMInfo: this.RAMInfo,
			moneyInfo: this.moneyInfo,
		};
	}
	threadCount(scriptRAM: number): number {
		return Math.floor(this.RAMInfo.freeRam / scriptRAM);
	}
	pushServerOntoQueue(queue: Queue, server: IServer): void {
		return queue.add(server);
	}
	popServerOffOfQueue(queue: Queue, server: IServer): void {
		return queue.removeElem(server);
	}
	generateServerReport(ns: NS) {
		let output: string = `

| ${pad('', 52, '-')} |
| ${pad(' Generated Server Report For: ' + this.info.serverInfo.hostname + ' ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | General Server Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Organization Name: ' + this.info.serverInfo.organizationName + ' ', 52, '-')} |
| ${pad(' IP: ' + this.info.serverInfo.ip + ' ', 52, '-')} |
| ${pad(' Is Rooted: ' + this.info.serverInfo.backdoorInstalled + ' ', 52, '-')} |
| ${pad(' Has Admin Rights: ' + this.info.serverInfo.hasAdminRights + ' ', 52, '-')} |
| ${pad(' CPU Cores: ' + this.info.serverInfo.cpuCores + ' ', 52, '-')} |
| ${pad(' Is Connected To: ' + this.info.serverInfo.isConnectedTo + ' ', 52, '-')} |
| ${pad(' Is Owned By Player: ' + this.info.serverInfo.purchasedByPlayer + ' ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server RAM Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Max RAM: ' + this.info.RAMInfo.maxRam + ' GB ', 52, '-')} |
| ${pad(' Used RAM: ' + this.info.RAMInfo.ramUsed + ' GB ', 52, '-')} |
| ${pad(' Free RAM: ' + this.info.RAMInfo.freeRam + ' GB ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server Port Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Number of Open Ports: ' + this.info.ports.openPortCount + ' ', 52, '-')} |
| ${pad(' Number of Open Ports Required: ' + this.info.ports.numOpenPortsRequired + ' ', 52, '-')} |
| ${pad(' FTP Port Open:  ' + this.info.ports.ftpPortOpen + ' ', 52, '-')} |
| ${pad(' HTTP Port Open: ' + this.info.ports.httpPortOpen + ' ', 52, '-')} |
| ${pad(' SMTP Port Open: ' + this.info.ports.smtpPortOpen + ' ', 52, '-')} |
| ${pad(' SQL Port Open:  ' + this.info.ports.sqlPortOpen + ' ', 52, '-')} |
| ${pad(' SSH Port Open:  ' + this.info.ports.sshPortOpen + ' ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server Security Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Base Hack Difficulty: ' + this.info.securityInfo.baseDifficulty + ' ', 52, '-')} |
| ${pad(' Hack Difficulty: ' + this.info.securityInfo.hackDifficulty?.toFixed(6) + ' ', 52, '-')} |
| ${pad(' Minimum Hack Difficulty: ' + this.info.securityInfo.minDifficulty + ' ', 52, '-')} |
| ${pad(' Required Hacking Skill: ' + this.info.securityInfo.requiredHackingSkill + ' ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server Money Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Max Money Available: ' + this.info.moneyInfo.moneyMax + ' ', 52, '-')} |
| ${pad(' Money Available: ' + this.info.moneyInfo.moneyAvailable + ' ', 52, '-')} |
| ${pad(' Server Growth: ' + this.info.moneyInfo.serverGrowth + ' ', 52, '-')} |`;

		return ns.tprint(output);
	}
	/**
	 * https://github.com/abyo/bitburner-typescript/blob/763ec03a2866be7916330f2c03e403148da692c6/src/compiler/utilities.ts#L26
	 * @param ns Netscript API
	 * @param current The server you are logged into
	 * @param visited An array of all previously visited servers
	 * @returns The array of all visited servers
	 */
	listServers(ns: NS, current: string = 'home', visited = new Set<string>()): IServer[] {
		let connections: string[] = ns.scan(current);
		let purchasedServers: string[] = ns.getPurchasedServers();
		connections = connections.filter((s) => !visited.has(s));
		connections.forEach((server) => {
			visited.add(server);
			return this.listServers(ns, server, visited);
		});
		purchasedServers = purchasedServers.filter((s) => !visited.has(s));
		for (let i = 0; i < purchasedServers.length; i++) {
			connections.push(purchasedServers[i]);
		}
		// Get list as IServers
		const servers: string[] = Array.from(visited.keys());
		const data: IServer[] = [];
		for (const server of servers) {
			data.push(new IServer(ns, server));
		}
		return data;
	}
	root(): void {
		try {
			this.ns.nuke(this.data.hostname);
		} catch (e) {
			this.ns.print(e);
		}
		try {
			this.ns.brutessh(this.data.hostname);
			this.ns.ftpcrack(this.data.hostname);
			this.ns.relaysmtp(this.data.hostname);
			this.ns.httpworm(this.data.hostname);
			this.ns.sqlinject(this.data.hostname);
		} catch (e) {
			this.ns.print(e);
		}
	}
}
