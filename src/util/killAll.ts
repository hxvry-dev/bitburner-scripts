import { NS } from '@ns';
import { listServers } from './util_v2';

/** @param {NS} ns Netscript API */
export function main(ns: NS): void {
	const deleteServers: boolean = ns.args[0] as boolean;
	if (deleteServers) {
		const pServers: string[] = ns.getPurchasedServers();
		for (let i = 0; i < pServers.length; i++) {
			ns.killall(pServers[i]);
			ns.deleteServer(pServers[i]);
		}
		return;
	}
	const servers: string[] = listServers(ns);
	let killedServers: number = 0;
	servers.forEach((target) => {
		if (!ns.scriptRunning('auto.js', 'home')) {
			ns.scriptKill('util/killall.js', 'home');
		}
		if (target !== 'home') {
			const serverKilled: boolean = ns.killall(target);
			if (serverKilled) {
				killedServers++;
			}
		}
	});

	if (killedServers == 0) {
		ns.tprint('Nothing to kill! Aborting');
		return;
	} else {
		ns.tprint(`Scripts killed on ${killedServers}`);
	}
}
