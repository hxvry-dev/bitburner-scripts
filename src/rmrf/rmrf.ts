import { NS } from '@ns';

/**
 * https://github.com/subnetz/bitburner/blob/main/src/lib/rmrf.ts
 * Recursively removes all files from a `Bitburner` directory, and subsequently removes the `directory`.
 * @param ns Netscript API
 */
export async function main(ns: NS) {
	const args = <string>ns.args[0];
	if (args) {
		const files = ns.ls(ns.getHostname(), args);
		if (await ns.prompt(`Delete the following files?\n\n${files.join('\n')}`)) {
			files.forEach((file: string) => {
				ns.rm(file);
			});
		}
	}
	await ns.sleep(1000);
}
