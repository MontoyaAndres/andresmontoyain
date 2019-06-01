<script>
  import Menu from "./menu.svelte";

  // icons
  import Organization from "../icons/organization.svelte";
  import Calendar from "../icons/calendar.svelte";
  import Gift from "../icons/gift.svelte";
  import Rocket from "../icons/rocket.svelte";
  import Megaphone from "../icons/megaphone.svelte";

  export let randomColor;

  const projects = [
    {
      url: "https://github.com/MontoyaAndres/AVMod",
      title: "AVMod",
      description:
        "Create your own powershell, malware desktop app or even clickjacking web with a single command for unix and windows systems.",
      language: "Python",
      status: "Working on",
      year: "2019"
    },
    {
      url: "https://github.com/MontoyaAndres/GradeProject",
      title: "Exception of absenteeism UNIMINUTO",
      description:
        "Software Remission (exception of absenteeism) for UNIMINUTO Girardot, Colombia",
      language: "JavaScript",
      status: "Completed",
      year: "2018"
    },
    {
      url: "https://github.com/MontoyaAndres/slack-clone",
      title: "slack-clone",
      description:
        "Slack clone, the funtionality to create and login users who will can create workspaces, channels and send text or multimedia messages",
      language: "JavaScript",
      status: "Completed",
      year: "2018"
    },
    {
      url: "https://github.com/MontoyaAndres/FacebookNews",
      title: "Simulate a Fake news with Facebook? 👀",
      description: "Simulate a Facebook news section to deceive your victims!",
      language: "JavaScript",
      status: "Completed",
      year: "2019"
    },
    {
      url: "https://github.com/MontoyaAndres/platzi/tree/master/hapi-hello",
      title: "Platzioverflow",
      description: "Ask what you need and you will receive any response!",
      language: "JavaScript",
      status: "Completed",
      year: "2019"
    },
    {
      url:
        "https://github.com/MontoyaAndres/platzi/tree/master/electron-platzipics",
      title: "Platzipics",
      description:
        "Edit and filter your images with this desktop app on Windows, Mac or Linux",
      language: "JavaScript",
      status: "Completed",
      year: "2019"
    }
  ];
</script>

<style>
  .pinned-list {
    flex-direction: column;
  }

  .pinned-item {
    flex: 48%;
  }

  .language-indicator {
    top: 1px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  @media (min-width: 700px) {
    .pinned-list {
      flex-direction: row;
    }
  }
</style>

<div class="pb-4 pl-2">
  <Menu projects={projects.length} />

  <section class="mt-4" aria-labelledby="section-1-header">
    <h3 id="section-1-header" class="f4 mb-2 text-normal">Pinned Projects</h3>
    <ul class="d-flex flex-column list-style-none mb-1">
      <div class="d-flex flex-wrap flex-justify-between pinned-list">
        {#each projects as project}
          <li
            class="d-flex p-3 mb-3 mr-2 border border-gray-dark rounded-1
            pinned-item">
            <div class="flex-column">
              <h5 class="text-bold">
                <a href={project.url}> {project.title} </a>
              </h5>
              <p class="text-gray text-small d-block mt-2 mb-3">
                 {project.description}
              </p>
              <div class="d-flex flex-row flex-justify-start">
                <div class="mr-3">
                  <span
                    class="language-indicator position-relative d-inline-block"
                    style="background-color: {randomColor()}" />
                  <small class="f6 text-gray">{project.language}</small>
                </div>
                <div class="mr-3 d-flex flex-items-center">
                  <Rocket />
                  <small class="f6 text-gray">{project.status}</small>
                </div>
                <div class="d-flex flex-items-center">
                  <Calendar />
                  <small class="f6 text-gray">{project.year}</small>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </div>
    </ul>
  </section>
</div>
