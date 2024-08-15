<script lang="ts">
  let dialog: HTMLDialogElement;
  export let numGuesses: number;
  export let startArtistName: string;
  export let goalArtistName: string;
  export function openModal() {
    dialog.showModal();
  }
</script>

<dialog class="modal" id="my_modal_1" bind:this={dialog}>
  <div class="modal-box">
    <!-- FIXME: Disable closing while submitting -->
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="text-2xl font-bold text-success">You Win!</h3>
    <p class="py-4">
      It took you <span class="text-success font-bold">{numGuesses}</span>
      {numGuesses == 1 ? "guess" : "guesses"} to get from
      <span class="text-success font-bold">{startArtistName}</span>
      to
      <span class="text-success font-bold">{goalArtistName}</span>!
    </p>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
