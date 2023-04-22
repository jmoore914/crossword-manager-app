<template>
	<Modal
		:show-container="showContainer"
		:show-modal="showModal"
		@close="close"
		@after-leave="afterLeave"
	>
		<div class="settingsModal">
			<h3>Settings</h3>
			<div class="settingsGrid">
				<div>
					Download Location:
				</div>
				<input v-model="downloadLocation">
                
				<div>NYT Cookie:</div>
				<input v-model="nytCookie">
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">

import {computed, ref} from 'vue';

import Modal from '@/components/Modal.vue';
import {useMainStore} from '@/store/store';

const store = useMainStore();

const showModal = computed(() => store.showSettingsModal);
const showContainer = computed(() => store.showSettingsContainer);

const downloadLocation = ref('');
const nytCookie = ref('');

function close(): void {
	store.hideSettingsModal();
}

function afterLeave(): void {
	store.hideSettingsContainer();
}

</script>

<style scoped>

.settingsModal{
    width: 50vw;
}

.settingsGrid{
    display: grid;
    grid-template-columns: 30% 50%;
    column-gap: .5vw;
    row-gap: 1.5vh;
}

</style>