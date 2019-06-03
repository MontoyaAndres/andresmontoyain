<script>
  import { language } from "../../store.js";

  import Summary from "./summary.svelte";
  import Elsewhere from "./elsewhere.svelte";
  import Toolkit from "./toolkit.svelte";
  import Language from "./language.json";

  export let randomColor;

  let current_language;

  language.subscribe(value => {
    current_language = value;
  });
</script>

<style>
  .left-column {
    max-width: 253px;
  }
</style>

<section class="pr-3 mb-6 left-column">
  <Summary json={Language} {current_language} />
  <Elsewhere json={Language} {current_language} />
  <Toolkit json={Language} {current_language} {randomColor} />
</section>
