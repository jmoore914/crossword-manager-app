<template>
	<div>
		<Settings />
		<div>
			<img
				:src="settingsIconSrc"
				alt="settings"
				class="img hoverable settingsIcon"
				@click="openSettings"
			>
		</div>
	</div>
</template>

<script setup lang="ts">

import settingsIconSrc from './assets/settingsIcon.svg';
import fs from 'fs';
import path from 'path';
import {useMainStore} from './store/store';

import Settings from '@/components/Settings.vue';

const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
const settingsDirectory = path.join(appData, 'CrosswordManagerApp');
console.log(fs.existsSync(settingsDirectory));

if(!fs.existsSync(settingsDirectory)){
	console.log('Creating settings directory');
	fs.mkdirSync(settingsDirectory);
}
const settingsPath = path.join(settingsDirectory, 'settings.json');
if(!fs.existsSync(settingsPath)){
	const blankSettings = {installDirectory: null, nytCookie: null};
	fs.writeFileSync(settingsPath, JSON.stringify(blankSettings, null, 2));
}

function openSettings(): void{
	const store = useMainStore();
	store.showSettings();
}

</script>


<style scoped>
.settingsIcon{
  position: absolute;
  top: 1rem;
  right: 4rem;
  width: 3rem;
  aspect-ratio: 1;
}



</style>

<style src="./style.css" />

