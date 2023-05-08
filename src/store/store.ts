import {DateHistory, History, PuzzleName, Status, Settings} from '@/types/types';
import {isSettings, settingsDirectory, settingsPath} from '@/utilities/shared';
import {defineStore} from 'pinia';

interface StoreState{
	showSettingsModal: boolean;
	showSettingsContainer: boolean;
	showLoading: boolean;
	selectedDate: string;
	history: History;
	settings: Settings;
} 

export const useStore = defineStore('store', {
	state: () => {
		return {
			showSettingsModal: false,
			showSettingsContainer: false,
			showLoading: false,
			selectedDate: new Date().toISOString().split('T')[0],
			history: {},
			settings: {
				nytCookie: '',
				downloadLocation: settingsDirectory
			}
		} as StoreState;
	},

	getters: {
		getDateHistory: (state: StoreState) => {
			return (date: string, puzzleName: PuzzleName): Status => {
				if(date in state.history && puzzleName in state.history[date]){
					return state.history[date][puzzleName];
				}
				else{
					return 'missing';
				}
			};
			
			
		}
	},



	actions: {

		loadSettings(): void{
			if(!window.electronApi.fs.existsSync(settingsDirectory)){
				console.log('Creating settings directory');
				window.electronApi.fs.mkdirSync(settingsDirectory);
			}
			try {
				const loaded = JSON.parse(window.electronApi.fs.readFileSync(settingsPath));
				if(isSettings(loaded)){
					this.settings = loaded;
				}
				else{
					throw Error('Invalid settings format');
				}
			}
			catch(e){
				this.displaySettingsModal();
			}
		},

		saveSettings(settings: Settings){
			this.settings = settings;
			window.electronApi.fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
		},



		displaySettingsModal(): void {
			this.showSettingsContainer = true;
			this.showSettingsModal = true;
		},
		hideSettingsModal(): void {
			this.showSettingsModal = false;
		},
		hideSettingsContainer(): void {
			this.showSettingsContainer = false;
		},
		setSelectedData(date: string): void {
			this.selectedDate = date;
		},
		loadHistory(): void {
			let history: History = {};
			try{
				history = JSON.parse(window.electronApi.fs.readFileSync(window.electronApi.path.join(this.settings.downloadLocation, 'history.json'))) as History;
			}
			catch(e){
				console.log('Failed to read history.');
			}
			this.history = history;
		},


		saveHistory(date: string, puzzleName: PuzzleName, status: Status){
			const oldDateHistory = date in this.history ? this.history[date] : {};
			const newDateHistory = {...oldDateHistory, [puzzleName]: status} as DateHistory;
			this.history[date] = newDateHistory;
			window.electronApi.fs.writeFileSync(window.electronApi.path.join(this.settings.downloadLocation, 'history.json'), JSON.stringify(this.history, null, 2));
		},

		displayLoading(){
			this.showLoading = true;
		},

		hideLoading(){
			this.showLoading = false;
		}
	}
});