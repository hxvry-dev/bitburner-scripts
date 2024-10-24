import { NS } from '@ns';

export class Logger {
	private ns: NS;
	private isDebug: boolean;
	private isTrace: boolean;
	private logName: string;
	private pprint: boolean;
	logPort: number;
	constructor(ns: NS, logName: string = '', isTrace: boolean = false, isDebug: boolean = true) {
		this.ns = ns;
		this.logPort = 20;
		this.logName = '';
		this.isDebug = true;
		this.isTrace = false;
		this.pprint = true;
	}
	logColors(): object {
		return {
			BLACK: '\u001b[30m',
			WHITE: '\u001B[37m',
			RED: '\u001B[31m',
			GREEN: '\u001b[32m',
			MAGENTA: '\u001b[35m',
			CYAN: '\u001b[36m',
			YELLOW: '\u001B[33m',
			BLUE: '\u001B[34m',

			RESET: '\u001B[0m',
		};
	}
}

export async function main(ns: NS) {
	ns.tail();
	ns.resizeTail(250, 150);
	ns.moveTail(0, 0);
	const logger: Logger = new Logger(ns);
	while (ns.readPort(logger.logPort) !== 'NULL PORT DATA') {
		break;
	}
}
