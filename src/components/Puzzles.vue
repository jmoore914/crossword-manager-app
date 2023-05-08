<template>
	<div class="puzzles">
		<div class="label">
			Daily:
		</div>
		<div class="puzzlesRow">
			<div
				v-for="puzzle in mapPuzzles(dailyPuzzles)"
				:key="puzzle.puzzleName"
			>
				<Puzzle
					:puzzle="puzzle.puzzleName"
					:status="getPuzzleStatus(puzzle.puzzleName, puzzle.date)"
					@click="puzzleClick(puzzle.puzzleName, puzzle.date)"
				/>
			</div>
		</div>
		<div class="label">
			Weekly:
		</div>
		<div class="puzzlesRow">
			<div
				v-for="puzzle in mapPuzzles(weekyPuzzles)"
				:key="puzzle.puzzleName"
			>
				<Puzzle
					:puzzle="puzzle.puzzleName"
					:status="getPuzzleStatus(puzzle.puzzleName, puzzle.date)"
					@click="puzzleClick(puzzle.puzzleName, puzzle.date)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">


import {PuzzleName, Status, Puzzle as IPuzzle} from '@/types/types';
import Puzzle from './Puzzle.vue';
import {useStore} from '@/store/store';
import {PuzzleActions, puzzles, isDailyPuzzle, isWeeklyPuzzle} from '@/utilities/puzzles';
import {previousDay} from 'date-fns';


const dailyPuzzles = puzzles.filter(isDailyPuzzle);
const weekyPuzzles = puzzles.filter(isWeeklyPuzzle);

const store = useStore();

function mapPuzzles(puzzles: IPuzzle[]): {puzzleName: PuzzleName; date: string}[]{
	return puzzles.map(puzzle => {
		return {puzzleName: puzzle.name, date: getPuzzleDate(puzzle)};
	});
}

function getPuzzleDate(puzzle: IPuzzle): string{
	if(isDailyPuzzle(puzzle)){
		return store.selectedDate;
	}
	else{
		const selectedDate = new Date(store.selectedDate + 'T12:00:00Z');
		if(selectedDate.getDay() === puzzle.day){
			return store.selectedDate;
		}
		else{
			return previousDay(selectedDate, puzzle.day).toISOString().split('T')[0];
		}
	}
}

function getPuzzleStatus(puzzleName: PuzzleName, date: string): Status{
	return store.getDateHistory(date, puzzleName);
}

async function puzzleClick(puzzleName: PuzzleName, date: string): Promise<void>{
	const currentStatus: Status = getPuzzleStatus(puzzleName, date);
	let action = '';
	let newStatus: null | Status = null;
	const puzzleActions = new PuzzleActions(store.settings, puzzleName, date);
	try{
		if(currentStatus === 'missing' || currentStatus === 'error'){
			store.displayLoading();
			action = 'downloading';
			await puzzleActions.downloadPuzzle();
			newStatus = 'downloaded';
		}
		else{
			action = 'opening';
			puzzleActions.openPuzzle();
			newStatus = 'played';
		}
	}
	catch(e){
		store.saveHistory(date, puzzleName, 'error');
		if(action !== 'opening'){
			window.electronApi.electron.showErrorBox('Error', `Error ${action} ${puzzleName} for ${date}. \n\nMessage: ${(e as Error).toString()}`);
		}
	}
	store.hideLoading();
	if(newStatus !== null){
		store.saveHistory(date, puzzleName, newStatus);
	}
}




</script>

<style scoped>

.puzzlesRow{
    display: grid;
	grid-template-columns:  32% 32% 32%;
	row-gap: 5vw;
}

</style>

<style scoped>

.label{
    font-weight: bold;
    padding:calc(4 * var(--base-size)) 0;
    
}

</style>