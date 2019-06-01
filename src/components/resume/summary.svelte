<script>
  import Localization from "../icons/localization.svelte";
  import Link from "../icons/link.svelte";
</script>

<style>
  .summary-name {
    font-size: 26px;
    line-height: 30px;
  }
  .summary-subtitle {
    line-height: 24px;
  }
  .summary-button {
    width: 229px;
  }
</style>

<img
  class="avatar width-full rounded-1"
  src="images/me.jpg"
  alt="Andrés Montoya" />

<div class="py-3">
  <h1 class="text-bold summary-name">Andrés Mauricio Montoya Sánchez</h1>
  <h2 class="f3-light text-gray summary-subtitle">
    Software Engineer in training
  </h2>
  <h2 class="f3-light text-gray summary-subtitle">
    (Front-End / Back-End・JavaScript)
  </h2>
</div>
<p class="f5 mb-3 gray-900-text">
  Fallen in love about programming and languages culture. Improving my learning!
</p>

<a
  class="btn mb-3 text-center text-gray-dark no-underline summary-button"
  role="button"
  tabindex="0"
  href="https://github.com/MontoyaAndres/andresmontoyain">
  View this resume inside 👀
</a>

<aside class="btn-link text-small muted-link mb-3">
  <a href="https://www.linkedin.com/in/andresmontoyain/" class="muted-link">
    Professional network
  </a>
</aside>

<ul class="list-style-none border-top border-gray-light py-3">
  <li class="d-flex flex-row flex-items-center flex-justify-start pt-1">
    <Localization />
    Colombia, Girardot
  </li>
  <li class="d-flex flex-row flex-items-center flex-justify-start pt-1">
    <Link />
    <a href="https://github.com/andresmontoyain">github.com/andresmontoyain</a>
  </li>
</ul>
