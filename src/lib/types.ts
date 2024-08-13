// export interface SearchResult {
//   result: Song;
// }

export interface Song {
  id: number;
  title: string;
  artist_names: string;
  primary_artists: Artist[];
  featured_artists: Artist[];
  combined_artists: Artist[];
}

export interface Artist {
  id: number;
  name: string;
}
