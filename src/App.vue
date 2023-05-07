<template>
	<div class="app">
		<Settings />
		<div>
			<img
				:src="settingsIconSrc"
				alt="settings"
				class="img hoverable settingsIcon"
				@click="openSettings"
			>
		</div>
		<div>
			<div class="dateSelectorGrid">
				<div class="flexVCenter">
					Select Date: 
				</div>
				<div>
					<div class="flexVCenter">
						<input
							v-model="selectedDate"
							type="date"
							class="dateInput"
						>
					</div>
				</div>
			</div>
		</div>
		<Puzzles />
	</div>
</template>


<script setup lang="ts">

import {computed} from 'vue';

import settingsIconSrc from '@/assets/settingsIcon.svg';
import {useStore} from '@/store/store';

import Settings from '@/components/Settings.vue';
import Puzzles from './components/Puzzles.vue';


const store = useStore();


const selectedDate = computed({
	get: () => store.selectedDate,
	set: (date: string) => store.setSelectedData(date)
});


store.loadSettings();


function openSettings(): void{
	store.displaySettingsModal();
}

store.loadHistory();

</script>


<style scoped>

.app{
	padding-left:calc(1 * var(--base-size));
}
.settingsIcon{
  position: absolute;
  top:calc(1 * var(--base-size));
  right:calc(7 * var(--base-size));
  width:calc(5 * var(--base-size));
  aspect-ratio: 1;
}



.dateSelectorGrid{
	display: flex;
	column-gap:calc(3 * var(--base-size));
	width: 100%;
	height:calc(4 * var(--base-size));
	padding-top:calc(3 * var(--base-size));
}

.dateSelectorLabelContainer{
	height:calc(5 * var(--base-size));
}

</style>

<style src="./style.css" />

