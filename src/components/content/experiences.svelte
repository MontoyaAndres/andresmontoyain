<script>
  import GitRepo from "../icons/git-repo.svelte";
  import Gift from "../icons/gift.svelte";
  import Rocket from "../icons/rocket.svelte";

  export let sectionExperiencesTitle;
  export let experiences;
  export let randomColor;
</script>

<style>
  .gray-timeline {
    background-color: #e6ebf1;
  }

  .timeline-horizontal {
    height: 1px;
  }

  .timeline-line-top {
    height: 13px;
    width: 2px;
  }

  .timeline-circle-marker {
    height: 32px !important;
    width: 32px !important;
    border-radius: 100px;
  }

  .timeline-line-bottom {
    width: 2px;
  }

  .timeline-card {
    flex-direction: column;
  }

  .timeline-card-commits {
    top: 1px;
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 2%;
    margin-left: 2px;
  }

  .timeline-card-text {
    margin-left: 0px;
  }

  .timeline-card-info {
    flex-direction: column;
  }

  .timeline-card-octicon {
    margin-bottom: 16px;
  }

  .bg-green {
    background-color: #28a745 !important;
  }

  .bg-red {
    background-color: #d73a49 !important;
  }

  @media (min-width: 600px) {
    .timeline-card {
      flex-direction: row;
    }
    .timeline-card-text {
      margin-left: 24px;
    }
    .timeline-card-info {
      flex-direction: row;
    }
    .timeline-card-octicon {
      margin-bottom: 0px;
    }
  }
</style>

<section class="mt-5" aria-labelledby="section-3-header">
  <h3 id="section-3-header" class="f4 mb-2 text-normal">
    {sectionExperiencesTitle}
  </h3>

  {#each experiences as experience}
    <div class="width-full">
      <div class="d-flex flex-row flex-items-center flex-start">
        <h3 class="h6 pr-2 py-1 d-flex flex-nowrap">
           {experience.months}
          <span class="pl-1 text-gray">{experience.years}</span>
        </h3>
        <span
          class="timeline-horizontal gray-timeline"
          style="flex-basis: auto; flex-grow: 2;" />
      </div>

      <div class="d-flex flex-row flex-nowrap">
        <div
          class="mr-3 d-flex flex-column flex-items-center flex-justify-center">
          <span class="timeline-line-top gray-timeline" />
          <span
            class="d-flex flex-items-center flex-justify-center
            timeline-circle-marker gray-timeline">
            {#if experience.icon === 'git'}
              <GitRepo />
            {:else if experience.icon === 'gift'}
              <Gift />
            {:else if experience.icon === 'rocket'}
              <Rocket />
            {/if}
          </span>
          <span
            class="timeline-line-bottom gray-timeline"
            style="flex-basis: auto; flex-grow: 2;" />
        </div>
        <div class="py-3 pr-3">
          <span class="f4 text-gray lh-condensed"> {experience.commit} </span>

          {#if experience.urlFile}
            <div
              class="border border-gray-dark rounded-1 p-5 mt-4"
              style="width: 350px">
              <img
                class="text-center width-fit"
                src={experience.urlFile}
                alt={experience.commit} />
            </div>
          {/if}

          <div
            class="d-flex flex-wrap flex-row flex-justify-start
            flex-items-center mt-2">
            {#if experience.card}
              <div
                class="border border-gray-dark rounded-1 p-3 mt-3 timeline-card
                d-flex">
                <div>
                  <div class="d-flex timeline-card flex-items-center">
                    <svg
                      aria-label="lightbulb"
                      class="mr-2 timeline-card-octicon"
                      width="12"
                      height="16"
                      viewBox="0 0 12 16"
                      role="img"
                      style="min-width: 16px">
                      <path
                        fill="#28a745"
                        fill-rule="evenodd"
                        d="M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25
                        1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08
                        1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67
                        1.11-.86 1.41-1.25 2.06-1.45
                        3.23-.02.05-.02.11-.02.17H5c0-.06
                        0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44
                        6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22
                        1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4
                        14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z" />
                    </svg>

                    <h3 class="lh-condensed timeline-card-header">
                       {experience.card.title}
                    </h3>
                  </div>
                  <p class="timeline-card-text text-gray mt-2 mb-3">
                     {experience.card.description}
                  </p>
                  <div class="timeline-card-text d-flex flex-justify-evenly">
                    <div class="timeline-card-info d-flex">
                      <small class="f6 text-green text-bold pt-1 mr-3">
                        + {experience.card.motivation.positive}
                      </small>
                      <small class="f6 pt-1 text-red text-bold">
                        - {experience.card.motivation.negative}
                      </small>
                    </div>
                    <div class="timeline-card-info d-flex">
                      <div class="mx-3">
                        {#each experience.card.motivation.colorCount as color}
                          <span class="timeline-card-commits bg-{color}" />
                        {/each}
                      </div>
                      <div>
                        <span class="text-gray-light mx-1">•</span>
                        <small class="f6 text-gray pt-2">
                           {experience.card.type}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              <span class="pr-3">{experience.type}</span>
              <small class="f6 text-gray pt-1">
                <span
                  class="language-indicator position-relative d-inline-block"
                  style="background-color: {randomColor()}" />
                 {experience.technology}
              </small>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/each}

</section>
