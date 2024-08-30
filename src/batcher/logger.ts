import { NetscriptPort, NS } from '@ns';

export async function main(ns: NS): Promise<void> {
	const log: string = 'log/log.txt';
	ns.clear(log);
	ns.disableLog('ALL');
	ns.tail();
	ns.moveTail(200, 200);
	const logPort: NetscriptPort = ns.getPortHandle(ns.pid);
	logPort.clear();

	while (true) {
		await logPort.nextWrite();
		do {
			const data = logPort.read();
			ns.print(data);
			ns.write(log, data);
		} while (!logPort.empty());
	}
}
