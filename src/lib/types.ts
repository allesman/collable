// export interface SearchResult {
//   result: Song;
// }

export interface Song {
  song_art_image_thumbnail_url: string;
  header_image_thumbnail_url: string;
  id: number;
  title: string;
  artist_names: string;
  primary_artists: Artist[];
  featured_artists: Artist[];
  combined_artists: Artist[];
}

export interface Artist {
  image_url: string;
  id: number;
  name: string;
}

export interface Modal {
  openModal: () => void;
}

export interface DailyGame {
  startArtist: string;
  goalArtist: string;
}
