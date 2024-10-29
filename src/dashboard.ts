import { NetscriptPort, NS } from '@ns';
import { Logger } from './logger/logger';

export async function main(ns: NS): Promise<void> {
	const killLogs: string[] = ['sleep', 'run'];
	killLogs.forEach((log) => {
		ns.disableLog(log);
	});
	ns.clearLog();
	const logger: Logger = new Logger(ns, 'main');
	ns.clearPort(logger.logPort);
	ns.tail();
	ns.resizeTail(1300, 350);
	ns.moveTail(0, 0);

	const hostname: string = ns.args[0] as string;
	const reservedRam: number = ns.args[1] as number;
	let pid: number = 0;
	if (hostname && reservedRam) {
		pid = ns.run('batcher/batchLoop.js', 1, hostname, reservedRam);
	} else {
		pid = ns.run('batcher/batchLoop.js');
	}
	logger.info(`BatchLoop spun up successfully! PID: ${pid}`);

	while (true) {
		const port: NetscriptPort = ns.getPortHandle(logger.logPort);
		while (!port.empty()) {
			const data = port.read();
			ns.print(data);
		}
		await ns.sleep(10);
	}
}
