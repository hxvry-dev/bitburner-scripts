import { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
	const servers: string[] = ns.getPurchasedServers();

	servers.forEach((server) => {
		ns.killall(server);
		ns.deleteServer(server);
	});
}
