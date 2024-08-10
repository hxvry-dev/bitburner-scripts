import { generateServerSlug } from '@/util/util';
import { Queue } from '@/util/queue';
import { NS } from '@ns';

/**
 *
 * https://www.reddit.com/r/Bitburner/comments/ribd84/purchase_server_autoscaling_script_107gb/
 * @param ns Netscript API
 * @returns Newly purchased server(s)
 */
export async function main(ns: NS): Promise<void> {
	let multiplier: number = 3;

	const servers = ns.getPurchasedServers();

	if (servers.length > 0) {
		const potentialMaxRam: number = servers.reduce((a, e) => Math.max(a, ns.getServerMaxRam(e)), 3);
		while (Math.pow(2, multiplier) < potentialMaxRam) multiplier++;
	}

	const queue = new Queue();
	servers.forEach((server) => {
		queue.add(server);
	});

	const maxRam: number = Math.pow(2, 20);

	while (true) {
		if (!ns.scriptRunning('auto.js', 'home')) {
			ns.scriptKill(ns.getScriptName(), 'home');
		}
		if (Math.pow(2, multiplier) >= maxRam) {
			ns.tprint('Maxed on Servers, killing script.');
			return;
		}
		const count: number = queue.length;
		const cashOnHand: number = ns.getPlayer().money;
		const ram: number = Math.min(Math.pow(2, 20), Math.pow(2, multiplier));
		const cost: number = ns.getPurchasedServerCost(ram);

		if (count >= ns.getPurchasedServerLimit() && cashOnHand >= cost) {
			let current: string = queue.peek();
			if (Math.min(maxRam, Math.pow(2, multiplier)) <= ns.getServerMaxRam(current)) {
				ns.tprint(`Bumping RAM multiplier from ${multiplier} to ${multiplier + 1}`);
				multiplier = multiplier + 1;
				continue;
			} else {
				current = queue.remove();
				ns.killall(current);
				ns.deleteServer(current);
			}
		} else if (count < ns.getPurchasedServerLimit() && cashOnHand >= cost) {
			const slug: string = generateServerSlug();
			const serverName: string = `pserv-${slug}`;
			const newServer = ns.purchaseServer(serverName, ram);
			queue.add(newServer);
		}
		// Write the queue to a file.
		queue.write(ns);
		await ns.sleep(1000);
	}
}
