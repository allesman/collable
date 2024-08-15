<!-- TODO: make reusable for all modals? -->
<script lang="ts">
  import Icon from "@iconify/svelte";
  let dialog: HTMLDialogElement;
  let invalidArtists: { s: boolean; g: boolean } = { s: false, g: false };
  export function openModal() {
    dialog.showModal();
  }
  async function handleCreateCustomGame(event: SubmitEvent) {
    event.preventDefault();
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const result = await response.json();
      console.log(result);
      dialog.close();
      // relad page to show new game
      location.reload();
    } else if (response.status === 404) {
      const error = await response.json();
      invalidArtists = error.error.invalidArtists;
      // console.log(invalidArtists);
    } else {
      console.log("Something went wrong");
    }
  }
</script>

<dialog class="modal" id="my_modal_1" bind:this={dialog}>
  <div class="modal-box">
    <!-- TODO: Disable closing while submitting -->
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="text-2xl font-bold">Create Custom Game</h3>
    <form
      method="POST"
      action="/?/customGame"
      on:submit|preventDefault={handleCreateCustomGame}
      autocomplete="off"
    >
      <label class="label" for="startArtist" />
      <input
        type="text"
        placeholder="Start Artist"
        name="startArtist"
        id="startArtist"
        class="input input-bordered"
        required
      />
      {#if invalidArtists.s}
        <p class="text-red-500">Artist not found</p>
      {/if}
      <label class="label" for="goalArtist" />
      <input
        type="text"
        placeholder="Goal Artist"
        name="goalArtist"
        id="goalArtist"
        class="input input-bordered"
        required
      />
      {#if invalidArtists.g}
        <p class="text-red-500">Artist not found</p>
      {/if}
      <div class="modal-action">
        <label class="label" for="submit" />
        <button class="btn btn-success" id="submit" name="submit">Create</button
        >
      </div>
    </form>
    <!-- TODO: change to Close instead of ✕? -->
    <!-- <div class="modal-action flex"> -->
    <!-- <button class="btn btn-success">Create</button>
    <form method="dialog" class="flex justify-start"> -->
    <!-- if there is a button in form, it will close the modal -->
    <!-- <button class="btn btn-error">Cancel</button>
    </form> -->
    <!-- </div> -->
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
