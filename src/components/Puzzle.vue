<template>
	<div class="puzzleGrid">
		<div class="flexVCenter">
			{{ puzzle + ':' }}
		</div>
		<div
			class="statusIconContainer flexCenter"
			:class="[status === undefined || status === '' ? 'missing' : status]"
		>
			<img
				class="statusIcon img"
				alt="play"
				:src="getSrc()"
				@click="emit('click')"
			>
		</div>
	</div>
</template>

<script setup lang="ts">

import puzIconSrc from '@/assets/puzIcon.svg';
import downIconSrc from '@/assets/downIcon.svg';
import pencilIconSrc from '@/assets/pencilIcon.svg';
import checkIconSrc from '@/assets/checkIcon.svg';
import xIconSrc from '@/assets/xIcon.svg';

const props = defineProps<{
	puzzle: string;
	status: string;
}>();

const emit = defineEmits<{
	(event: 'click'): void;
}>();

function getSrc(): string {
	switch(props.status){
		case 'downloaded':
			return pencilIconSrc;
		case 'played':
			return checkIconSrc;
		case 'error':
			return xIconSrc;
		default:
			return downIconSrc;
	}
}

</script>

<style>

.puzzleGrid{
    display: grid;
    grid-template-columns:calc(8 * var(--base-size)) calc(5 * var(--base-size));
    padding-right:calc(8 * var(--base-size));
}

.missing{
    --icon-color: rgb(150, 150, 253);
}

.downloaded{
    --icon-color: black;
}

.played{
    --icon-color:#94e294;
}

.error{
    --icon-color: #faa7a7;
}

.statusIcon{
    width:calc(3 * var(--base-size));
    aspect-ratio: 1;
    
    padding: calc(.5 * var(--base-size));
}

.statusIcon:hover{
	cursor: pointer;
}

.statusIconContainer{
    border: calc(.2 * var(--base-size)) solid var(--icon-color);
    /* width: calc(3 * var(--base-size)); */
    aspect-ratio: 1;
    border-radius: 50%;
}

</style>