// import {Menu, MenuItem, dialog, webContents} from '@electron/remote';
import {contextBridge, ipcRenderer} from 'electron';
import {PathLike, PathOrFileDescriptor} from 'original-fs';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {execSync} from 'node:child_process';
import {fetch} from './fetch';
import remote from '@electron/remote';


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
	}
	
	
});

// const buf = getBuf();
// console.log(buf);
// console.log(buf.toString());

const bytesString = '\xa6\x91ACROSS&DOWN\x00\x02\xdaKV\x9eF\x9bZ\xd9a1.3\x00\x00\x00\x00\x00\
\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x0f\x0fL\x00\
\x01\x00\x00\x00MARS.CUFFS.GAGAAMOK.ALERO.UDONDOMINATRIX.AMOSARC.ANIME.AVID.\
MOOGS.MINIMARTSSUMATRA.DNA.ERE.SSN.ETA.TIEDYE...JAMESBOND...CABANA.HUT.SYD.A\
SU.GIF.RODEOUTMTRAINIER.ALGAE.ERLE.GRIMM.ALAIPAD.MARTINAMISMUTE.GROOT.TAPESP\
AR.MORSE.STAR----.-----.--------.-----.--------------.-------.-----.----.---\
--.----------------.---.---.---.---.------...---------...------.---.---.---.\
---.----------------.-----.----.-----.-------.--------------.-----.--------.\
-----.----NY Times, Tuesday, May 2, 2023\x00Aimee Lucido / Will Shortz\x00\
\xa9 2023, The New York Times\x00Destination for NASA"s Perseverance rover\
\x00Counterparts of sirs\x00Full of love\x00"50 First Dates" and "27 Dres\
ses," for two\x00Enjoy the slopes\x00Rolls up, as pant legs\x00Sonny Corl\
eone portrayer in "The Godfather"\x00Sport played with a Frisbee\x00Physic\
ist Enrico\x00Certain status on social media\x00"Red" or "White" team\x00\
Singer/actress Lady ___\x00Tropical fruit often found in smoothies\x00Rega\
rded with respect\x00"At least you did your best!"\x00Ques. counterpar\
t\x00In a wild way\x00Final Oldsmobile model\x00Thick noodles in Japanese\
 soups\x00Woman who might wield a whip\x00Tammany Hall caricaturist Thomas\
\x00"Famous" cookie guy\x00Shape of this answer\'s third letter\x00Art for\
m from Japan\x00Fanatical\x00At full speed, nautically\x00Pioneering synt\
hesizers introduced in the 1960s\x00Weed\x00Gas station conveniences\x00C\
ompletely\x00"Get it?"\x00Eastern island on the Equator\x00Stick around\x00S\
tuff spliced in a lab\x00Poetry palindrome\x00I.R.S. identifier, for short\
\x00Greek "H"\x00Result of burnout?\x00Decorate colorfully, in a way\x00Famo\
us Ford flop\x00Character associated with the beverage "shaken" in this puz\
zles circled letters\x00Titular woman in a #1 Rolling Stones hit\x00They \
might be full of beans\x00Shelter by the beach\x00Recording device, inform\
ally\x00Slightly better\x00Mozzarella-and-cream cheese often served as an \
appetizer\x00Simple shelter\x00Name thats also a major Australian airport\
 code\x00Posing surface\x00First female singer to have multiple albums exc\
eed 10 billion streams on Spotify\x00Tempe sch.\x00Meme that moves, ma\
ybe\x00Opera\'s "barber of Seville"\x00Weathered, as a storm\x00"I don\'t g\
ive a ___!"\x00Preview\x00Tallest peak in the Cascades\x00Birch relative\x00\
Mistake\x00Pond buildup\x00___ Stanley Gardner, creator of Perry Mason\
\x00Last name of two brotherly fairy tale writers\x00Tiny arachnid\x00In \
the style of\x00Modern checkout device in lieu of a cashier\x00Sends a pin\
g, in brief\x00British author known for his 1984 novel "Money"\x00Studio w\
ith a lion mascot\x00Symbols for tagging on Twitter\x00Zoom button you mig\
ht click when your dog barks\x00Treelike member of Marvels Guardians of th\
e Galaxy\x00Record, in a way\x00Practice boxing\x00Man with a code\x00Common\
 flag symbol\x00\x00';

// fs.writeFileSync('C:\\Users\\JM\\testPuz.puz', buf, {encoding: 'latin1'});



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


