export function splitArtist(artist: string, seperator: string): string[] {
  let splitArtists: string[] = artist.split(seperator);
  if (splitArtists[0].includes(", ")) {
    let stillToBeSplit = splitArtists.shift();
    if (stillToBeSplit) {
      splitArtists.unshift(...stillToBeSplit.split(", "));
    }
  }
  return splitArtists;
}
