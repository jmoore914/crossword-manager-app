const fs = require('fs');

const newHistoryRaw = fs.readFileSync('C:\\Users\\JM\\Docs\\Crosswords\\history.json');
const newHistory = JSON.parse(newHistoryRaw);

const oldHistoryRaw = fs.readFileSync('C:\\Users\\JM\\Dropbox\\VSCode\\Crosswords\\src\\history.json');
const oldHistory = JSON.parse(oldHistoryRaw);

Object.keys(oldHistory)
	.filter(key => !Object.keys(newHistory).includes(key))
	.forEach(key => {
		const data = oldHistory[key];
		const puzzles = Object.keys(data);
		const filteredPuzzles = puzzles.filter(puzzle => data[puzzle] !== '');
		if(filteredPuzzles.length > 0){
			const splitDate = key.split('');
			const year = parseInt('20' + splitDate[0] + splitDate[1]);
			const month = parseInt([splitDate[2], splitDate[3]].join('')) - 1;
			const day = parseInt([splitDate[4], splitDate[5]].join(''));
			const date = new Date(year, month, day, 12).toISOString().split('T')[0];
			newHistory[date] = {};
			filteredPuzzles.forEach(puzzle => {
				const upperPuzzle = puzzle.toUpperCase();
				newHistory[date][upperPuzzle] = oldHistory[key][puzzle];
			});
		}
	});

console.log(JSON.stringify(newHistory, null, 2));
fs.writeFileSync('C:\\Users\\JM\\Docs\\Crosswords\\history2.json', JSON.stringify(newHistory, null, 2));