import { NS } from '@ns';
import { listIServers } from './util';
import { IServer } from './server';
import { corners, pad } from './const';

export function main(ns: NS): void {
	const write: boolean = ns.args[0] as boolean;
	const servers: IServer[] = listIServers(ns);
	servers.forEach((server) => {
		//prettier-ignore
		const serverData: string = `
${corners.topLeft}${pad(' ' + server.generalInfo.hostname + ' ', corners.maxLength, corners.borderHoriz)}${corners.topRight}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('IP: ' + server.generalInfo.ip + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Rooted: ' + server.generalInfo.hasAdminRights + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Backdoored: ' + server.generalInfo.backdoorInstalled + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Connected: ' + server.generalInfo.isConnectedTo + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Cores: ' + server.generalInfo.cpuCores + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Organization: ' + orgName(server.generalInfo.organizationName) + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Is Purchased: ' + server.generalInfo.purchasedByPlayer + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.dividerLeft}${pad('', corners.maxLength, corners.borderHoriz)}${corners.dividerRight}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Max RAM: ' + gbToTB(server.ram.maxRam), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Free RAM: ' + gbToTB(server.ram.freeRam), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Used RAM: ' + gbToTB(server.ram.ramUsed), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.dividerLeft}${pad('', corners.maxLength, corners.borderHoriz)}${corners.dividerRight}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('FTP Port Open: ' + server.ports.ftpPortOpen + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('HTTP Port Open: ' + server.ports.httpPortOpen + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('SMTP Port Open: ' + server.ports.smtpPortOpen + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('SQL Port Open: ' + server.ports.sqlPortOpen + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('SSH Port Open: ' + server.ports.sshPortOpen + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Number of Ports Required to Backdoor: ' + server.ports.numOpenPortsRequired + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Number of Open Ports: ' + server.ports.openPortCount + ' ', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.dividerLeft}${pad('', corners.maxLength, corners.borderHoriz)}${corners.dividerRight}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Max RAM: ' + gbToTB(server.ram.maxRam), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Used RAM: ' + gbToTB(server.ram.ramUsed), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Free RAM: ' + gbToTB(server.ram.freeRam), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.dividerLeft}${pad('', corners.maxLength, corners.borderHoriz)}${corners.dividerRight}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Base Hack Difficulty: ' + server.security.baseDifficulty, corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Minimum Hack Difficulty: ' + server.security.minDifficulty, corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Hack Difficulty: ' + server.security.hackDifficulty, corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Required Hacking Level: ' + server.security.requiredHackingSkill, corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.dividerLeft}${pad('', corners.maxLength, corners.borderHoriz)}${corners.dividerRight}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Maximum Money Possible: ' + formatMoney(server.money.moneyMax!), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Max Money Available: ' + formatMoney(server.money.moneyAvailable!), corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('Server Growth Rate: ' + (server.money.serverGrowth! / 100) + '%', corners.maxLength, ' ')}${corners.borderVert}
${corners.borderVert}${pad('', corners.maxLength, ' ')}${corners.borderVert}
${corners.bottomLeft}${pad('', corners.maxLength, corners.borderHoriz)}${corners.bottomRight}
`
		if (write) {
			if (server.generalInfo.hostname == '.') {
				return ns.write(`stats/PERIOD-${server.generalInfo.hostname}-ServerStats.txt`, serverData, 'w');
			}
			return ns.write(`stats/${server.generalInfo.hostname}-ServerStats.txt`, serverData, 'w');
		} else {
			return ns.tprint(serverData);
		}
	});
}

function formatMoney(number: number): string {
	const format: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	});
	if (number) {
		return format.format(number);
	} else {
		return `${number}`;
	}
}

function orgName(hostname: string): string {
	if (typeof hostname === 'undefined' || hostname == '') {
		return 'Owned by Player';
	} else {
		return hostname;
	}
}

function gbToTB(ram: number): string {
	const terabytes: number = ram / 1000;
	if (terabytes >= 1) {
		return `${terabytes.toFixed(3)} TB`;
	} else if (terabytes === 0) {
		return `${ram.toFixed(0)} GB`;
	} else {
		return `${ram.toFixed(3)} GB`;
	}
}
