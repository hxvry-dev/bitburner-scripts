import { IServer } from './server_v3';

export class Queue extends Array {
	add(val: string | IServer) {
		this.push(val);
	}
	remove() {
		return this.shift();
	}
	peek() {
		return this[0];
	}
	backPeek() {
		return this[this.length - 1];
	}
	isEmpty() {
		return this.length === 0;
	}
	write() {
		let result: string = '';
		for (let i = 0; i < this.length; i++) {
			if (this[i] === '') {
				continue;
			} else {
				result += `${this[i]}, `;
			}
		}
		return result;
	}
}
