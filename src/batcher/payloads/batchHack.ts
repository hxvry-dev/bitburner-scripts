import { NS, ScriptArg } from '@ns';

/**
 *
 * @param ns NetScript API
 * @param threads Number of threads to run the worker script with
 * @param time Amount of time (in ms) to wait before executing the worker script
 * @param target The target server to execute the worker script on
 * @returns void
 */
export async function main(
	ns: NS,
	threads: ScriptArg = ns.args[0],
	time: ScriptArg = ns.args[1],
	target: ScriptArg = ns.args[2],
): Promise<void> {
	if (typeof threads !== 'number' || typeof time !== 'number' || typeof target !== 'string') {
		return;
	}
	await ns.sleep(time);
	await ns.grow(target, { threads });
}
