import { error } from "@sveltejs/kit";
import GeniusApi from "./GeniusApi";
import type { Song } from "./types";

export async function getDefaultSongs(artistId: string, amount: number = 10): Promise<Song[]> {
    // returns default songs for artist with added combined artists for each song
    const geniusApi = await GeniusApi.initialize();
    console.assert(geniusApi, "GeniusApi not initialized");
    if (!artistId) {
        throw error(422, { message: "Artist ID not provided" });
    }
    try {
        // we only get and return the <=10 new songs aka those from the last page
        const songs = await geniusApi.getSongs(artistId, 10, Math.ceil(amount / 10));
        return songs;
    } catch (e) {
        console.error(e);
        return error(500, "Error while fetching defaultSongs");
    }
}