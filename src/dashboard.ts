import { NetscriptPort, NS } from '@ns';
import { Logger } from './logger/logger';

export async function main(ns: NS): Promise<void> {
	let pid: number = 0;
	const hostname: string = ns.args[0] as string;
	const reservedRam: number = ns.args[1] as number;

	const killLogs: string[] = ['sleep', 'run'];
	killLogs.forEach((log) => {
		ns.disableLog(log);
	});
	const logger: Logger = new Logger(ns, 'main');
	ns.clearPort(logger.logPort);
	ns.clearLog();

	ns.tail(ns.pid);
	ns.resizeTail(1250, 250, ns.pid);
	ns.moveTail(700, 0, ns.pid);

	try {
		pid = ns.run('batcher/batchLoop.js', 1, hostname, reservedRam);
		ns.tail(pid);
		ns.resizeTail(1250, 250, pid);
		ns.moveTail(700, 250, pid);
		logger.info(`BatchLoop spun up successfully! PID: ${pid}`);
	} catch (e) {
		logger.error(`Could not start batchLoop.js!`);
	}

	while (true) {
		const port: NetscriptPort = ns.getPortHandle(logger.logPort);
		while (!port.empty()) {
			const data = port.read();
			ns.print(data);
		}
		await ns.sleep(10);
	}
}
