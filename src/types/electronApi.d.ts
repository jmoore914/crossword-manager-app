import {Puzzle} from '../../electron/preload/binaryEncoder';

export interface ElectronApi {
	fs: {
		existsSync: (PathLike) => boolean;
		mkdirSync: (PathLike) => void;
		writeFileSync: (file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView) => void;
		readFileSync: (PathLink) => string;
	};
	path: {
		join: (...paths: string[]) => string;
	};
	process: {
		env: {
			HOME: string;
			APPDATA: string;
		};
		platform: string;
	};
	child_process: {
		exec: (string) => void;
	};
	electron: {
		openDirectory: () => string[];
		showErrorBox: (title: string, content: string) => void;
		download: (url: string, saveDir: string, fileName: string) => Promise<Electron.DownloadItem>;
		fetch: (url: string, method: 'GET' | 'POST' = 'GET', headers: {name: string; value: string}[] = [], body: string | null = null) => Promise<string>;
	};
	node: {
		Buffer: {
			from: (str: string, econding: BufferEncoding) => Buffer;
		};
	};
	encoder: {
		encode: (puz: Puzzle) => Uint8Array;
	};

}

declare global {
	interface Window {
		electronApi: ElectronApi;
	}
}