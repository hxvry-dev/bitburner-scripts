import { NS } from '@ns';
import { IServer } from './util/server_v2';
import { copy, exec, listIServers, scriptNames } from './util/util_v2';
import { generateServerReport } from './util/serverReport';

export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.disableLog('exec');

	const rootedHosts: string[] = [];
	while (true) {
		if (!ns.scriptRunning('util/purchaseServers.js', 'home')) {
			ns.exec('util/purchaseServers.js', 'home');
		}
		const servers: IServer[] = listIServers(ns);
		void copy(ns, servers);
		for (const server of servers) {
			if (!server.generalInfo.hasAdminRights) {
				try {
					server.root();
					if (server.generalInfo.hasAdminRights) {
						rootedHosts.push(server.generalInfo.hostname);
						await generateServerReport(ns, true, server, true);
					}
				} catch (e) {
					ns.print(e);
				}
			}
			if (server.generalInfo.hostname !== 'home') {
				if (server.securityInfo.requiredHackingSkill! <= ns.getHackingLevel()) {
					if (server.securityInfo.hackDifficulty! > server.securityInfo.minDifficulty!) {
						const threads: number = server.threadCount(1.75);
						if (threads >= 1) {
							await exec(ns, server.generalInfo.hostname, scriptNames.weaken, threads);
						}
					} else if (server.moneyInfo.moneyAvailable! <= server.moneyInfo.moneyMax!) {
						const threads: number = server.threadCount(1.75);
						if (threads >= 1) {
							await exec(ns, server.generalInfo.hostname, scriptNames.grow, threads);
						}
					} else {
						const threads: number = server.threadCount(1.7);
						if (threads >= 1) {
							await exec(ns, server.generalInfo.hostname, scriptNames.hack, threads);
						}
					}
				}
			}
		}
		await ns.sleep(100);
	}
}
