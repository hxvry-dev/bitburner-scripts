import { IServer } from './server';
import { NS } from '@ns';

/**
 * https://github.com/faangbait/lets-play-bitburner/blob/main/sbin.hack.maxcash.js#L16
 * @param ns Netscript API
 * @param hostname Hostname of the server you're hacking
 * @param scriptRam Script RAM required
 * @returns Thread Count
 */
export function getThreadCount(ns: NS, hostname: string, scriptRam: number): number {
	let threads = 0;
	const freeRam = ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname);

	threads = freeRam / scriptRam;
	return Math.floor(threads);
}

/**
 *
 * @param length Total length of the generated Slug
 * @returns The generated Slug
 */
export function generateServerSlug(length?: number): string {
	const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
	let result: string = '';
	if (!length || length < 5) {
		length = 5;
	}
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/* V2 */
/**
 * https://github.com/abyo/bitburner-typescript/blob/763ec03a2866be7916330f2c03e403148da692c6/src/compiler/utilities.ts#L26
 * @param ns Netscript API
 * @param current The server you are logged into
 * @param visited An array of all previously visited servers
 * @returns The array of all visited servers
 */
export function listServers(ns: NS, current: string = 'home', visited = new Set<string>()): string[] {
	let connections: string[] = ns.scan(current);
	let pServConnections: string[] = ns.getPurchasedServers();
	connections = connections.filter((s) => !visited.has(s));

	// Spider
	connections.forEach((server) => {
		visited.add(server);
		return listServers(ns, server, visited);
	});

	pServConnections = pServConnections.filter((s) => !visited.has(s));
	for (let i = 0; i < pServConnections.length; i++) {
		connections.push(pServConnections[i]);
	}

	return Array.from(visited.keys());
}

/**
 *
 * @param ns Netscript API
 * @returns Array of IServers
 */
export function listIServers(ns: NS): IServer[] {
	const servers: string[] = listServers(ns);
	const data: IServer[] = [];
	for (const server of servers) {
		data.push(new IServer(ns, server));
	}
	return data;
}

/**
 *
 * @param ns Netscript API
 * @param serversToVisit Array of server hostnames to copy files to.
 */
export function copyFilesToIServer(ns: NS, serversToVisit: IServer[]): void {
	const scripts = ['scripts/_grow.js', 'scripts/_hack.js', 'scripts/_weaken.js'];

	for (const server of serversToVisit) {
		const growExists: boolean = ns.fileExists('scripts/_grow.js', server.generalInfo.hostname);
		const hackExists: boolean = ns.fileExists('scripts/_hack.js', server.generalInfo.hostname);
		const weakenExists: boolean = ns.fileExists('scripts/_weaken.js', server.generalInfo.hostname);
		if (!growExists) {
			ns.scp(scripts[0], server.generalInfo.hostname, 'home');
		}
		if (!hackExists) {
			ns.scp(scripts[1], server.generalInfo.hostname, 'home');
		}
		if (!weakenExists) {
			ns.scp(scripts[2], server.generalInfo.hostname, 'home');
		}
	}
}
