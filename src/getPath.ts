import { NS } from '@ns';
import { BaseServer } from './util/baseServer';
import { Logger } from '@/logger/logger';

export async function main(ns: NS) {
	const target: string = (ns.args[0] as string) ?? 'run4theh111z';
	const logger: Logger = new Logger(ns, 'getPath');
	const bServer: BaseServer = new BaseServer(ns);
	logger.logToTerm(
		bServer
			.pathToServer(target)
			.map((server) => `connect ${server}`)
			.join('; '),
	);
}
