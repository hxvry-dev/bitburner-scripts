import { NS } from '@ns';
import { TimeObject } from './types';

export class Logger {
	protected fileName: string;
	protected ns: NS;
	constructor(ns: NS) {
		this.ns = ns;
		this.fileName = `util/logs/log.txt`;
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
	info(message: string): void {
		return this.ns.write(this.fileName, `[INFO] -${this.ts().logFormat}- [${message}]\n`, 'a');
	}
	warn(message: string): void {
		return this.ns.write(this.fileName, `[WARN] -${this.ts().logFormat}- [${message}]\n`, 'a');
	}
	error(message: string): void {
		return this.ns.write(this.fileName, `[ERROR] -${this.ts().logFormat}- [${message}]\n`, 'a');
	}
	critical(message: string): void {
		return this.ns.write(this.fileName, `[CRITICAL] -${this.ts().logFormat}- [${message}]\n`, 'a');
	}
}
