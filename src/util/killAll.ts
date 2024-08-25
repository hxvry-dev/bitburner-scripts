import { NS } from '@ns';
import { ServerScanner } from './serverScanner';

export async function main(ns: NS, deleteServers: boolean) {
	const serverScanner: ServerScanner = new ServerScanner(ns);
	if (deleteServers) {
		const pServers: string[] = ns.getPurchasedServers();
		for (let i = 0; i < pServers.length; i++) {
			ns.killall(pServers[i]);
			ns.deleteServer(pServers[i]);
		}
		return;
	}
	const servers: string[] = serverScanner.scanAllServers();
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
		ns.print(`Num Scripts Killed: ${killedServers}`);
	}
}
