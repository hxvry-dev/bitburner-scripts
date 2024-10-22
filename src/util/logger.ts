import { NS } from '@ns';
import { TimeObject } from './types';

export class Logger {
	private ns: NS;
	private fileName: string;
	private queue: string[];
	constructor(ns: NS) {
		this.ns = ns;
		this.fileName = `util/logs/log.txt`;
		this.queue = [];
	}
	ts(): TimeObject {
		const now: Date = new Date();
		const year: string = String(now.getFullYear()).slice(2, 4);
		const month: string = String(now.getMonth() + 1).padStart(2, '0');
		const day: string = String(now.getDate()).padStart(2, '0');
		const hours: string = String(now.getHours()).padStart(2, '0');
		const minutes: string = String(now.getMinutes()).padStart(2, '0');
		const seconds: string = String(now.getSeconds()).padStart(2, '0');
		const ms: string = String(now.getMilliseconds()).padStart(2, '0');
		const logFormat: string = `[${year}${month}${day}-${hours}:${minutes}:${seconds}.${ms}]`;
		return { now, logFormat, year, month, day, hours, minutes, seconds } as TimeObject;
	}
	deferLog(message: string, level: string): void {
		this.queue.push(`[${level.toUpperCase()}] -${this.ts().logFormat}- [${message}]\n`);
		return;
	}
	processQueue(): void {
		while (this.queue.length > 0) {
			const currentMessage: string | undefined = this.queue.shift();
			if (currentMessage) {
				return this.ns.write(this.fileName, currentMessage + ' [d]\n', 'a');
			}
		}
	}
}
