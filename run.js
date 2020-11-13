const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const csvWriter = createCsvWriter({
    path: 'output.csv',
    header: [
        {id: 'Timestamp', title: 'Timestamp'},
        {id: 'Viewers', title: 'Viewers'},
        {id: 'Chatters', title: 'Chatters'},
        {id: 'Subs', title: 'Subs'},
        {id: 'date', title: 'Date'}
    ]
});

output = [];
promises = [];

function main() {
	var csvs = fs.readdirSync('data');

	for(const csv of csvs) {
		if(!csv.startsWith("Stream Session from"))
			continue;

		const dateRaw = csv.split(/(Stream Session from )([0-9]{1,2})_([0-9]{1,2})_([0-9]{4})/g);
		const date = `${dateRaw[3]}/${dateRaw[2]}/${dateRaw[4]}`;

		promises.push(new Promise((res, rej) => {
			fs.createReadStream(`data/${csv}`)
			.pipe(csvParser())
			.on('data', (row) => {
				row.date = date;
				output.push(row)
			})
			.on('end', () => {
				res()
			});
		}))
	}

	Promise.all(promises)
	.then(e => {
		csvWriter.writeRecords(output)
	    .then(() => {
	        console.log('...Done');
	    });
	})
}

main();