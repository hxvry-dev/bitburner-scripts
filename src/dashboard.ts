import { NetscriptPort, NS } from '@ns';
import { Logger } from '@/logger/logger';

export async function main(ns: NS): Promise<void> {
	let pid: number = 0;
	const hostname: string = ns.args[0] as string;
	const reservedRam: number = ns.args[1] as number;

	const killLogs: string[] = ['sleep', 'run', 'getServerMaxRam'];
	killLogs.forEach((log) => {
		ns.disableLog(log);
	});
	const logger: Logger = new Logger(ns, 'main');
	ns.clearPort(logger.logPort);
	ns.clearLog();

	ns.tail(ns.pid);
	ns.resizeTail(1250, 250, ns.pid);
	ns.moveTail(700, 0, ns.pid);

	if (!ns.scriptRunning('batcher/batchLoop.js', 'home')) {
		try {
			pid = ns.run('batcher/batchLoop.js', 1, hostname, reservedRam);
			logger.info(`BatchLoop spun up successfully! PID: ${pid}`);
		} catch {
			logger.error(`Could not start batchLoop.js!`);
		}
	}

	if (!ns.scriptRunning('util/topStats.js', 'home') && ns.getServerMaxRam('home') > Math.pow(2, 6)) {
		try {
			pid = ns.run('util/topStats.js', 1);
			logger.info(`TopStats spun up successfully! PID: ${pid}`);
		} catch {
			logger.error(`Could not start topStats.js!`);
		}
	}

	while (true) {
		const port: NetscriptPort = ns.getPortHandle(logger.logPort);
		while (!port.empty()) {
			const data = port.read();
			ns.print(data);
		}
		await ns.sleep(1);
	}
}
