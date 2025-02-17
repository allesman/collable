<script lang="ts">
    import type { PageData } from "./$types";
    import Hint from "$lib/components/Hint.svelte";
    import Icon from "@iconify/svelte";
    import type { Artist } from "$lib/types";
    let hint: Hint;
    let artistObj: Artist = {
        image_url: "google.com",
        id: 123,
        name: "Quad",
    };
    // let { data }: { data: PageData } = $props();

    function handleGetHint(): void {
        hint.openModal();
    }
</script>

<div class="flex items-center gap-1">
    <button class="btn" on:click={handleGetHint}>
        Hint
        <Icon icon="mdi:lightbulb" />
    </button>
</div>
<Hint bind:this={hint} artistName="quad" {artistObj} />
