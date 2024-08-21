import { NS, ScriptArg } from '@ns';

/** @param {NS} ns */
export async function main(
	ns: NS,
	target: ScriptArg = ns.args[0] as string,
	threads: ScriptArg = ns.args[1] as number,
): Promise<void> {
	await ns.grow(target as string, {
		threads: threads as number,
	});
}
