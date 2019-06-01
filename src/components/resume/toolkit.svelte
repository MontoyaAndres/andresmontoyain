<script>
  import ToolkitSet from "./toolkit-set.svelte";

  export let randomColor;

  const toolkits = [
    "Git",
    "HTML",
    "CSS",
    "JS",
    "React",
    "TypeScript",
    "GraphQL",
    "Apollo",
    "Node.js",
    "Jest",
    "NextJS",
    "Mobx",
    "MySQL",
    "MongoDB"
  ];

  const learning = [
    "Prisma",
    "Firebase",
    "PostgreSQL",
    "Figma",
    "Python",
    "Electron.js"
  ];
</script>

<ToolkitSet {randomColor} title="Toolkit Set" items={toolkits} />
<ToolkitSet {randomColor} title="Learning" items={learning} />
