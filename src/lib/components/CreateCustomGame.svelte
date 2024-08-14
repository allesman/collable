<script lang="ts">
  // let customGameModal: HTMLDialogElement;
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  // export let dialogRef: { current: HTMLDialogElement | null } = {
  //   current: null,
  // };

  export let dialog: HTMLDialogElement;

  // onMount(() => {
  //   dialogRef.current = dialog;
  // });
</script>

<dialog class="modal" id="my_modal_1" bind:this={dialog}>
  <div class="modal-box">
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >✕</button
      >
    </form>
    <h3 class="text-2xl font-bold">Create Custom Game</h3>
    <!-- make input fields for Start Artist and Goal Artist -->
    <form>
      <label class="label" for="startArtist" />
      <input
        type="text"
        placeholder="Start Artist"
        name="startArtist"
        class="input input-bordered"
      />
      <label class="label" for="goalArtist" />
      <input
        type="text"
        placeholder="Goal Artist"
        name="goalArtist"
        class="input input-bordered"
      />
      <label class="label" for="submit" />
      <button class="btn btn-success" name="submit">Create</button>
    </form>
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
