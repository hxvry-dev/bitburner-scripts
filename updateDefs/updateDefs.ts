import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Downloads a file from a specified URL and saves it to the local filesystem.
 *
 * @param url - The URL of the file to download.
 * @param savePath - The path where the file should be saved.
 */
async function downloadFile(url: string, savePath: string): Promise<void> {
	try {
		const response = await axios.get(url, { responseType: 'stream' });
		const writer = fs.createWriteStream(savePath);
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
	} catch (error) {
		console.error('Error downloading file:', error);
		throw error;
	}
}

const fileUrl =
	'https://raw.githubusercontent.com/bitburner-official/bitburner-src/dev/src/ScriptEditor/NetscriptDefinitions.d.ts';
const filePath = path.resolve(__dirname, '../NetscriptDefinitions.d.ts');

downloadFile(fileUrl, filePath)
	.then(() => console.log('Updated Netscript Definitions'))
	.catch((error) => console.error('Failed to update Netscript definitions:', error));
