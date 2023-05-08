<template>
	<div
		v-show="show"
		class="bigContainer"
	>
		<div class="smallContainer center">
			<div class="loader center" />
		</div>
	</div>
</template>

<script setup lang="ts">

import {computed} from 'vue';
import {useStore} from '@/store/store';


const store = useStore();

const show = computed(() => store.showLoading);

</script>

<style>

.bigContainer{
    width: 100vw;
    height: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
}

.smallContainer{
    position: fixed
}

.loader {
    --size: 5vw;
    border: var(--size) solid #f3f3f3; /* Light grey */
    border-top: var(--size) solid #7e8d97; /* Blue */
    border-radius: 50%;
    width: calc(var(--size) * 6);
    aspect-ratio: 1;  
    animation: spin 2s linear infinite;
    margin: 0;
    /* position: absolute; */
}

@keyframes spin {
  0% { transform: rotate(0deg)}
  100% { transform: rotate(360deg)}
}

</style>