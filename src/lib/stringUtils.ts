export function splitArtist(artist: string, seperator: string): string[] {
  const splitArtists: string[] = artist.split(seperator);
  if (splitArtists[0].includes(", ")) {
    const stillToBeSplit = splitArtists.shift();
    if (stillToBeSplit) {
      splitArtists.unshift(...stillToBeSplit.split(", "));
    }
  }
  return splitArtists;
}
