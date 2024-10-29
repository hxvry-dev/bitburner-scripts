import { NetscriptPort, NS } from '@ns';
import { Logger } from './logger/logger';

export async function main(ns: NS): Promise<void> {
	const killLogs: string[] = ['sleep', 'run'];
	killLogs.forEach((log) => {
		ns.disableLog(log);
	});
	const logger: Logger = new Logger(ns, 'main');
	ns.clearPort(logger.logPort);
	ns.tail();
	ns.resizeTail(550, 450);
	ns.moveTail(0, 0);
	ns.clearLog();

	const pid: number = ns.run('batcher/batchLoop.js');
	logger.info(`BatchLoop spun up successfully! PID: ${pid}`);
	while (true) {
		const port: NetscriptPort = ns.getPortHandle(logger.logPort);
		while (!port.empty()) {
			const data = port.read();
			ns.print(data);
		}
		await ns.sleep(100);
	}
}
