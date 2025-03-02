<!-- TODO:add svelte eslint -->
<script lang="ts">
  import Game from "../lib/components/Game.svelte";
  import type { PageData } from "./$types";
  export let data: PageData;
</script>

<Game {data} />
