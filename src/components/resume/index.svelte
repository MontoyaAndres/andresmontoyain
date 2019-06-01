<script>
  import Summary from "./summary.svelte";
  import Elsewhere from "./elsewhere.svelte";
  import Toolkit from "./toolkit.svelte";

  export let randomColor;
</script>

<style>
  .left-column {
    max-width: 253px;
  }
</style>

<section class="pr-3 mb-6 left-column">
  <Summary />
  <Elsewhere />
  <Toolkit {randomColor} />
</section>
