// import {Menu, MenuItem, dialog, webContents} from '@electron/remote';
import {contextBridge, ipcRenderer} from 'electron';
import {PathLike, PathOrFileDescriptor} from 'original-fs';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {execSync} from 'node:child_process';
import {fetch} from './fetch';
import remote from '@electron/remote';
import {Puzzle, printBinaryFile} from './binaryEncoder';


contextBridge.exposeInMainWorld('electronApi', {
	fs: {
		existsSync: (path: PathLike) => fs.existsSync(path),
		mkdirSync: (path: PathLike) => fs.mkdirSync(path),
		writeFileSync: (file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView) => fs.writeFileSync(file, data),
		readFileSync: (file: PathLike) => fs.readFileSync(file, 'utf8'),
		createWriteStream: (path: PathLike) => fs.createWriteStream(path)
	},
	path: {
		join: (...paths: string[]) => path.join(...paths)
	},
	process: {
		env: {
			APPDATA: process.env.APPDATA,
			HOME: process.env.HOME,
		},
		platform: process.platform
	},
	child_process: {
		exec: (command: string) => execSync(command)
	},
	electron: {
		openDirectory: () => remote.dialog.showOpenDialogSync({properties: ['openDirectory']}),
		showErrorBox: remote.dialog.showErrorBox,
		download: (url: string, saveDir: string, fileName: string) => ipcRenderer.invoke('download', {url: url, saveDir: saveDir, fileName: fileName}),
		fetch: fetch 
	},
	node: {
		Buffer: {
			from: (str: string, encoding: BufferEncoding) => Buffer.from(str, encoding)
		}
	},
	encoder: {
		encode: (puz: Puzzle) => printBinaryFile(puz)
	}
	
	
});






function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
	return new Promise((resolve) => {
		if (condition.includes(document.readyState)) {
			resolve(true);
		} else {
			document.addEventListener('readystatechange', () => {
				if (condition.includes(document.readyState)) {
					resolve(true);
				}
			});
		}
	});
}

const safeDOM = {
	append(parent: HTMLElement, child: HTMLElement) {
		if (!Array.from(parent.children).find(e => e === child)) {
			return parent.appendChild(child);
		}
	},
	remove(parent: HTMLElement, child: HTMLElement) {
		if (Array.from(parent.children).find(e => e === child)) {
			return parent.removeChild(child);
		}
	},
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
	const className = 'loaders-css__square-spin';
	const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
	const oStyle = document.createElement('style');
	const oDiv = document.createElement('div');

	oStyle.id = 'app-loading-style';
	oStyle.innerHTML = styleContent;
	oDiv.className = 'app-loading-wrap';
	oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

	return {
		appendLoading() {
			safeDOM.append(document.head, oStyle);
			safeDOM.append(document.body, oDiv);
		},
		removeLoading() {
			safeDOM.remove(document.head, oStyle);
			safeDOM.remove(document.body, oDiv);
		},
	};
}

// ----------------------------------------------------------------------

const {appendLoading, removeLoading} = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
	ev.data.payload === 'removeLoading' && removeLoading();
};



setTimeout(removeLoading, 4999);


let rightClickPosition = null;



const menu = new remote.Menu();
const menuItem = new remote.MenuItem({
	label: 'Inspect Element',
	click: () => {
		remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y);
	}
});
menu.append(menuItem);

window.addEventListener('contextmenu', (e) => {
	e.preventDefault();
	rightClickPosition = {x: e.x, y: e.y};
	menu.popup(remote.getCurrentWindow());
}, false);


