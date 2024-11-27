import { NetscriptPort, NS } from '@ns';
import { TermColors } from '@/util/types';
import { LogLevel } from '@/util/types';

export class Logger {
	logPort: number;
	epoch: string;
	protected name?: string;
	protected colors: TermColors;
	protected ns: NS;
	constructor(ns: NS, name: string) {
		this.ns = ns;
		this.name = name;
		this.logPort = 25;
		this.colors = {
			BLACK: '\u001b[30m',
			WHITE: '\u001B[37m',
			RED: '\u001B[31m',
			GREEN: '\u001b[32m',
			MAGENTA: '\u001b[35m',
			CYAN: '\u001b[36m',
			YELLOW: '\u001B[33m',
			GREY: '\x1b[38;5;15m',
			SLATE_BLUE: '\x1b[38;5;33m',
			DEFAULT_GREEN: '\x1b[38;5;40m',
			RESET: '\u001B[0m',
		};
		this.epoch = Date.now().toString();
	}
	protected ts(): string {
		const today: Date = new Date();
		const year: string = today.getFullYear().toString().padStart(4, '0');
		const month: string = `${today.getMonth() + 1}`.toString().padStart(2, '0');
		const day: string = today.getDate().toString().padStart(2, '0');
		const hour: string = today.getHours().toString().padStart(2, '0');
		const minute: string = today.getMinutes().toString().padStart(2, '0');
		const second: string = today.getSeconds().toString().padStart(2, '0');
		const millis: string = today.getMilliseconds().toString().padStart(3, '0');

		const prefix: string = `${this.colors.WHITE}${month}/${day}/${year}${this.colors.RESET}${this.colors.GREEN} │ ${this.colors.RESET}${this.colors.WHITE}${hour}:${minute}:${second}.${millis} ― ${this.colors.RESET}`;
		return prefix;
	}
	protected createLogMessage(level: LogLevel, msg: string, args: Array<object | string>): string {
		let levelColor: string = '';
		let logColor: string = '';
		const logName: string = ` ${this.colors.YELLOW}(${this.name})${this.colors.RESET}`;
		switch (level) {
			case 'INFO':
				levelColor = this.colors.DEFAULT_GREEN;
				logColor = this.colors.WHITE;
				break;
			case 'WARN':
				levelColor = this.colors.YELLOW;
				logColor = this.colors.WHITE;
				break;
			case 'ERROR':
				levelColor = this.colors.RED;
				logColor = this.colors.WHITE;
				break;
			case 'TERM':
				levelColor = this.colors.GREEN;
				logColor = this.colors.GREEN;
				break;
			case 'DEBUG':
				levelColor = this.colors.MAGENTA;
				logColor = this.colors.GREY;
				break;
			default:
				levelColor = this.colors.DEFAULT_GREEN;
				logColor = this.colors.DEFAULT_GREEN;
				break;
		}
		const prefix: string = `${this.ts()}${levelColor}[${level}]${this.colors.RESET}${logName}>`;
		for (let i = 0; i < args.length; i++) {
			if (!Array.isArray(args[i])) {
				args[i] = `${JSON.stringify(args[i], null, 2)}`;
			} else {
				args[i] = `${JSON.stringify(args[i], null, 4)}`;
			}
			msg = `${levelColor}${msg}${this.colors.RESET}\n${logColor}${args[i]}${this.colors.RESET}`;
		}
		if (args.length == 0) {
			msg = `${levelColor}${msg}${this.colors.RESET}`;
		}
		const _msg: string = `${prefix} ${msg}`;
		return _msg;
	}
	protected log(level: LogLevel, msg: string, args: Array<object | string>, toTerm: boolean = false): void {
		const port: NetscriptPort = this.ns.getPortHandle(this.logPort);
		const payload: string = this.createLogMessage(level, msg, args);
		if (!toTerm) {
			port.tryWrite(payload);
		} else {
			return this.ns.tprint(payload);
		}
	}
	info(msg: string, ...args: Array<object | string>): void {
		this.log('INFO', msg, args);
	}
	warn(msg: string, ...args: Array<object | string>): void {
		this.log('WARN', msg, args);
	}
	error(msg: string, ...args: Array<object | string>): void {
		this.log('ERROR', msg, args);
	}
	debug(msg: string, ...args: Array<object | string>): void {
		this.log('DEBUG', msg, args);
	}
	term(msg: string, ...args: Array<object | string>): void {
		this.log('TERM', msg, args, true);
	}
}
