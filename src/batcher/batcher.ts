import { BaseServer } from '@/util/baseServer';
import { NS } from '@ns';

export class Batcher extends BaseServer {
	constructor(ns: NS) {
		super(ns);
		if (this.isPrepped && this.isHackable) {
			this.args.isReady = true;
		}
	}
	/**
	 * @returns True if this server's security is at the lowest possible value, and that the money available is equal to the maximum money available on the server. False otherwise.
	 */
	get isPrepped(): boolean {
		if (this.data.minDifficulty == this.data.hackDifficulty && this.data.moneyAvailable == this.data.moneyMax) {
			return true;
		} else {
			return false;
		}
	}
	/**
	 * @returns True if the server has money, administrator privileges, and if the hacking level required to hack the server is less than the players' hacking level. False otherwise.
	 */
	get isHackable(): boolean {
		if (
			this.data.moneyMax! > 0 &&
			this.data.hasAdminRights &&
			this.data.requiredHackingSkill! < this.ns.getHackingLevel()
		) {
			return true;
		} else {
			return false;
		}
	}
}
