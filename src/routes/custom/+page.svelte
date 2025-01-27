<script lang="ts">
  import type { PageData } from "./$types";
  import Game from "$lib/components/Game.svelte";
  import type { Artist, Song } from "$lib/types";
  // export let data: PageData;
  export let data: {
    startArtist: Artist;
    goalArtist: Artist;
    isCustom: boolean;
    defaultSongs: Song[];
  };
</script>

<Game {data} />
