<!-- TODO:add eslint -->
<script lang="ts">
  import Game from "../lib/components/Game.svelte";
  import type { Artist } from "$lib/types.js";

  // get the data from the server
  export let data: {
    startArtist: Artist;
    goalArtist: Artist;
    isCustom: boolean;
  };
</script>

<Game {data} />
