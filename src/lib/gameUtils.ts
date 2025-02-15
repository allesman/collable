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
        const songs = await geniusApi.getSongs(artistId, amount);
        // add combined artists
        // TODO: move this logic to when song is actually clicked?
        for (let i = 0; i < songs.length; i++) {
            let primary = songs[i].primary_artists;
            const features = songs[i].featured_artists;
            const combinedArtists = primary.concat(features);
            songs[i]["combined_artists"] = combinedArtists;
        }
        return songs;
    } catch (e) {
        console.error(e);
        return error(500, "Error while fetching defaultSongs");
    }
}