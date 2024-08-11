import { NS } from '@ns';
import { IServer, Queue } from './util/server_v2';

export async function main(ns: NS): Promise<void> {
	ns.disableLog('ALL');
	ns.disableLog('exec');
	const server: IServer = new IServer(ns, 'home');
	server.generateServerReport(ns);
	/*

        Steps to hacking a server and profiting:

        1. Root the server
        1a. Run all 5 hack scripts.
        1aa. If a script doesn't eixst for some reason, buy it.
        2. Root the Server, creating a v2 IServer in the process.
        3. Copy hack files over to that server, start the loop.
        4. ???
        5. Profit?
        */
}
