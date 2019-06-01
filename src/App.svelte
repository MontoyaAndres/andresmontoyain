<script>
  import Layout from "./components/layout/index.svelte";
  import Resume from "./components/resume/index.svelte";
  import Projects from "./components/projects/index.svelte";

  function newColor() {
    return (
      "#" +
      Math.random()
        .toString(16)
        .substr(-6)
    );
  }
</script>

<style>
  :global(.main-content) {
    max-width: 1010px;
  }

  @media (min-width: 600px) {
    .column-container {
      flex-wrap: nowrap !important;
    }
  }

  @media (min-width: 1010px) {
    .container {
      width: 725px;
      display: flex;
    }
  }
</style>

<Layout>
  <div class="d-flex flex-justify-around flex-wrap column-container">
    <Resume randomColor={newColor} />
    <Projects randomColor={newColor} />
  </div>
</Layout>
