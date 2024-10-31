import { NS } from '@ns';

export async function main(ns: NS) {
	let cycles: number = 0;
	ns.disableLog('sleep');
	ns.clearLog();
	while (true) {
		if (!ns.scriptRunning('dashboard.js', 'home')) return;
		ns.print(`${cycles}`);
		cycles++;
		await ns.sleep(1000);
	}
}
