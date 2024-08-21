import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
	while (true) {
		for (let i = 0; i < 5; i++) {
			await ns.weaken('n00dles');
		}
		await ns.sleep(1500);
	}
}
