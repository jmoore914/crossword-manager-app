import {Settings} from '@/types/types';

const appData = window.electronApi.process.env.APPDATA || (window.electronApi.process.platform === 'darwin' ? window.electronApi.process.env.HOME + '/Library/Preferences' : window.electronApi.process.env.HOME + '/.local/share');
export const settingsDirectory = window.electronApi.path.join(appData, 'CrosswordManagerApp');
export const settingsPath = window.electronApi.path.join(settingsDirectory, 'settings.json');

export function isSettings(obj: unknown): obj is Settings {
	return typeof obj === 'object' && obj !== null && 
        'nytCookie' in obj && typeof obj.nytCookie === 'string' &&
        'downloadLocation' in obj && typeof obj.downloadLocation === 'string';
}