import { NS } from '@ns';
import { IServer } from './server_v2';
import { generateServerSlug } from './util_v2';

export async function main(ns: NS): Promise<void> {
	let queue: IServer[] = [];
	let mult: number = 3;

	const maxRam: number = Math.pow(2, 20);
	const servers: string[] = ns.getPurchasedServers();

	if (servers.length > 0) {
		const potentialMaxRam: number = servers.reduce((a, e) => Math.max(a, ns.getServerMaxRam(e)), 3);
		while (Math.pow(2, mult) < potentialMaxRam) mult++;
	}
	servers.forEach((server) => {
		queue.push(new IServer(ns, server) as IServer);
	});

	while (true) {
		if (!ns.scriptRunning('loop.js', 'home')) {
			ns.scriptKill(ns.getScriptName(), 'home');
		}
		if (Math.pow(2, mult) >= maxRam) {
			ns.tprint('Maxed on Servers, killing script.');
			return;
		}
		const count: number = queue.length;
		const cashOnHand: number = ns.getPlayer().money;
		const ram: number = Math.min(Math.pow(2, 20), Math.pow(2, mult));
		const cost: number = ns.getPurchasedServerCost(ram);

		if (count >= ns.getPurchasedServerLimit() && cashOnHand >= cost) {
			let current: IServer = queue[0];
			if (Math.min(maxRam, Math.pow(2, mult)) <= ns.getServerMaxRam(current.generalInfo.hostname)) {
				ns.tprint(`Bumping RAM mult from ${mult} to ${mult + 1}`);
				mult = mult + 1;
				continue;
			} else {
				current = queue.shift()!;
				ns.killall(current.generalInfo.hostname);
				ns.deleteServer(current.generalInfo.hostname);
			}
		} else if (count < ns.getPurchasedServerLimit() && cashOnHand >= cost) {
			const slug: string = generateServerSlug();
			const serverName: string = `pserv-${slug}`;
			const newServer = ns.purchaseServer(serverName, ram);
			const newIServer: IServer = new IServer(ns, newServer);
			queue.push(newIServer);
		}
		await ns.sleep(1000);
	}
}
