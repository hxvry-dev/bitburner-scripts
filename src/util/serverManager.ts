import { NS } from '@ns';

export class ServerManager {
	private readonly ns: NS;
	constructor(ns: NS) {
		this.ns = ns;
	}
	/**
	 *
	 * @returns The name of the newly purchased Server.
	 */
	generateServerName() {
		let idx: number = 1;
		while (this.ns.serverExists(`pserv-${idx}`)) {
			idx++;
		}
		return `pserv-${idx}`;
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
		const pServerName: string = this.generateServerName();
		this.ns.purchaseServer(pServerName, RAM);
		this.ns.tprint(`Purchased Server ${pServerName} with ${RAM}GB RAM`);
		return pServerName;
	}
	purchasePServers(count: number, RAM: number): void {
		for (let i = 0; i < count; i++) {
			this.purchasePServer(RAM);
		}
	}
	upgradePServer(hostname: string, newRAM: number): void {
		if (this.ns.serverExists(hostname)) {
			const currentRAM: number = this.ns.getServerMaxRam(hostname);
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
