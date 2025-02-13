import { pushToDB, getAllData, getLatestDate } from "./dbUtil.js";
import fs from 'fs';
import path from 'path';
import csv from 'fast-csv';

let artistsList: string[] = [];
// import type { DailyGame } from "./types";

async function createNewGamesUntil(untilDateStr: string) {
    const date = new Date(untilDateStr);
    // get latest date with data
    const data = await getAllData();
    let latestDateStr = getLatestDate(data);
    let latestDate = new Date(latestDateStr);
    while (latestDate < date) {
        latestDate.setDate(latestDate.getDate() + 1);
        latestDateStr = latestDate.toISOString().substring(0, 10);
        createNewGame(latestDateStr);
    }
}

async function createNewGame(dateStr: string | null = null) {
    let artistsList: string[] = await getArtistList();
    const getRandomArtist = () => artistsList[Math.floor(Math.random() * artistsList.length)];
    let startArtist: string;
    let goalArtist: string;
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

async function getArtistList(): Promise<string[]> {
    if (artistsList.length > 0) {
        return artistsList;
    }
    const artistsFilePath = path.resolve('static/artists.csv');

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

// Check if this script is being run directly
if (import.meta.url === new URL(import.meta.url).href) {
    // createNewGamesUntil("2025-02-01");
    createNewGame("2025-02-15");
}
