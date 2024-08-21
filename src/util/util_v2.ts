import { NS } from '@ns';
import { IServer } from './server_v2';

/**
 *
 * @param ns Netscript API
 * @param scriptName The name of the script being run against the `target` server
 * @param hostname The hostname of the server running the script
 * @param threads The number of threads being used to run the script
 * @param target The target? server that the script is attacking/growing/weakening
 */
export async function exec(
	ns: NS,
	hostname: string,
	scriptName: string,
	threadCount: number,
	target: string = 'n00dles',
): Promise<void> {
	try {
		ns.exec(scriptName, hostname, threadCount, target);
	} catch {
		ns.print(`
        Something went wrong, waiting a cycle and trying again.
        Here's some info on what happened:
        
        Hostname: ${hostname}
        Thread count attempted: ${threadCount}
        Script trying to be run: ${scriptName}
        `);
	}
}

/**
 * Copies the specified hacking scripts to the target server
 * @param ns Netscript API
 * @param serversToVisit Array of server hostnames to copy files to
 */
export function copy(ns: NS, serversToVisit: IServer[]): void {
	const scripts = ['scripts/grow_v2.js', 'scripts/hack_v2.js', 'scripts/weaken_v2.js'];

	for (const server of serversToVisit) {
		const growExists: boolean = ns.fileExists('scripts/grow_v2.js', server.generalInfo.hostname);
		const hackExists: boolean = ns.fileExists('scripts/hack_v2.js', server.generalInfo.hostname);
		const weakenExists: boolean = ns.fileExists('scripts/weaken_v2.js', server.generalInfo.hostname);
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
 * @param str The string to pad
 * @param length The total length
 * @param separator The filler character
 * @returns The formatted string
 */
export const pad = (str: string, length: number, separator: string) =>
	str.padStart((str.length + length) / 2, separator).padEnd(length, separator);

export const hackPrograms = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];

export const scriptNames = {
	hack: 'scripts/hack_v2.js',
	weaken: 'scripts/weaken_v2.js',
	grow: 'scripts/grow_v2.js',
};
