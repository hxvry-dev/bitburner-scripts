import { NS, Server } from '@ns';

interface ServerPorts {
	numOpenPortsRequired?: number | undefined;
	openPortCount?: number | undefined;
	sshPortOpen: boolean;
	ftpPortOpen: boolean;
	smtpPortOpen: boolean;
	httpPortOpen: boolean;
	sqlPortOpen: boolean;
}

interface GeneralInfo {
	hostname: string;
	backdoorInstalled?: boolean | undefined;
	hasAdminRights: boolean;
	ip: string;
	cpuCores: number;
	isConnectedTo: boolean;
	organizationName: string;
	purchasedByPlayer: boolean;
}

interface MoneyInfo {
	moneyAvailable?: number | undefined;
	moneyMax?: number | undefined;
	serverGrowth?: number | undefined;
}

interface ServerRAMInfo {
	ramUsed: number;
	maxRam: number;
	freeRam: number;
}

interface Security {
	baseDifficulty?: number | undefined;
	hackDifficulty?: number | undefined;
	minDifficulty?: number | undefined;
	requiredHackingSkill?: number | undefined;
}

export class IServer {
	constructor(public ns: NS, public host: string) {
		this.ns = ns;
		this.host = host;
	}

	get data(): Server {
		return this.ns.getServer(this.host);
	}

	get hostname(): string {
		return this.data.hostname;
	}

	get generalInfo(): GeneralInfo {
		return {
			hostname: this.data.hostname,
			backdoorInstalled: this.data.backdoorInstalled,
			hasAdminRights: this.data.hasAdminRights,
			ip: this.data.ip,
			cpuCores: this.data.cpuCores,
			isConnectedTo: this.data.isConnectedTo,
			organizationName: this.data.organizationName,
			purchasedByPlayer: this.data.purchasedByPlayer,
		};
	}

	get ports(): ServerPorts {
		return {
			numOpenPortsRequired: this.data.numOpenPortsRequired,
			openPortCount: this.data.openPortCount,
			ftpPortOpen: this.data.ftpPortOpen,
			httpPortOpen: this.data.httpPortOpen,
			smtpPortOpen: this.data.smtpPortOpen,
			sqlPortOpen: this.data.sqlPortOpen,
			sshPortOpen: this.data.sshPortOpen,
		};
	}

	get ram(): ServerRAMInfo {
		return {
			ramUsed: this.data.ramUsed,
			maxRam: this.data.maxRam,
			freeRam: this.data.maxRam - this.data.ramUsed,
		};
	}

	get security(): Security {
		return {
			baseDifficulty: this.data.baseDifficulty,
			hackDifficulty: this.data.hackDifficulty,
			minDifficulty: this.data.minDifficulty,
			requiredHackingSkill: this.data.requiredHackingSkill,
		};
	}

	get money(): MoneyInfo {
		return {
			moneyAvailable: this.data.moneyAvailable,
			moneyMax: this.data.moneyMax,
			serverGrowth: this.data.serverGrowth,
		};
	}

	threadCount(scriptRam: number): number {
		return Math.floor(this.ram.freeRam / scriptRam);
	}

	root(): void {
		try {
			this.ns.nuke(this.data.hostname);
		} catch (e) {
			this.ns.print(e);
		}
		try {
			this.ns.brutessh(this.data.hostname);
			this.ns.ftpcrack(this.data.hostname);
			this.ns.relaysmtp(this.data.hostname);
			this.ns.httpworm(this.data.hostname);
			this.ns.sqlinject(this.data.hostname);
		} catch (e) {
			this.ns.print(e);
		}
	}
}
