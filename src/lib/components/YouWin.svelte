<script lang="ts">
  import Icon from "@iconify/svelte";

  let dialog: HTMLDialogElement;
  export let numGuesses: number;
  export let startArtistName: string;
  export let goalArtistName: string;
  export let isCustom: boolean;
  export function openModal() {
    dialog.showModal();
  }
  const date = new Date();

  let copyMessage: string | undefined = undefined;
  function copyToClipboard() {
    const text = `🎵  ${isCustom ? `Custom Musicalle ✨` : `Musicalle ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`}

${startArtistName} → 👤 ${numGuesses - 1} → ${goalArtistName}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        copyMessage = "Copied results to clipboard!";
        setTimeout(() => {
          copyMessage = undefined;
        }, 1500);
      })
      .catch((err) => {
        copyMessage = "Failed to copy results to clipboard :(";
      });
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
    <h3 class="text-2xl font-bold text-primary">You Win!</h3>
    <p class="py-4">
      It took you <span class="text-primary font-bold">{numGuesses}</span>
      {numGuesses == 1 ? "guess" : "guesses"} to get from
      <span class="text-primary font-bold">{startArtistName}</span>
      to
      <span class="text-primary font-bold">{goalArtistName}</span>!
    </p>
    <div class="modal-actions">
      <button class="btn btn-primary text-base" on:click={copyToClipboard}>
        <Icon icon="mdi:share-variant" class="text-xl" />Share
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
  {#if copyMessage}
    <div
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-base-100 text-white py-2 px-4 rounded shadow-lg z-50"
    >
      {copyMessage}
    </div>
  {/if}
</dialog>
