<script>
  import { language } from "../../store.js";

  import Projects from "./projects.svelte";
  import Experiences from "./experiences.svelte";

  // It's more clean identify this file with the name `json`
  import json from "./language.json";

  export let randomColor;

  let current_language;
  let overview = 1;

  language.subscribe(value => {
    current_language = value;
  });

  function handleOverview(value) {
    overview = value;
  }
</script>

<style>
  .menu-large {
    width: 100%;
  }

  :global(.language-indicator) {
    top: 1px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
</style>

<div class="pb-4 pl-2 menu-large">
  <nav class="UnderlineNav">
    <div class="UnderlineNav-body">
      <span
        on:click={() => handleOverview(1)}
        title="Overview"
        class="UnderlineNav-item {overview === 1 ? 'selected' : ''}">
         {json[current_language].menuProjectsTitle}
        <span class="Counter">{json[current_language].projects.length}</span>
      </span>
      <span
        on:click={() => handleOverview(2)}
        title="Experiences"
        class="UnderlineNav-item {overview === 2 ? 'selected' : ''}">
         {json[current_language].menuExperiencesTitle}
        <span class="Counter">{json[current_language].experiences.length}</span>
      </span>
    </div>
  </nav>

  {#if overview === 1}
    <Projects
      sectionProjectsTitle={json[current_language].sectionProjectsTitle}
      projects={json[current_language].projects}
      {randomColor} />
  {:else}
    <Experiences
      sectionExperiencesTitle={json[current_language].sectionExperiencesTitle}
      experiences={json[current_language].experiences}
      {randomColor} />
  {/if}
</div>
