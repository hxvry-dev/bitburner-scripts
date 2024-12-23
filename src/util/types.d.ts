export type TermColors = {
	[key: string]: string;
};
export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TERM';

export type BatchScriptBundle = {
	hack: string;
	grow: string;
	weaken: string;
	all: string[];
};
export type BatchThreads = {
	hackThreads: number;
	w1Threads: number;
	w2Threads: number;
	growThreads: number;
	totalThreads?: number;
};
export type PrepThreads = {
	growThreads: number;
	weakenThreads: number;
};
export type BatchWorkerScript = {
	hack: string;
	grow: string;
	weaken: string;
	all: string[];
};

// V2 Batcher Types

export type Workers = {
	hack: string;
	grow: string;
	weaken: string;
	all: string[];
};
