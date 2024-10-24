import { NS } from '@ns';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
type LogMessage = {
	payload: string;
	ts: string;
	msgId: string;
};
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
	set setLogName(logName: string) {
		if (typeof logName !== 'string') return;
		this.logName = logName;
		return;
	}
	colors = {
		BLACK: '\u001b[30m',
		WHITE: '\u001B[37m',
		RED: '\u001B[31m',
		GREEN: '\u001b[32m',
		MAGENTA: '\u001b[35m',
		CYAN: '\u001b[36m',
		YELLOW: '\u001B[33m',
		BLUE: '\u001B[34m',
		GREY: '\x1b[38;5;15m',
		SLATE_BLUE: '\x1b[38;5;33m',
		DEFAULT_GREEN: '\x1b[38;5;40m',
		DARK_BROWN: '\x1b[38;5;100m',
		RED_BG: '\x1b[41m',
		RESET: '\u001B[0m',
	};
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
