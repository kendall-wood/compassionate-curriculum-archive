import type { Lesson } from "../types";

export const mediaLessons: Lesson[] = [
  {
    id: "individual-reflection",
    label: "L1",
    title: "Individual Reflection, Self-Portrait",
    sectionId: "media-narrative-futuring",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "These exercises help participants reflect on identity, memory, mood, and self description through color, sound, writing, and image.",
      },
      {
        kind: "p",
        text: "How might lack of resources, cultural marginalization and the experience of trauma forestall the ability or willingness to imagine, or belief in the relevance of imagination itself? This section begins from the understanding that dominant culture often flattens identity. People who are criminalized or stereotyped may begin to describe themselves through limiting narratives rather than through the full complexity of their lives.",
      },
      {
        kind: "p",
        text: "Imagination is a practice of hope. It involves rearranging present ideas into new possible combinations. For people whose experience of choice has been limited, it may understandably be difficult to hope that any kind of future agency might be possible. Begin with low stakes forms of reflection and storytelling, then build gradually toward media analysis and futuring.",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Color Wheel",
        blocks: [
          {
            kind: "ul",
            items: [
              "Invite participants to look at the image of a color wheel, or picture one in their mind's eye and describe associations they have with each color. Associations might relate to an emotion, a memory, or a story they would like to tell.",
              "Optional: on a large piece of paper or white board, create a shared color wheel or color map that participants feel represents the entire group. This might involve shape, form, colors of choice, or written language as desired.",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Color Field Portrait (after Mark Rothko)",
        blocks: [
          {
            kind: "ul",
            items: [
              "Create a self portrait using a stack of 2-3 color fields.",
              "Participants may reflect on different ways to create the stack, and share their design choices with a partner.",
              "For example, are the color fields framed within a larger background of a different color? Are there spaces in between the fields, and if so, how large?",
            ],
          },
          {
            kind: "p",
            text: "Facilitator's note: You may wish to show Mark Rothko's Color Field paintings, either before or after the exercise, as part of the discussion.",
          },
        ],
      },
      {
        id: "a3",
        label: "A3",
        title: "Life in 3 Songs",
        blocks: [
          {
            kind: "ul",
            items: [
              "Invite participants to consider 3 songs that describe their life.",
              "Play each song, taking 1-2 minutes before or after each to explain its significance.",
              "Create and share the playlist.",
              "With consent, record each intro, followed by the song.",
            ],
          },
        ],
      },
      {
        id: "a4",
        label: "A4",
        title: "I Am From Poem",
        blocks: [
          {
            kind: "ul",
            items: [
              "Use George Ella Lyon's 'I Am From' format to help participants translate memory and everyday detail into poetic form; copy onto blank sheets of paper as needed. http://www.georgeellalyon.com/where.html",
              "Share out and, if given consent, record people reading aloud.",
              "Consider how the poems might lead to further writing; e.g., mentions of a place might lead to writing about the memory of an event that happened there; mentions of music or food could lead to writing about people, places or events associated with those things.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "embodied-storytelling",
    label: "L2",
    title: "Embodied Storytelling",
    sectionId: "media-narrative-futuring",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "These exercises translate personal experience into gesture, tableau, voice, and image. They allow participants to explore emotional memory and shared interpretation without requiring full disclosure.",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Story Swap > Image Theater (after Augusto Boal)",
        blocks: [
          {
            kind: "ul",
            items: [
              "In pairs, participants describe a scene or event from their life as if it was frozen in time, that they remember based on an emotional prompt.",
              "Potential prompts include: obstacle, hope, escape, isolation, finding silence.",
              "Describe everything possible based on sensory recall: What season was it, and what time of day? If outside, what were the surrounding buildings or landscape like? If inside, what was the interior like? What did things sound and smell like? What were the colors and light like?",
              "Describe relationships: was anyone else there? If so, who were they, how were they related to you and what was happening?",
              "The listener considers what they think to be the heart of the story, its emotional or conceptual core.",
              "With consent from their partner, the listener represents the story with a single frozen gesture.",
              "Other participants discuss what they see. If the storyteller chooses, they can disclose details of the original story.",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Internal Monologue",
        blocks: [
          {
            kind: "ul",
            items: [
              'Based on the previous exercise, the storyteller positions others in a tableau (a group of people standing in "freeze frame"), to represent the core moment of the story.',
              'The Teller gives participants the minimum contextual information necessary to understand where and who they are, e.g.: "We\'re outside, in a city, in 1992. You\'re a man around 35 yrs old."',
              "Each participant imagines what their character is thinking, and one at a time, voices that internal monologue.",
            ],
          },
          { kind: "p", bold: true, text: "Optional documentation, with consent:" },
          {
            kind: "ul",
            items: [
              "Photograph participants in tableau",
              "Record audio of the voices",
              "Video walking around the group as participants voice their monologue",
            ],
          },
        ],
      },
      {
        id: "a3",
        label: "A3",
        title: "Sensory Triptych",
        blocks: [
          {
            kind: "ul",
            items: [
              "Invite participants to imagine themselves moving through a future space they'd like to inhabit.",
              "Participants should describe critical sensory details of sight, sound, smell, touch and what their body feels like as it moves in relation to the space.",
              "Participants create three images that represent three key parts of the story, such as a beginning, middle and end, 3 different sensory perceptions, 3 emotions etc.",
              "Participants observe each other's images and describe associations.",
              "This activity can be combined with Photovoice or Participatory Futuring exercises.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "media-analysis",
    label: "L3",
    title: "Media Analysis & Visual Storytelling",
    sectionId: "media-narrative-futuring",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "These exercises help participants analyze how stories are told about people in media, and create visual responses rooted in their own experience.",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Image Re-labelling",
        blocks: [
          {
            kind: "p",
            text: "The goal of this activity is to analyze evocative or ambiguous images taken from popular media in different ways, to use as prompts for discussion. It can facilitate media analysis, to understand and critique how media conveys messages that support negative stereotypes; or to prompt discussion of participants' lived experience.",
          },
          { kind: "p", bold: true, text: "Prompts for marking up images:" },
          {
            kind: "ul",
            items: [
              "What do you see? Analyze color and shapes; do any predominate? Are there any patterns?",
              "What is the backstory of this image? What has occurred up until this moment? Mark previous stages of the story.",
              "Who is here and what are they doing?",
              "What are the power relationships in this image? Mark people's relation to other people, objects, buildings, landscape.",
              "What is unseen vs what is seen? Is anything implied but not shown?",
              "Who might have taken this image, from what point of view?",
              "What might happen next? Mark potential future stages of the story.",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Photovoice",
        blocks: [
          {
            kind: "p",
            text: "Photovoice is a participatory visual method in which a group defines a question about an issue affecting their community, takes photographs in response, and uses those images to prompt discussion. The process supports participants in reflecting on lived experience, identifying issues they want to change, and exploring possible forms of action.",
          },
          { kind: "p", bold: true, text: "Process" },
          {
            kind: "ol",
            items: [
              "Co-define the issue you'd like to address as a group",
              "Create your guiding question (be personal, focus on one issue, determine a good scope)",
              "Take Photos — participants take pictures in response to the question that express their perspective",
              "Discuss using the SHMIR method: See, Happening, Meaning, Issue, Response",
              "Synthesize — identify key themes, patterns or shared experiences",
              "Disseminate (optional) — zine, exhibition, online, public presentation",
              "Reflect — what stood out? what worked or could be improved? what felt meaningful?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "participatory-futuring",
    label: "L4",
    title: "Participatory Futuring and Worldbuilding",
    sectionId: "media-narrative-futuring",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "These exercises support participants in imagining alternative futures, experimenting with possibility, and linking future vision to present action.",
      },
      { kind: "p", bold: true, text: "Contents" },
      {
        kind: "ul",
        items: [
          "Backcasting — participants collectively imagine designs from a functioning future, to see if any might inspire things to be built in the present",
          "Worldbuilding — imagines the logic of a future society in which to potentially model change",
          "Future Cones — facilitates imagining oneself positively existing in the future",
        ],
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Backcasting (Collective Imagining)",
        blocks: [
          {
            kind: "p",
            text: "Based on the futuring exercise Prescriptions for Just Communities developed by Melanie Crean with Ayodamola Okunseinde, this activity invites participants to imagine a future, roughly 10-15 years from now, where a specific social problem has been resolved.",
          },
          { kind: "p", bold: true, text: "Example prompts:" },
          {
            kind: "ul",
            items: [
              "Imagine a future where transitions from incarceration or military service to civilian life happen seamlessly.",
              "Imagine a world without prisons, where communities are both safe and just.",
            ],
          },
          { kind: "p", bold: true, text: "Preparation" },
          {
            kind: "ul",
            items: [
              "The group decides on a problem it would like to address.",
              "Consider a future ~10-15 years from now in which that problem no longer exists.",
              "Break into groups of 2-3, give each paper, something to draw with, and three card prompts: a Social or emotional mindset, a Subject domain, a Design attribute.",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Worldbuilding",
        blocks: [
          {
            kind: "p",
            text: "Worldbuilding is a creative method for imagining alternative ways of being through storytelling. By constructing a fictional or speculative world, participants can explore how systems, relationships, and power structures operate, and consider how they might be transformed.",
          },
          { kind: "p", bold: true, text: "Process" },
          {
            kind: "ol",
            items: [
              "Geography, Climate & Ecology — imagine a world as an interconnected system",
              "Culture & Belief Systems — create at least two distinct cultures that coexist in this world",
              "Power & Conflict — consider how power operates",
              "Characters & Perspective — create at least two characters in this world",
              "Ritual & Reflection — create a ritual, tradition or event that reveals a core belief",
              "Reflection — how does your own lived experience shape how you have constructed this world?",
            ],
          },
        ],
      },
      {
        id: "a3",
        label: "A3",
        title: "Future Cones",
        blocks: [
          {
            kind: "p",
            text: "Adapted from an exercise by Ashley Jane Lewis based on Stuart Candy's Future Cone. This exercise guides participants in imagining themselves three to five years into the future. Using a Futures Cone diagram, they explore what is probable, plausible, possible, and preferable in their own future development.",
          },
          { kind: "p", bold: true, text: "The Future Cone is a tool for imagining multiple potential futures:" },
          {
            kind: "ul",
            items: [
              "Probable: What is likely to happen based on current trajectories.",
              "Plausible: What could realistically happen, even if less likely.",
              "Possible: What might happen, including unexpected ideas.",
              "Preferable: The most compelling, meaningful outcomes — your desired future.",
            ],
          },
          { kind: "p", bold: true, text: "Steps:" },
          {
            kind: "ol",
            items: [
              'Set up — draw a small circle on the left labeled "You" or "Now", and a larger circle on the right labeled with a future year. Connect them to form a horizontal cone.',
              "Plot the Probable — write down 2-3 things you are likely to be doing in a few years.",
              'Imagine the Possible — list 8-20 "Possibles": tools, practices, mediums, collaborations, residencies, ambitions.',
              'Identify the Plausible — choose 3-5 items from the "Possible" list that feel realistic over the next 1-2 years.',
              "Define the Preferable — circle 1-2 items from the Plausible ring that feel most exciting, meaningful, or aligned with your values.",
            ],
          },
        ],
      },
    ],
  },
];
