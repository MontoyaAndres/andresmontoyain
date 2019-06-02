<script>
  import Projects from "./projects.svelte";
  import Experiences from "./experiences.svelte";

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
    },
    {
      url: "https://github.com/MontoyaAndres/PWA-APP.git",
      title: "EDgram",
      description:
        "Progressive web application to upload your photos with your friends",
      language: "JavaScript",
      status: "Completed",
      year: "2018"
    }
  ];

  const experiences = [
    {
      months: "february-october",
      years: "2016-2019",
      icon: "gift",
      commit:
        "Finished Technology in Informatics career at UNIMINUTO Centro regional Girardot",
      type: "study/university",
      technology: "Community"
    },
    {
      months: "november",
      years: "2018-*",
      icon: "git",
      commit: "Let's beginning an entrepreneurship!",
      isCard: true,
      card: {
        title: "Te Vi Colombia",
        description:
          "Application for helping people and companies to grow up in their entrepreneurship, professional practices and employment in Colombia.",
        motivation: {
          positive: "JavaScript",
          negative: "Free time",
          colorCount: ["green", "green", "green", "red", "red"]
        },
        type: "Private"
      }
    }
  ];

  let overview = 1;

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
        Projects
        <span class="Counter">{projects.length}</span>
      </span>
      <span
        on:click={() => handleOverview(2)}
        title="Experiences"
        class="UnderlineNav-item {overview === 2 ? 'selected' : ''}">
        Experiences
        <span class="Counter">{experiences.length}</span>
      </span>
    </div>
  </nav>

  {#if overview === 1}
    <Projects {projects} {randomColor} />
  {:else}
    <Experiences {experiences} {randomColor} />
  {/if}
</div>
