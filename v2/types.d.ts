export type Timings = {
	hTime: number;
	wTime: number;
	gTime: number;
	delays: {
		hDelay: number;
		wDelay: number;
		gDelay: number;
	};
};

export type JobTask = 'HACK' | 'GROW' | 'WEAKEN' | 'WEAKEN2' | 'init';
