import { pushToDB, getAllData, getCurrentDateString } from "./dbUtil.js";
import fs from 'fs';
import path from 'path';
import csv from 'fast-csv';

let artistsList: string[] = [];

export async function createNewGamesUntil(untilDateStr: string) {
    const date = new Date(untilDateStr);
    let games = [];
    // get todays date
    const data = await getAllData();
    let latestDateStr = getCurrentDateString();
    let latestDate = new Date(latestDateStr);
    const existingDates = new Set(Object.keys(data));
    while (latestDate < date) {
        latestDate.setDate(latestDate.getDate() + 1);
        latestDateStr = latestDate.toISOString().substring(0, 10);
        if (!existingDates.has(latestDateStr)) {
            games.push(await createNewGame(latestDateStr));
        }
    }
    return games;
}

export async function createNewGame(dateStr: string | null = null, startArtist: string | null = null, goalArtist: string | null = null) {
    if (!startArtist || !goalArtist) {
        // one or both artists are not provided, get random artists
        let artistsList: string[] = await getArtistList();
        const getRandomArtist = () => artistsList[Math.floor(Math.random() * artistsList.length)];
        do {
            startArtist = getRandomArtist();
            goalArtist = getRandomArtist();
        }
        while (startArtist === goalArtist);
    }
    // TODO: check if artists are valid
    // TODO: check if connection exists???
    const dailyGameEntry = {
        startArtist: startArtist,
        goalArtist: goalArtist,
    };
    pushToDB(dailyGameEntry, dateStr);
    return dailyGameEntry;
}

async function getArtistList(): Promise<string[]> {
    if (artistsList.length > 0) {
        return artistsList;
    }
    const artistsFilePath = '$lib/artists.csv';

    return new Promise((resolve, reject) => {
        fs.createReadStream(artistsFilePath)
            .pipe(csv.parse({ headers: false }))
            .on('error', error => {
                console.error(error);
                reject(error);
            })
            .on('data', (row) => { artistsList.push(row[0]); })
            .on('end', () => {
                // console.log(`Parsed ${artistsList.length} rows`);
                console.assert(artistsList.length > 0, 'Artists list is empty');
                resolve(artistsList);
            });
    });
}
