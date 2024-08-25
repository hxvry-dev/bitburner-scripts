import { NS } from '@ns';
import { IServer } from './util/server_v3';
import { ServerManager } from './util/serverManager';
import { ServerScanner } from './util/serverScanner';

export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.enableLog('exec');
	if (!ns.scriptRunning('./util/killAll.js', 'home')) {
		ns.exec('./util/killAll.js', 'home');
	}

	const rootedHosts: string[] = [];

	while (true) {
		const serverManager: ServerManager = new ServerManager(ns);
		const serverScanner: ServerScanner = new ServerScanner(ns);
		const servers: IServer[] = serverScanner.getIServerList();

		for (const server of servers) {
			server.copy();
			if (!server.generalInfo.hasAdminRights) {
				server.root();
				if (server.generalInfo.hasAdminRights) {
					rootedHosts.push(server.generalInfo.hostname);
				}
			}
			if (
				server.generalInfo.hostname !== 'home' &&
				server.securityInfo.requiredHackingSkill! <= ns.getHackingLevel()
			) {
				if (server.securityInfo.hackDifficulty! > server.securityInfo.minDifficulty!) {
					const threads: number = server.threadCount(1.75);
					if (threads >= 1) {
						server.exec(server.generalInfo.hostname, server.scriptNames.weaken, threads);
					}
				} else if (server.moneyInfo.moneyAvailable! <= server.moneyInfo.moneyMax!) {
					const threads: number = server.threadCount(1.75);
					if (threads >= 1) {
						server.exec(server.generalInfo.hostname, server.scriptNames.grow, threads);
					}
				} else {
					const threads: number = server.threadCount(1.7);
					if (threads >= 1) {
						server.exec(server.generalInfo.hostname, server.scriptNames.hack, threads);
					}
				}
			}
		}
		if (!ns.scriptRunning('util/purchaseServers.js', 'home')) {
			ns.exec('util/purchaseServers.js', 'home');
		}
		await ns.sleep(1000);
	}
}
