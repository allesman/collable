import { pushToDB, getAllData } from "./dbUtil.js";
import fs from 'fs';
import csv from 'fast-csv';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DateTime } from "luxon";

import GeniusApi from "./GeniusApi.ts";
import { error } from "@sveltejs/kit";
import type { DailyGame } from "./types.ts";

let artistsList: string[] = [];

export async function createNewGamesUntil(untilDateStr: string) {
    const date = DateTime.fromISO(untilDateStr);
    let games = [];
    // get todays date
    const data = await getAllData();
    let latestDateStr = DateTime.now().setZone('Pacific/Kiritimati').toFormat("yyyy-MM-dd");
    let latestDate = DateTime.fromISO(latestDateStr);
    const existingDates = new Set(Object.keys(data));
    while (latestDate < date) {
        latestDate.plus({ days: 1 });
        latestDateStr = latestDate.toFormat("yyyy-MM-dd");
        if (!existingDates.has(latestDateStr)) {
            try {
                games.push(await createNewGame(latestDateStr));
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    return games;

}

export async function createNewGame(dateStr?: string, startArtist?: string, goalArtist?: string): Promise<DailyGame> {
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
    // TODO: check if connection even exists???
    if (startArtist === goalArtist) {
        return error(422, { message: "Start artist and goal artist can't be the same" });
    }
    const geniusApi = await GeniusApi.initialize();
    let startArtistObj = await geniusApi.getArtistInfoFromName(startArtist);
    if (!startArtistObj) {
        throw error(422, { message: `Artist "${startArtist}" not found` });
    }
    let goalArtistObj = await geniusApi.getArtistInfoFromName(goalArtist);
    if (!goalArtistObj) {
        throw error(422, { message: `Artist "${goalArtist}" not found` });
    }
    const dailyGameEntry = {
        startArtist: startArtist,
        goalArtist: goalArtist,
    };
    return await pushToDB(dailyGameEntry, dateStr);
}

async function getArtistList(): Promise<string[]> {
    if (artistsList.length > 0) {
        return artistsList;
    }
    // FIXME: dude temporary asf fix
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    let artistsFilePath = __dirname + '/../../../../../client/artists.csv';
    if (!fs.existsSync(artistsFilePath)) {
        // Development mode
        artistsFilePath = __dirname + '/../../static/artists.csv';
    }

    return new Promise((resolve, reject) => {
        fs.createReadStream(artistsFilePath)
            .pipe(csv.parse({ headers: false }))
            .on('error', error => {
                console.error(error);
                reject(error);
            })
            .on('data', (row) => { artistsList.push(row[0]); })
            .on('end', () => {
                console.assert(artistsList.length > 0, 'Artists list is empty');
                resolve(artistsList);
            });
    });
}

// getArtistList();