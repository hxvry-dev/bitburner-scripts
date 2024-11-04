import { NS } from '@ns';
import { Batcher } from './batcher';
import { Logger } from '../logger/logger';
import { PServer } from '@/util/purchasedServer';

export async function main(ns: NS): Promise<void> {
	const target: string = (ns.args[0] as string) ?? 'n00dles';
	const reservedRam: number = (ns.args[1] as number) ?? 20;

	const logger: Logger = new Logger(ns, 'batchLoop');
	const batcher: Batcher = new Batcher(ns, target);
	const pServer: PServer = new PServer(ns);
	while (true) {
		if (!ns.scriptRunning('dashboard.js', 'home')) return;
		await pServer.run();
		if (!batcher.isPrepped(target)) {
			batcher.prepServer(target);
			await ns.sleep(ns.getWeakenTime(target) + 1000);
		} else {
			await batcher.runBatch(target, reservedRam);
			logger.info(`Batch finished successfully! ${logger.epoch}`);
		}
	}
}
