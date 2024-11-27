import { NS } from '@ns';
import { BaseServerV2 } from './util/baseServerV2';
import { PurchasedServerV2 } from './derived/purchasedServerV2';

export async function main(ns: NS) {
	const baseServerV2: BaseServerV2 = new BaseServerV2(ns);
	const purchasedServerV2: PurchasedServerV2 = new PurchasedServerV2(ns);
	baseServerV2._scanAll(true, 'CSEC');
	purchasedServerV2.upgrade();
	ns.tprint(purchasedServerV2.pServerList);
}
