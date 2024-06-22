import { NS } from '@ns';

/**
 *
 * @param ns Netscript API
 * @param scriptName The name of the script being run against the `target` server
 * @param hostname The hostname of the server running the script
 * @param threads The number of threads being used to run the script
 * @param target The target? server that the script is attacking/growing/weakening
 */
export async function Execute(
	ns: NS,
	scriptName: string,
	hostname: string,
	threads: number,
	target?: string,
): Promise<void> {
	if (typeof target === 'undefined' || typeof target !== 'string') {
		target = 'n00dles';
	}
	try {
		if (hostname !== 'I.I.I.I') {
			ns.exec(scriptName, hostname, threads, target);
		}
	} catch {
		ns.print(`
        Something went wrong, waiting a cycle and trying again.
        Here's some info on what happened.
        
        Hostname -> ${hostname}
        Thread count attempted: ${threads}
        Script trying to be run: ${scriptName}
        `);
	}
}
