const { pushToDB, fetchData, getAllData, getLatestDate } = require("./dbUtil.cjs");
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
// import type { DailyGame } from "./types";

// module.exports = createNewGame;

async function createNewBatch(untilDateStr) {
    date = new Date(untilDateStr);
    // get latest date with data
    data = await getAllData();

    const artistsFilePath = path.join(__dirname, '../../static/artists.csv');
    let artistsList = [];

    fs.createReadStream(artistsFilePath)
        .pipe(csv.parse({ headers: false }))
        .on('error', error => console.error(error))
        .on('data', (row) => { artistsList.push(row[0]); })
        .on('end', () => {
            console.log(`Parsed ${artistsList.length} rows`);
            console.assert(artistsList.length > 0, 'Artists list is empty');
            let latestDateStr = getLatestDate(data);
            let latestDate = new Date(latestDateStr);
            while (latestDate < date) {

                const getRandomArtist = () => artistsList[Math.floor(Math.random() * artistsList.length)];
                const addGame = (dateStr) => {
                    do {
                        startArtist = getRandomArtist();
                        goalArtist = getRandomArtist();
                    }
                    while (startArtist === goalArtist);
                    const dailyGameEntry = {
                        startArtist: startArtist,
                        goalArtist: goalArtist,
                    };
                    pushToDB(dailyGameEntry, dateStr);
                    console.log(`Created ${startArtist} -> ${goalArtist}`);
                }
                addGame(latestDateStr);
                latestDate.setDate(latestDate.getDate() + 1);
                latestDateStr = latestDate.toISOString().substring(0, 10);
                // process.exit();
            }
        });
}

function createNewGame(dateStr = null) {
    const artistsFilePath = path.join(__dirname, '../../static/artists.csv');
    let artistsList = [];

    fs.createReadStream(artistsFilePath)
        .pipe(csv.parse({ headers: false }))
        .on('error', error => console.error(error))
        .on('data', (row) => { artistsList.push(row[0]); })
        .on('end', () => {
            console.log(`Parsed ${artistsList.length} rows`);
            console.assert(artistsList.length > 0, 'Artists list is empty');
            const getRandomArtist = () => artistsList[Math.floor(Math.random() * artistsList.length)];
            do {
                startArtist = getRandomArtist();
                goalArtist = getRandomArtist();
            }
            while (startArtist === goalArtist);
            const dailyGameEntry = {
                startArtist: startArtist,
                goalArtist: goalArtist,
            };
            pushToDB(dailyGameEntry, dateStr);
            console.log(`Created ${startArtist} -> ${goalArtist}`);
            // process.exit();
        });
}

if (require.main === module) {
    createNewBatch("2025-03-01");
}