import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
	await ns.weaken(ns.args[0] as string);
}
