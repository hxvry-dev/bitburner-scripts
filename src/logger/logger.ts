import { NetscriptPort, NS } from '@ns';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TERM';

type LogTime = {
	year: string;
	month: string;
	day: string;
	hour: string;
	minute: string;
	second: string;
	millis?: string;
};
export class Logger {
	public logPort: number;
	protected ns: NS;
	protected name?: string;
	protected _epoch: string;
	constructor(ns: NS, logName: string = '') {
		this.ns = ns;
		this.logPort = 20;
		this.name = logName ? logName : '';
		this._epoch = '';
	}
	get epoch() {
		this._epoch = Date.now().toString();
		return `${this.colors.CYAN}${this._epoch}${this.colors.RESET}`;
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
	protected ts(): LogTime {
		const today: Date = new Date();
		const year: string = today.getFullYear().toString().padStart(4, '0');
		const month: string = `${today.getMonth() + 1}`.toString().padStart(2, '0');
		const day: string = today.getDate().toString().padStart(2, '0');
		const hour: string = today.getHours().toString().padStart(2, '0');
		const minute: string = today.getMinutes().toString().padStart(2, '0');
		const second: string = today.getSeconds().toString().padStart(2, '0');
		const millis: string = today.getMilliseconds().toString().padStart(3, '0');
		const timestamp: LogTime = {
			year: year,
			month: month,
			day: day,
			hour: hour,
			minute: minute,
			second: second,
			millis: millis,
		};
		return timestamp as LogTime;
	}
	protected colorByLevel(level: string): string {
		level = level.toLowerCase();
		let color = '';
		switch (level) {
			case 'info': {
				color = this.colors.SLATE_BLUE;
				break;
			}
			case 'warn': {
				color = this.colors.YELLOW;
				break;
			}
			case 'error': {
				color = this.colors.RED;
				break;
			}
			case 'debug': {
				color = this.colors.GREY;
				break;
			}
			case 'term': {
				color = this.colors.MAGENTA;
				break;
			}
		}
		return color;
	}
	protected log(level: LogLevel, msg: string, args: Array<object | string>, term: boolean = false): void {
		const port: NetscriptPort = this.ns.getPortHandle(this.logPort);
		for (let i = 0; i < args.length; i++) {
			if (!Array.isArray(args[i])) {
				args[i] = `${this.colors.SLATE_BLUE}${JSON.stringify(args[i], null, 4)}`;
			} else {
				args[i] = `${this.colors.SLATE_BLUE}${JSON.stringify(args[i], null, 2)}`;
			}
			msg = `${msg}\n${args[i]}`;
		}
		const { year, month, day, hour, minute, second, millis } = this.ts();
		const tsFormat: string = `${this.colors.GREY}${month}/${day}/${year}${this.colors.RESET} ${this.colors.GREEN}|${this.colors.RESET} ${this.colors.GREY}${hour}:${minute}:${second}.${millis}${this.colors.RESET}`;
		// 2024-11-19 13:23:36.378 - [INFO] (Batcher)>  Running batch on n00dles with 10 GB of Reserved RAM
		const data: string = `${tsFormat} - ${this.colorByLevel(level)}[${level}]${this.colors.RESET} ${
			this.colors.YELLOW
		}(${this.name?.length ? this.name : ''})${this.colors.RESET}${this.colors.GREY}>${this.colors.RESET} ${
			this.colors.WHITE
		}${msg}${this.colors.RESET}`;
		if (!term) {
			port.tryWrite(data);
		} else {
			return this.ns.tprint(data);
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
	logToTerm(msg: string, ...args: Array<object | string>): void {
		this.log('TERM', `${this.colors.SLATE_BLUE}${msg}${this.colors.RESET}`, args, true);
	}
}
