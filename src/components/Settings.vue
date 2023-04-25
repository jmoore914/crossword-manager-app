<template>
	<Modal
		:show-container="showContainer"
		:show-modal="showModal"
		@close="close"
		@after-leave="afterLeave"
	>
		<div class="settingsModal">
			<h4>Settings</h4>
			<div class="settingsGrid">
				<div>
					Download Location:
				</div>
				<input
					v-model="settings.downloadLocation"
					class="textInput"
				>
				<img
					:src="folderIconSrc"
					alt="open"
					class="img hoverable folderIcon icon"
					@click="openDialog"
				>
                
				<div>NYT Cookie:</div>
				<input
					v-model="settings.nytCookie"
					class="settingsInput textInput"
				>
				<div />
			</div>
			<div class="buttons">
				<button
					class="button darkGreyButton secondaryButton"
					@click="close"
				>
					Cancel
				</button>
				<button
					class="button blueButton primaryButton"
					@click="saveSettings"
				>
					Save
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">

import {computed, ref} from 'vue';

import Modal from '@/components/Modal.vue';
import {useStore} from '@/store/store';
import {settingsPath} from '@/utilities/shared';

import folderIconSrc from '@/assets/folderIcon.svg';


const store = useStore();

const showModal = computed(() => store.showSettingsModal);
const showContainer = computed(() => store.showSettingsContainer);

const loadedSettings = computed(() => store.settings);

const settings = ref({
	downloadLocation: loadedSettings.value.downloadLocation,
	nytCookie: loadedSettings.value.nytCookie
});

function openDialog(): void{
	const selectedDirectory = window.electronApi.electron.openDirectory();
	if(selectedDirectory.length === 1){
		settings.value.downloadLocation = selectedDirectory[0];
	}
}

function saveSettings(): void{
	store.saveSettings(settings.value);
	close();
}

function close(): void {
	store.hideSettingsModal();
}

function afterLeave(): void {
	store.hideSettingsContainer();
}

</script>

<style scoped>

.settingsModal{
    width:calc( 55 * var(--base-size));
}

.settingsGrid{
    display: grid;
    grid-template-columns: 30% 55% 5%;
    column-gap:calc( 1 * var(--base-size));
    row-gap: calc(.5 * var(--base-size));
}



.icon{
	width: calc(3.8 * var(--base-size));
	aspect-ratio: 1;
}
.buttons{
    padding-top:calc( 3 * var(--base-size));
}

</style>