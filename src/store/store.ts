import {defineStore} from 'pinia';

interface MainStoreState{
	showSettingsModal: boolean;
	showSettingsContainer: boolean;
} 

export const useMainStore = defineStore('mainStore', {
	state: () => {
		return {
			showSettingsModal: false,
			showSettingsContainer: false
		} as MainStoreState;
	},
	actions: {
		showSettings(): void {
			this.showSettingsContainer = true;
			this.showSettingsModal = true;
		},
		hideSettingsModal(): void {
			this.showSettingsModal = false;
		},
		hideSettingsContainer(): void {
			this.showSettingsContainer = false;
		}
	}
});