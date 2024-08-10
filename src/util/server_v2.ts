import { Server, NS } from '@ns';

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

export class Queue extends Array {
	add(val: string | IServer) {
		this.push(val);
	}
	remove() {
		return this.shift();
	}
	peek() {
		return this[0];
	}
	isEmpty() {
		return this.length === 0;
	}
}

export class IServer {
	constructor(public ns: NS, public host: string) {
		this.ns = ns;
		this.host = host;
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
	threadCount(scriptRAM: number): number {
		return Math.floor(this.RAMInfo.freeRam / scriptRAM);
	}
	pushServerOntoQueue(queue: Queue, server: IServer): void {
		return queue.add(server);
	}
	popServerOffOfQueue(queue: Queue, server: IServer): void {
		for (let i = 0; i < queue.length; i++) {
			console.log(queue[i]);
		}
	}
	/**
	 * https://github.com/abyo/bitburner-typescript/blob/763ec03a2866be7916330f2c03e403148da692c6/src/compiler/utilities.ts#L26
	 * @param ns Netscript API
	 * @param current The server you are logged into
	 * @param visited An array of all previously visited servers
	 * @returns The array of all visited servers
	 */
	listServers(ns: NS, current: string = 'home', visited = new Set<string>()): string[] {
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
		return Array.from(visited.keys());
	}
	/**
	 *
	 * @param ns Netscript API
	 * @returns Array of IServers
	 */
	listIServers(ns: NS): IServer[] {
		const servers: string[] = this.listServers(ns);
		const data: IServer[] = [];
		for (const server of servers) {
			data.push(new IServer(ns, server));
		}
		return data;
	}
	/**
	 *
	 * @param length Total length of the generated Slug
	 * @returns The generated Slug
	 */
	generateServerSlug(length?: number): string {
		const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		let result: string = '';
		if (!length || length < 5) {
			length = 5;
		}
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
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
