import { NS } from '@ns';
import { IServer } from './server_v2';

/**
 * Copies the specified hacking scripts to the target server
 * @param ns Netscript API
 * @param serversToVisit Array of server hostnames to copy files to
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

/**
 * Generates a random Server name
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

/**
 * Deletes all Player-Purchased Servers
 * @param ns Netscript API
 */
export async function scrub(ns: NS): Promise<void> {
	const servers: string[] = ns.getPurchasedServers();

	servers.forEach((server) => {
		ns.killall(server);
		ns.deleteServer(server);
	});
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
