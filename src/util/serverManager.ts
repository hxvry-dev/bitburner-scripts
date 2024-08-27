import { NS } from '@ns';
import { IServer } from './server_v3';

export class ServerManager {
	private ns: NS;
	constructor(ns: NS) {
		this.ns = ns;
	}
	/**
	 *
	 * @returns The name of the newly purchased Server.
	 */
	generateServerName() {
		const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
		const length: number = 5;
		let result: string = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}
	private calculateCost(RAM: number): number {
		return this.ns.getPurchasedServerCost(RAM);
	}
	private canAfford(RAM: number): boolean {
		return this.ns.getServerMoneyAvailable('home') >= this.calculateCost(RAM);
	}
	purchasePServer(RAM: number): boolean | string {
		if (!this.canAfford(RAM)) {
			this.ns.tprint('Not enough money to purchase Server');
			return false;
		}
		const pServerName: string = `pserv-${this.generateServerName()}`;
		this.ns.purchaseServer(pServerName, RAM);
		this.ns.tprint(`Purchased Server ${pServerName} with ${RAM}GB RAM`);
		return pServerName;
	}
	purchasePServers(count: number, RAM: number): void {
		for (let i = 0; i < count; i++) {
			this.purchasePServer(RAM);
		}
	}
	upgradePServer(hostname: string, newRAM: number, multiplier: number): void {
		if (this.ns.serverExists(hostname)) {
			const currentRAM: number = Math.pow(2, multiplier);
			const newCost: number = this.calculateCost(newRAM) - this.calculateCost(currentRAM);
			if (this.ns.getServerMoneyAvailable('home') >= newCost) {
				this.ns.upgradePurchasedServer(hostname, newRAM);
				this.ns.tprint(`Upgraded server ${hostname} to ${newRAM}GB RAM.`);
			} else {
				this.ns.tprint('Not enough money to upgrade server.');
			}
		} else {
			this.ns.tprint(`Server ${hostname} does not exist.`);
		}
	}
}

export class Queue extends Array {
	add(val: string | IServer) {
		this.push(val);
	}
	remove() {
		return this.shift();
	}
	peek() {
		return this[0];
	}
	backPeek() {
		return this[this.length - 1];
	}
	isEmpty() {
		return this.length === 0;
	}
	write() {
		let result: string = '';
		for (let i = 0; i < this.length; i++) {
			if (this[i] === '') {
				continue;
			} else {
				result += `${this[i]}, `;
			}
		}
		return result;
	}
}
