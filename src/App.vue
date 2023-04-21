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

