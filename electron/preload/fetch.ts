import remote from '@electron/remote';

export function fetch(url: string, method: 'GET' | 'POST' = 'GET', headers: {name: string; value: string}[] = [], body: string | null = null): Promise<string> {
	return new Promise((resolve, reject) => {
		console.log(url);
		const buffers = [];
		const req = remote.net.request({
			method: method,
			url: url,
			redirect: 'follow',
		});
		headers.forEach(header => {
			console.log(header);
			req.setHeader(header.name, header.value);
		});
		req.on('response', (response) => {
			response.on('end', () => {
				resolve(Buffer.concat(buffers).toString());
			});
			response.on('data', (chunk) => {
				buffers.push(chunk);
			});
		
			response.on('aborted', () => {
				reject('Request aborted');
			});
			response.on('error', (e) => {
				reject(e);
			});
		});

		req.on('abort', () => {
			reject('Request aborted');
		});

		req.on('error', (e) => {
			reject(e);
		});

		req.end();
	});
}


