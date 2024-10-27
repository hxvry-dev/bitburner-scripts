import { Logger } from '@/logger/logger';
import { BatchScriptBundle } from '@/util/types';
import { NS } from '@ns';
import { BaseServerV2 } from './baseServer_v2';

export class IServerV4 extends BaseServerV2 {
	protected logger: Logger;
	protected workers: BatchScriptBundle;
	constructor(ns: NS, hostname: string) {
		super(ns);
		this.logger = new Logger(ns, 'IServerV4');
		this.workers = {
			hack: 'scripts/hack_v2.js',
			grow: 'scripts/grow_v2.js',
			weaken: 'scripts/weaken_v2.js',
			all: ['scripts/hack_v2.js', 'scripts/weaken_v2.js', 'scripts/grow_v2.js'],
		};
		this.hostname = hostname ? hostname : this.ns.getHostname();
	}
}
