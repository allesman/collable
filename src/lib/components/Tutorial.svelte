<script lang="ts">
  import Icon from "@iconify/svelte";

  let dialog: HTMLDialogElement;
  export function openModal() {
    dialog.showModal();
  }
  async function handleExampleGame() {
    // redirect to custom game page
    window.open(`/custom?s=563&g=9534`); // Queen -> David Bowie
  }
</script>

<dialog
  class="modal invisible"
  id="my_modal_1"
  bind:this={dialog}
  tabindex="-1"
>
  <div class="modal-box text-center">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="text-3xl font-bold text-primary shadow-primary">How To Play</h3>
    <p class="py-1 text-2xl mt-3">
      <span class="font-bold text-shadow-soft shadow-base-content"
        >collable</span
      >
      is all about connecting the dots between different artists!
    </p>
    <!-- <p class="py-1 text-2xl">
      Your task is to get from a <span class="font-bold">Start Artist</span> to
      a
      <span class="font-bold">Goal Artist</span>.
    </p> -->
    <p class="py-1 text-2xl">
      Move from one artist to another through songs that <span class="font-bold"
        >feature both artists</span
      >.
    </p>

    <!-- <p class="py-1 text-2xl">
      You can either click on any of the songs listed or search for a specific
      one.
    </p> -->
    <p class="py-1 text-2xl">
      If you get stuck, use the
      <span class="inline-flex">
        <Icon icon="mdi:lightbulb" class="text-xl font-bold" />
      </span> <span class="font-bold">Hint</span>.
    </p>
    <div class="modal-actions pt-3">
      <button class="btn btn-primary text-base" on:click={handleExampleGame}>
        <Icon icon="mdi:star-outline" class="text-xl" />Try Easy Example
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<style>
  .inline-flex {
    display: inline-flex;
    align-items: center;
  }
</style>
