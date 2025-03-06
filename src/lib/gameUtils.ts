import { error } from "@sveltejs/kit";
import GeniusApi from "./GeniusApi";
import type { Song } from "./types";

export async function getDefaultSongs(artistId: string, amount: number = 10, featuringOnly: boolean = false): Promise<Song[]> {
    // returns default songs for artist with added combined artists for each song
    const geniusApi = await GeniusApi.initialize();
    console.assert(geniusApi, "GeniusApi not initialized");
    if (!artistId) {
        throw error(422, { message: "Artist ID not provided" });
    }
    try {
        const songs = await geniusApi.getSongs(artistId, 10, Math.ceil(amount / 10));
        let returnSongs = [];
        if (featuringOnly) {
            // for the hint popup, it would be bad to show songs that the artist is not featured in (player can't use them)
            // FIXME: also get 10 songs
            for (let i = 0; i < songs.length; i++) {
                const primary = songs[i].primary_artists;
                const features = songs[i].featured_artists;
                const combinedArtists = primary.concat(features);
                for (const element of combinedArtists) {
                    if (element.id == artistId) {
                        returnSongs.push(songs[i]);
                        break;
                    }
                }
            }
            // TODO: filter out results that aren't songs??
        }
        else {
            // for the normal songs displayed when playing
            // we only get and return the <=10 new songs aka those from the last page
            returnSongs = songs;
        }
        return returnSongs;
    } catch (e) {
        console.error(e);
        return error(500, "Error while fetching defaultSongs");
    }
}