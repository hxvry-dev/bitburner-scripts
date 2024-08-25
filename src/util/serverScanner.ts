import { NS } from '@ns';
import { IServer } from './server_v3';

export class ServerScanner {
	private readonly visited: Set<string> = new Set<string>();
	private readonly ns: NS;

	constructor(ns: NS) {
		this.ns = ns;
	}
	scanAllServers(): string[] {
		const queue: string[] = ['home'];
		const servers: string[] = [];
		while (queue.length > 0) {
			const current: string | undefined = queue.shift();
			if (this.visited.has(current!)) {
				continue;
			}
			this.visited.add(current!);
			servers.push(current!);
			const neighbors: string[] = this.ns.scan(current!);
			for (const neighbor of neighbors) {
				if (!this.visited.has(neighbor)) {
					queue.push(neighbor);
				}
			}
		}
		return servers;
	}
	getIServerList(): IServer[] {
		const servers: string[] = this.scanAllServers();
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
		const servers: IServer[] = this.getIServerList();
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
