import { NS, Server } from '@ns';
import { ServerManager } from './serverManager';

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

export class IServer extends ServerManager {
	private host: string;
	private data: Server;
	constructor(ns: NS, host?: string) {
		super(ns);
		this.host = host ? host : this.ns.getHostname();
		this.data = this.ns.getServer(this.host);
	}
	hackPrograms = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];

	scriptNames = {
		hack: 'scripts/hack_v2.js',
		weaken: 'scripts/weaken_v2.js',
		grow: 'scripts/grow_v2.js',
	};
	get hostname(): string {
		return this.data.hostname;
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
	/**
	 * Gets the amount of possible threads for a specific hacking script
	 * @param scriptRAM Required amount of free RAM needed to execute a script
	 * @returns The maximum amount of threads possible given the constraints
	 */
	threadCount(scriptRAM: number): number {
		return Math.floor(this.RAMInfo.freeRam / scriptRAM);
	}
	/**
	 * Copies the specified hacking scripts to the target server
	 * @param ns Netscript API
	 * @param hostname Hostname of the server you want to copy files to
	 */
	copy(): void {
		const scripts = ['scripts/grow_v2.js', 'scripts/hack_v2.js', 'scripts/weaken_v2.js'];

		for (const script of scripts) {
			if (!this.ns.fileExists(script, this.host)) {
				this.ns.scp(script, this.host, 'home');
			}
		}
	}
	/**
	 *
	 * @param ns Netscript API
	 * @param scriptName The name of the script being run against the `target` server
	 * @param hostname The hostname of the server running the script
	 * @param threads The number of threads being used to run the script
	 * @param target The target? server that the script is attacking/growing/weakening
	 */
	exec(hostname: string, scriptName: string, threadCount: number): void {
		try {
			this.ns.exec(scriptName, hostname, { threads: threadCount }, 'n00dles');
		} catch {
			/* empty */
		}
	}
	/**
	 * Attempts to gain access to a server by using any/all hacking methods available to the player
	 */
	root(): void {
		try {
			this.ns.nuke(this.data.hostname);
		} catch {
			/* empty */
		}
		try {
			this.ns.brutessh(this.data.hostname);
			this.ns.ftpcrack(this.data.hostname);
			this.ns.relaysmtp(this.data.hostname);
			this.ns.httpworm(this.data.hostname);
			this.ns.sqlinject(this.data.hostname);
			this.ns.nuke(this.data.hostname);
		} catch {
			/* empty */
		}
	}
	killAll(): void {
		const servers: string[] = this.recursiveScan();
		let killedServers: number = 0;
		servers.forEach((target) => {
			if (!this.ns.scriptRunning('auto.js', 'home')) {
				this.ns.scriptKill('util/killall.js', 'home');
			}
			if (target !== 'home') {
				const serverKilled: boolean = this.ns.killall(target);
				if (serverKilled) {
					killedServers++;
				}
			}
		});

		if (killedServers == 0) {
			this.ns.tprint('Nothing to kill! Aborting');
			return;
		} else {
			this.ns.print(`Num Scripts Killed: ${killedServers}`);
		}
	}
	get IServerList(): IServer[] {
		const servers: string[] = this.recursiveScan();
		const IServerList: IServer[] = [];
		servers.forEach((server) => {
			const newServer: IServer = new IServer(this.ns, server);
			IServerList.push(newServer);
		});
		return IServerList;
	}
	/**
	 *
	 * @param str The string to pad
	 * @param length The total length
	 * @param separator The filler character
	 * @returns The formatted string
	 */
	pad = (str: string, length: number, separator: string) =>
		str.padStart((str.length + length) / 2, separator).padEnd(length, separator);

	serverReportSlug = (server: IServer) => `

| ${this.pad('', 52, '-')} |
| ${this.pad(' Generated Server Report For: ' + server.generalInfo.hostname + ' ', 52, '-')} |
| ${this.pad('', 52, '-')} |

| ${this.pad('', 52, '-')} |
| ${this.pad(' | General Server Information | ', 52, '-')} |
| ${this.pad('', 52, '-')} |

| ${this.pad(' Organization Name: ' + server.generalInfo.organizationName + ' ', 52, '-')} |
| ${this.pad(' IP: ' + server.generalInfo.ip + ' ', 52, '-')} |
| ${this.pad(' Is Rooted: ' + server.generalInfo.backdoorInstalled + ' ', 52, '-')} |
| ${this.pad(' Has Admin Rights: ' + server.generalInfo.hasAdminRights + ' ', 52, '-')} |
| ${this.pad(' CPU Cores: ' + server.generalInfo.cpuCores + ' ', 52, '-')} |
| ${this.pad(' Is Connected To: ' + server.generalInfo.isConnectedTo + ' ', 52, '-')} |
| ${this.pad(' Is Owned By Player: ' + server.generalInfo.purchasedByPlayer + ' ', 52, '-')} |

| ${this.pad('', 52, '-')} |
| ${this.pad(' | Server RAM Information | ', 52, '-')} |
| ${this.pad('', 52, '-')} |

| ${this.pad(' Max RAM: ' + server.RAMInfo.maxRam + ' GB ', 52, '-')} |
| ${this.pad(' Used RAM: ' + server.RAMInfo.ramUsed + ' GB ', 52, '-')} |
| ${this.pad(' Free RAM: ' + server.RAMInfo.freeRam + ' GB ', 52, '-')} |

| ${this.pad('', 52, '-')} |
| ${this.pad(' | Server Port Information | ', 52, '-')} |
| ${this.pad('', 52, '-')} |

| ${this.pad(' Number of Open Ports: ' + server.serverPortInfo.openPortCount + ' ', 52, '-')} |
| ${this.pad(' Number of Open Ports Required: ' + server.serverPortInfo.numOpenPortsRequired + ' ', 52, '-')} |
| ${this.pad(' FTP Port Open:  ' + server.serverPortInfo.ftpPortOpen + ' ', 52, '-')} |
| ${this.pad(' HTTP Port Open: ' + server.serverPortInfo.httpPortOpen + ' ', 52, '-')} |
| ${this.pad(' SMTP Port Open: ' + server.serverPortInfo.smtpPortOpen + ' ', 52, '-')} |
| ${this.pad(' SQL Port Open:  ' + server.serverPortInfo.sqlPortOpen + ' ', 52, '-')} |
| ${this.pad(' SSH Port Open:  ' + server.serverPortInfo.sshPortOpen + ' ', 52, '-')} |

| ${this.pad('', 52, '-')} |
| ${this.pad(' | Server Security Information | ', 52, '-')} |
| ${this.pad('', 52, '-')} |

| ${this.pad(' Base Hack Difficulty: ' + server.securityInfo.baseDifficulty + ' ', 52, '-')} |
| ${this.pad(' Hack Difficulty: ' + server.securityInfo.hackDifficulty?.toFixed(6) + ' ', 52, '-')} |
| ${this.pad(' Minimum Hack Difficulty: ' + server.securityInfo.minDifficulty + ' ', 52, '-')} |
| ${this.pad(' Required Hacking Skill: ' + server.securityInfo.requiredHackingSkill + ' ', 52, '-')} |

| ${this.pad('', 52, '-')} |
| ${this.pad(' | Server Money Information | ', 52, '-')} |
| ${this.pad('', 52, '-')} |

| ${this.pad(' Max Money Available: ' + server.moneyInfo.moneyMax + ' ', 52, '-')} |
| ${this.pad(' Money Available: ' + server.moneyInfo.moneyAvailable + ' ', 52, '-')} |
| ${this.pad(' Server Growth: ' + server.moneyInfo.serverGrowth + ' ', 52, '-')} |`;

	generateServerReport(ns: NS, singleServer?: boolean, server?: IServer, write: boolean = false): void {
		const servers: IServer[] = this.IServerList;
		if (singleServer && server) {
			const output = this.serverReportSlug(server);
			if (write) {
				if (server.generalInfo.hostname == '.') {
					return ns.write(`stats/PERIOD-${server.generalInfo.hostname}-ServerStats.txt`, output, 'w');
				}
				return ns.write(`stats/${server.generalInfo.hostname}-ServerStats.txt`, output, 'w');
			} else {
				return ns.print(output);
			}
		} else {
			servers.forEach((server) => {
				const output = this.serverReportSlug(server);
				if (write) {
					if (server.generalInfo.hostname == '.') {
						return ns.write(`stats/PERIOD-${server.generalInfo.hostname}-ServerStats.txt`, output, 'w');
					}
					return ns.write(`stats/${server.generalInfo.hostname}-ServerStats.txt`, output, 'w');
				} else {
					return ns.print(output);
				}
			});
		}
	}
}
