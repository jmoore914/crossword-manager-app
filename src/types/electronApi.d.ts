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
	electron: {
		openDirectory: () => string[];
	};
}

declare global {
	interface Window {
		electronApi: ElectronApi;
	}
}