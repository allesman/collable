<script lang="ts">
  let dialog: HTMLDialogElement;
  let invalidArtists: { s: boolean; g: boolean } = { s: false, g: false };
  let sameArtists: boolean = false;
  let errorMessage: string = "";
  let focusOnThis: HTMLInputElement | null = null;
  export function openModal() {
    dialog.showModal();
    if (focusOnThis) {
      focusOnThis.focus();
    }
  }
  async function handleCreateCustomGame(event: SubmitEvent) {
    event.preventDefault();
    submitting = true;
    const form: HTMLFormElement = event.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });
    submitting = false;
    if (response.ok) {
      const result = await response.json();
      const customArtists = JSON.parse(JSON.parse(result.data)[0]);
      dialog.close();
      // redirect to custom game page
      const customPath = `/custom?s=${customArtists.startArtistId}&g=${customArtists.goalArtistId}`;
      const popUp = window.open(customPath);
      if (popUp == null || typeof popUp == "undefined") {
        console.log(
          "Your browser is blocking pop-ups. To let new games open up in a new tab, please check your browser settings and allow pop-ups for this website.",
        );
        window.location.href = customPath;
      }
    } else if (response.status === 404) {
      const error = await response.json();
      invalidArtists = error.error.invalidArtists;
      errorMessage = error.error.message;
      sameArtists = false; // so its error doesn't also show up
      // console.log(invalidArtists);
    } else if (response.status === 400) {
      const error = await response.json();
      sameArtists = true;
      errorMessage = error.error.message;
      invalidArtists = { s: false, g: false }; // so its error doesn't also show up
    } else {
      // console.log("Something went wrong");
    }
  }

  let submitting = false;
</script>

<dialog
  class="modal invisible"
  id="my_modal_1"
  bind:this={dialog}
  tabindex="-1"
>
  <div class="modal-box rounded-2xl">
    <form method="dialog">
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        disabled={submitting}
        on:click={() => dialog.close()}>✕</button
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
        class="input input-bordered rounded-x visible"
        bind:this={focusOnThis}
        required
      />
      {#if invalidArtists.s}
        <p class="text-red-500 mt-2">{errorMessage}</p>
      {/if}
      <label class="label" for="goalArtist" />
      <input
        type="text"
        placeholder="Goal Artist"
        name="goalArtist"
        id="goalArtist"
        class="input input-bordered rounded-xl"
        required
      />
      {#if invalidArtists.g}
        <p class="text-red-500 mt-2">{errorMessage}</p>
      {/if}
      <div class="modal-action">
        {#if sameArtists}
          <p class="text-red-500 flex items-center">
            {errorMessage}
          </p>
        {/if}
        <label class="label" for="submit" />
        <button
          class="btn btn-secondary rounded-xl"
          id="submit"
          name="submit"
          disabled={submitting}>Create</button
        >
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button disabled={submitting}>close</button>
  </form>
</dialog>
