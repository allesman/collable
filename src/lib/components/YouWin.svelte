<script lang="ts">
  import Icon from "@iconify/svelte";

  let dialog: HTMLDialogElement;
  export let numGuesses: number;
  export let startArtistName: string;
  export let goalArtistName: string;
  export let isCustom: boolean;
  export let dateStamp: string;
  export let usedHint: boolean;
  export let path: string[];
  export function openModal() {
    dialog.showModal();
  }

  let copyMessage: string | undefined = undefined;
  function copyResultToClipboard() {
    const url = new URL(window.location.href);
    // To avoid unnecessary parameters (e.g. added by ig)
    const trimmedUrl =
      "https://collable.app" +
      (isCustom
        ? `/custom?s=${url.searchParams.get("s")}&g=${url.searchParams.get("g")}`
        : "");
    const text = `🎵  ${isCustom ? `Custom Collable ✨` : `Collable ${dateStamp}`}

${startArtistName} → 👤 ${numGuesses - 1} → ${goalArtistName}${usedHint ? " 💡" : ""}

${trimmedUrl}`;
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

  function copySolutionToClipboard() {
    const text = "||" + path.join(" → ") + "||";
    navigator.clipboard
      .writeText(text)
      .then(() => {
        copyMessage = "Copied solution to clipboard!";
        setTimeout(() => {
          copyMessage = undefined;
        }, 1500);
      })
      .catch((err) => {
        copyMessage = "Failed to copy solution to clipboard :(";
      });
  }
</script>

<dialog class="modal" id="my_modal_1" bind:this={dialog}>
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="text-2xl font-bold text-primary">You Win!</h3>
    <p class="py-4">
      It took you <span class="text-primary font-bold">{numGuesses - 1}</span>
      {numGuesses - 1 == 1 ? "artist" : "artists"} to get from
      <span class="text-primary font-bold">{startArtistName}</span>
      to
      <span class="text-primary font-bold">{goalArtistName}</span>!
    </p>
    <div class="modal-actions">
      <button
        class="btn btn-primary text-base"
        on:click={copyResultToClipboard}
      >
        <Icon icon="mdi:share-variant" class="text-xl" />Share
      </button>
      <button
        class="btn btn-primary text-base"
        on:click={copySolutionToClipboard}
      >
        <Icon icon="mdi:content-copy" class="text-xl" />Copy Path
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
