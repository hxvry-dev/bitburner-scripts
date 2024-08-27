import { NS } from '@ns';
import { IServer } from './util/server_v3';
import { Queue, ServerManager } from './util/serverManager';

export async function main(ns: NS): Promise<void> {
	//ns.disableLog('ALL');
	ns.disableLog('sleep');
	ns.enableLog('exec');

	const serverManager: ServerManager = new ServerManager(ns);
	const purchasedServers: string[] = ns.getPurchasedServers();
	const purchasedServerQueue: Queue = new Queue();
	const maxRAM: number = Math.pow(2, 20);
	const rootedHosts: Set<string> = new Set<string>();
	let multiplier = 3;

	if (purchasedServers.length > 0) {
		const potentialMaxRAM: number = purchasedServers.reduce<number>(
			(a, e) => Math.max(a, ns.getServerMaxRam(e)),
			3,
		);
		while (Math.pow(2, multiplier) < potentialMaxRAM) multiplier++;
	}

	purchasedServers.forEach((server: string) => {
		purchasedServerQueue.add(server);
	});

	while (true) {
		const count: number = purchasedServerQueue.length;
		const cashOnHand: number = ns.getServerMoneyAvailable('home');
		const ram: number = Math.min(maxRAM, Math.pow(2, multiplier));
		const cost: number = ns.getPurchasedServerCost(ram);

		const servers: IServer[] = new IServer(ns).IServerList;
		for (const server of servers) {
			server.copy();
			if (!server.generalInfo.hasAdminRights) {
				server.root();
				if (server.generalInfo.hasAdminRights) {
					rootedHosts.add(server.generalInfo.hostname);
				}
			}
			if (
				server.generalInfo.hostname !== 'home' &&
				server.securityInfo.requiredHackingSkill! <= ns.getHackingLevel()
			) {
				const threads: number = server.threadCount(1.7);
				if (threads >= 1 && server.moneyInfo.moneyAvailable! >= server.moneyInfo.moneyMax! * 0.75) {
					servers.forEach((idx) => {
						idx.exec(server.generalInfo.hostname, server.scriptNames.hack, threads);
					});
				} else if (server.securityInfo.hackDifficulty! > server.securityInfo.minDifficulty!) {
					const threads: number = server.threadCount(1.75);
					if (threads >= 1) {
						servers.forEach((idx) => {
							idx.exec(server.generalInfo.hostname, server.scriptNames.weaken, threads);
						});
					}
				} else if (server.moneyInfo.moneyAvailable! <= server.moneyInfo.moneyMax!) {
					const threads: number = server.threadCount(1.75);
					if (threads >= 1) {
						servers.forEach((idx) => {
							idx.exec(server.generalInfo.hostname, server.scriptNames.grow, threads);
						});
					}
				}
			}
		}
		/** Player-Purchased Server Logic */
		if (count >= ns.getPurchasedServerLimit() && cashOnHand >= cost) {
			let current: string = purchasedServerQueue.peek();
			ns.tprint(current);
			if (Math.min(maxRAM, Math.pow(2, multiplier)) <= ns.getServerMaxRam(current)) {
				ns.tprint(`Bumping RAM multiplier from ${multiplier} to ${multiplier + 1}`);
				multiplier = multiplier + 1;
				continue;
			} else {
				current = purchasedServerQueue.remove();
				ns.killall(current);
				ns.deleteServer(current);
			}
		} else if (count < ns.getPurchasedServerLimit() && cashOnHand >= cost) {
			const slug: string = serverManager.generateServerName();
			const serverName: string = `pserv-${slug}`;
			const newServer = ns.purchaseServer(serverName, ram);
			purchasedServerQueue.add(newServer);
		}
		// Write the queue to a file.
		ns.write('res/out.txt', purchasedServerQueue.write(), 'w');
		await ns.sleep(1000);
		/** End Player-Purchased Server Logic */
	}
}
