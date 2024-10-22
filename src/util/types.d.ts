export type BaseServerArgs = {
	serverList: string;
	isReady: boolean;
};
export type WorkerScripts = {
	hack: string;
	grow: string;
	weaken: string;
	all: Array<string>;
};
export type TimeObject = {
	now: Date;
	logFormat: string;
	year: string;
	month: string;
	day: string;
	hours: string;
	minutes: string;
	seconds: string;
};
