const { pushToDB, fetchData, getAllData, getLatestDate } = require("./dbUtil.cjs");
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

let artistsList = [];
// import type { DailyGame } from "./types";

async function createNewGamesUntil(untilDateStr) {
    date = new Date(untilDateStr);
    // get latest date with data
    data = await getAllData();
    let latestDateStr = getLatestDate(data);
    let latestDate = new Date(latestDateStr);
    while (latestDate < date) {
        latestDate.setDate(latestDate.getDate() + 1);
        latestDateStr = latestDate.toISOString().substring(0, 10);
        createNewGame(latestDateStr);
    }
}

async function createNewGame(dateStr = null) {
    let artistsList = await getArtistList();
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
}

async function getArtistList() {
    if (artistsList.length > 0) {
        return artistsList;
    }
    const artistsFilePath = path.join(__dirname, '../../static/artists.csv');

    return new Promise((resolve, reject) => {
        fs.createReadStream(artistsFilePath)
            .pipe(csv.parse({ headers: false }))
            .on('error', error => {
                console.error(error);
                reject(error);
            })
            .on('data', (row) => { artistsList.push(row[0]); })
            .on('end', () => {
                console.log(`Parsed ${artistsList.length} rows`);
                console.assert(artistsList.length > 0, 'Artists list is empty');
                resolve(artistsList);
            });
    });
}

if (require.main === module) {
    createNewGamesUntil("2025-04-01");
}

// module.exports = createNewGame;
