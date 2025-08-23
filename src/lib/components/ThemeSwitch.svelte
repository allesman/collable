<script>
  import Icon from "@iconify/svelte";
</script>

<label class="swap swap-rotate btn btn-m btn-neutral rounded-xl">
  <!-- this hidden checkbox controls the state -->
  <input
    type="checkbox"
    class="theme-controller"
    value="retro"
    name="theme-switch"
    aria-label="Switch between light and dark mode"
  />
  <!-- sun icon -->
  <Icon icon="ic:outline-light-mode" class="text-xl swap-on" />
  <!-- moon icon -->
  <Icon icon="ic:outline-dark-mode" class="text-xl swap-off" />
</label>
