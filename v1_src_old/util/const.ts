/**
 * Easy printing pretty borders
 */
export const corners = {
	bottomLeft: '╚',
	bottomRight: '╝',

	topLeft: '╔',
	topRight: '╗',

	dividerTop: '╦',
	dividerBottom: '╩',
	dividerLeft: '╠',
	dividerRight: '╣',
	dividerCross: '╬',

	borderHoriz: '═',
	borderVert: '║',

	maxLength: 52,
	pointer: '▶',
};

export const scriptNames = {
	_grow: 'scripts/_grow.js',
	_weaken: 'scripts/_weaken.js',
	_hack: 'scripts/_hack.js',
};

export const hackScripts = ['scripts/_grow.js', 'scripts/_weaken.js', 'scripts/_hack.js'];

export const hackPrograms = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];

/**
 *
 * @param str The string to pad
 * @param length The total length
 * @param separator The filler character
 * @returns The formatted string
 */
export const pad = (str: string, length: number, separator: string) =>
	str.padStart((str.length + length) / 2, separator).padEnd(length, separator);
