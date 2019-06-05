<script>
  export let current_language;
  export let handleCurrentLanguage;
</script>

<style>
  header {
    height: 60px;
  }
</style>

<div class="bg-gray-dark">
  <header
    class="main-content mx-auto p-responsive d-flex flex-items-center flex-wrap">
    <div class="flex-auto d-flex flex-justify-between pr-3">
      <div class="flex-auto d-flex">
        <img
          src="/images/world_white.svg"
          class="mr-3"
          height="35"
          alt="luna dog" />
        <h1 class="h4 f5 text-white text-bold">Andrés Montoya</h1>
      </div>
      <button
        class="btn btn-purple"
        role="button"
        on:click={handleCurrentLanguage}>
         {current_language}
      </button>
    </div>
  </header>
</div>
