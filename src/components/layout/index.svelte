<script>
  import { language } from "../../store.js";

  import Header from "./header.svelte";
  import Footer from "./footer.svelte";
  import Language from "./language.json";

  let current_language;

  language.subscribe(value => {
    current_language = value;
  });

  function handleCurrentLanguage() {
    language.update(value => (value === "es" ? "en" : "es"));
  }
</script>

<Header {current_language} {handleCurrentLanguage} />
<div class="main-content mx-auto px-3 p-responsive mt-4">
  <slot />
  <Footer json={Language} {current_language} />
</div>
