export type Timings = {
	hTime: number;
	wTime: number;
	gTime: number;
	delays: {
		hDelay: number;
		wDelay: number;
		w2Delay: number;
		gDelay: number;
	};
};
export type BatchThreads = {
	hThreads: number;
	wThreads: number;
	w2Threads: number;
	gThreads: number;
};
