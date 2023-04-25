<template>
	<div class="puzzles">
		<div class="label">
			Daily:
		</div>
		<div class="puzzlesRow">
			<div
				v-for="puzzle in dailies"
				:key="puzzle"
			>
				<Puzzle
					:puzzle="puzzle"
					:status="dateHistory[puzzle]"
					@click="puzzleClick(puzzle)"
				/>
			</div>
		</div>
		<div class="label">
			Weekly:
		</div>
		<div class="puzzlesRow">
			<div
				v-for="puzzle in weeklies"
				:key="puzzle"
			>
				<Puzzle
					:puzzle="puzzle"
					:status="dateHistory[puzzle]"
					@click="puzzleClick(puzzle)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">

import {computed} from 'vue';

import {PuzzleName, Status} from '@/types/types';
import Puzzle from './Puzzle.vue';
import {useStore} from '@/store/store';


const dailies: PuzzleName[] = ['NYT', 'WSJ', 'LAT'];
const weeklies: PuzzleName[] = ['JZ', 'BEQ', 'BEQ2'];

const store = useStore();

const dateHistory = computed(() => store.getDateHistory);

function puzzleClick(puzzleName: PuzzleName): void{
	const selectedDate = store.selectedDate;
	const dateHist = dateHistory.value;
	const currentStatus: Status = puzzleName in dateHist ? dateHist[puzzleName] : 'missing';
	if(currentStatus === 'missing'){
		store.saveHistory(selectedDate, puzzleName, 'downloaded');
	}
	else if (currentStatus === 'downloaded'){
		store.saveHistory(selectedDate, puzzleName, 'played');
	}
}



</script>

<style scoped>

.puzzlesRow{
    display: flex;
}

</style>

<style scoped>

.label{
    font-weight: bold;
    padding:calc(4 * var(--base-size)) 0;
    
}

</style>