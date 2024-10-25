import { NS } from '@ns';
import { Batcher } from './batcher/batcher';
import { Logger } from './logger/logger';

export async function main(ns: NS): Promise<void> {
	const logger: Logger = new Logger(ns, 'batchLoop');
	const target: string = (ns.args[0] as string) ?? 'n00dles';
	const batcher: Batcher = new Batcher(ns);
	batcher.init();
	const reservedRam: number = (ns.args[1] as number) ?? 20;
	while (true) {
		if (!batcher.isPrepped(target)) {
			batcher.prep(target);
			logger.heartbeat();
			await ns.sleep(ns.getWeakenTime(target) + 1000);
		} else {
			await batcher.execute(target, reservedRam);
		}
	}
}
