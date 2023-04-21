<template>
	<div>
		<img
			:src="settingsIconSrc"
			alt="settings"
			class="img hoverable settingsIcon"
			@click="openSettings"
		>
	</div>
</template>

<script setup lang="ts">

import settingsIconSrc from './assets/settingsIcon.svg';
import fs from 'fs';
import path from 'path';

const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
console.log(appData);
const settingsDirectory = path.join(appData, 'CrosswordManagerApp');
console.log(settingsDirectory);
if(!fs.existsSync(appData)){
	fs.mkdirSync(settingsDirectory);
}
const settingsPath = path.join(settingsDirectory, 'settings.json');
if(!fs.existsSync(settingsPath)){
	const blankSettings = {installDirectory: null, nytCookie: null};
	fs.writeFileSync(settingsPath, JSON.stringify(blankSettings, null, 2));
}

function openSettings(): void{
	console.log('settings');
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

