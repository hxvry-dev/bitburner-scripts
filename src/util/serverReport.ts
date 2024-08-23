import { NS } from '@ns';
import { IServer } from './server_v2';
import { listIServers, pad } from './util_v2';

export const serverReportSlug = (server: IServer) => `

| ${pad('', 52, '-')} |
| ${pad(' Generated Server Report For: ' + server.generalInfo.hostname + ' ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | General Server Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Organization Name: ' + server.generalInfo.organizationName + ' ', 52, '-')} |
| ${pad(' IP: ' + server.generalInfo.ip + ' ', 52, '-')} |
| ${pad(' Is Rooted: ' + server.generalInfo.backdoorInstalled + ' ', 52, '-')} |
| ${pad(' Has Admin Rights: ' + server.generalInfo.hasAdminRights + ' ', 52, '-')} |
| ${pad(' CPU Cores: ' + server.generalInfo.cpuCores + ' ', 52, '-')} |
| ${pad(' Is Connected To: ' + server.generalInfo.isConnectedTo + ' ', 52, '-')} |
| ${pad(' Is Owned By Player: ' + server.generalInfo.purchasedByPlayer + ' ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server RAM Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Max RAM: ' + server.RAMInfo.maxRam + ' GB ', 52, '-')} |
| ${pad(' Used RAM: ' + server.RAMInfo.ramUsed + ' GB ', 52, '-')} |
| ${pad(' Free RAM: ' + server.RAMInfo.freeRam + ' GB ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server Port Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Number of Open Ports: ' + server.serverPortInfo.openPortCount + ' ', 52, '-')} |
| ${pad(' Number of Open Ports Required: ' + server.serverPortInfo.numOpenPortsRequired + ' ', 52, '-')} |
| ${pad(' FTP Port Open:  ' + server.serverPortInfo.ftpPortOpen + ' ', 52, '-')} |
| ${pad(' HTTP Port Open: ' + server.serverPortInfo.httpPortOpen + ' ', 52, '-')} |
| ${pad(' SMTP Port Open: ' + server.serverPortInfo.smtpPortOpen + ' ', 52, '-')} |
| ${pad(' SQL Port Open:  ' + server.serverPortInfo.sqlPortOpen + ' ', 52, '-')} |
| ${pad(' SSH Port Open:  ' + server.serverPortInfo.sshPortOpen + ' ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server Security Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Base Hack Difficulty: ' + server.securityInfo.baseDifficulty + ' ', 52, '-')} |
| ${pad(' Hack Difficulty: ' + server.securityInfo.hackDifficulty?.toFixed(6) + ' ', 52, '-')} |
| ${pad(' Minimum Hack Difficulty: ' + server.securityInfo.minDifficulty + ' ', 52, '-')} |
| ${pad(' Required Hacking Skill: ' + server.securityInfo.requiredHackingSkill + ' ', 52, '-')} |

| ${pad('', 52, '-')} |
| ${pad(' | Server Money Information | ', 52, '-')} |
| ${pad('', 52, '-')} |

| ${pad(' Max Money Available: ' + server.moneyInfo.moneyMax + ' ', 52, '-')} |
| ${pad(' Money Available: ' + server.moneyInfo.moneyAvailable + ' ', 52, '-')} |
| ${pad(' Server Growth: ' + server.moneyInfo.serverGrowth + ' ', 52, '-')} |`;

export function generateServerReport(ns: NS, singleServer?: boolean, server?: IServer, write: boolean = false): void {
	const servers: IServer[] = listIServers(ns);
	if (singleServer && server) {
		const output = serverReportSlug(server);
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
			const output = serverReportSlug(server);
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
