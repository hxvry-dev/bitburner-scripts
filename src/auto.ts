import { copyFilesToIServer, getThreadCount, listIServers } from './util/util';

import { Execute } from './util/execute';
import { NS } from '@ns';
import { scriptNames } from './util/const';
import { IServer } from './util/server';

/**
 * Main Entry Point
 * @param ns Netscript API
 */
export async function main(ns: NS) {
	ns.disableLog('ALL');
	ns.enableLog('exec');
	// Kill all running scripts before initing the loop.
	if (!ns.scriptRunning('/ext/killAll.js', 'home')) {
		ns.exec('/ext/killAll.js', 'home');
	}

	while (true) {
		if (!ns.scriptRunning('/ext/purchaseServers.js', 'home')) {
			ns.exec('/ext/purchaseServers.js', 'home');
		}
		const servers: IServer[] = listIServers(ns);
		void copyFilesToIServer(ns, servers);

		for (const server of servers) {
			try {
				if (
					ns.hasRootAccess(server.generalInfo.hostname) &&
					ns.hasRootAccess('home') &&
					server.generalInfo.hostname !== 'home' &&
					ns.getHackingLevel() > ns.getServerRequiredHackingLevel(server.generalInfo.hostname)
				) {
					if (
						ns.getServerSecurityLevel(server.generalInfo.hostname) >
						ns.getServerMinSecurityLevel(server.generalInfo.hostname)
					) {
						const threads: number = getThreadCount(ns, server.generalInfo.hostname, 1.75);
						if (threads >= 1) {
							await Execute(ns, scriptNames._weaken, server.generalInfo.hostname, threads);
						}
					} else if (
						ns.getServerMoneyAvailable(server.generalInfo.hostname) <
						ns.getServerMaxMoney(server.generalInfo.hostname)
					) {
						const threads: number = getThreadCount(ns, server.generalInfo.hostname, 1.75);
						if (threads >= 1) {
							await Execute(ns, scriptNames._grow, server.generalInfo.hostname, threads);
						}
					} else {
						const threads: number = getThreadCount(ns, server.generalInfo.hostname, 1.7);
						if (threads >= 1) {
							await Execute(ns, scriptNames._hack, server.generalInfo.hostname, threads);
						}
					}
				} else {
					server.root();
				}
				await ns.sleep(10);
			} catch {
				continue;
			}
		}
	}
}
