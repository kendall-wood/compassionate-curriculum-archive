import type { Lesson } from "../types";

export const restorativeLessons: Lesson[] = [
  {
    id: "entering-the-circle",
    label: "L1",
    title: "Entering the Circle",
    sectionId: "restorative-practices",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "This activity introduces participants to restorative practice and the basic elements of circle work. Circles are the primary restorative practice used in this curriculum. As Kay Pranis and Carolyn Boyes-Watson describe in Circle Forward, they work best when groups begin by getting acquainted, establishing shared values, and building trust before moving into deeper discussion. Circles may be used for many purposes, including healing, grieving, support, resolving conflict, reintegration, and celebration.",
      },
      {
        kind: "p",
        text: "A talking piece is an object passed around the circle that marks who is speaking and reminds others to listen actively; it also allows any participant to pass. A mantle is a cloth or central space where meaningful objects may be placed to help mark the circle as intentional and distinct. A land acknowledgement is one way of naming the histories, peoples, and ongoing legacies that shape the place where a circle is taking place.",
      },
      {
        kind: "p",
        text: "Set up the room in a circle if possible, with enough space between shares so that participants can see one another clearly. Be attentive to accessibility needs in advance. Keep paper and pen nearby for notes or follow-up observations, and have a large sheet of paper or easel ready if you plan to record community agreements.",
      },
      { kind: "p", bold: true, text: "A circle will usually move through the following sequence:" },
      {
        kind: "ul",
        items: [
          "welcome and purpose",
          "opening or icebreaker and where appropriate, land acknowledgement",
          "community agreements",
          "check-in",
          "discussion rounds",
          "check-out and closing",
        ],
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Welcome, Opening & Community Agreements",
        blocks: [
          { kind: "p", bold: true, text: "Welcome and purpose:" },
          {
            kind: "ul",
            items: [
              "the circlekeeper introduces themselves and the talking piece;",
              "if participants are new to restorative practice, the circlekeeper explains their role and how the talking piece is used;",
              "if using a mantle, explain what it is and why the objects matter.",
            ],
          },
          { kind: "p", bold: true, text: "Opening and Icebreaker" },
          {
            kind: "p",
            text: "Begin with a simple introductory question to help participants enter the space and process. Some questions might require more trust and openness, so not all will be appropriate for every group. Examples:",
          },
          {
            kind: "ul",
            items: [
              "If you could have one superpower, what would it be?",
              "Who are your heroes and why?",
              "One goal for your time in this workshop is...",
              "One thing you would not know about me just by seeing me is...",
              "One aspect of my identity that feels important to bring into the circle is...",
            ],
          },
          { kind: "p", bold: true, text: "Community agreements" },
          {
            kind: "ul",
            items: [
              "The circlekeeper, holding the talking piece, invites participants to name what they need in order to feel able to speak openly and honestly in the circle.",
              "Example prompt: What agreements are important to you to ensure that you personally will feel braver in speaking openly and honestly in this circle?",
              "The talking piece is passed to the left, so that each participant has the opportunity to add, or pass.",
              "Record responses and revisit them as needed. Some circlekeepers may invite participants to sign the final agreements.",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Check-in & Discussion Rounds",
        blocks: [
          { kind: "p", bold: true, text: "Check-in" },
          {
            kind: "p",
            text: 'After the welcome and agreements, do a simple check-in round connected to the day\'s theme. Examples might be, "how are you today, on a scale of 1-10, and why?"',
          },
          { kind: "p", bold: true, text: "Discussion rounds" },
          {
            kind: "ul",
            items: [
              "Should only happen after participants have checked in, understand the purpose of the circle, and have known who is present.",
              "Questions should be open-ended, intentional, and connected to personal experience.",
              "Always check in after a round and pass the talking piece again in case anyone who initially passed wishes to speak.",
            ],
          },
          { kind: "p", bold: true, text: "For repairing relationships:" },
          {
            kind: "ul",
            items: [
              "Who do you think has been affected by this situation, and in what specific ways have they been impacted?",
              "What has been the hardest part of this experience for you personally?",
              "What needs to happen right now to make things as right as possible for everyone involved?",
            ],
          },
          { kind: "p", bold: true, text: "For organizational change & processing transitions:" },
          {
            kind: "ul",
            items: [
              "What concerns are you holding right now regarding our upcoming shift? What are your fears?",
              "What is one practical resource or support you need to successfully navigate this change?",
            ],
          },
        ],
      },
      {
        id: "a3",
        label: "A3",
        title: "Closing the Circle",
        blocks: [
          {
            kind: "p",
            text: "Close with a round of responses to reflective prompts that helps participants leave the circle with care and intention.",
          },
          { kind: "p", bold: true, text: "Potential prompts:" },
          {
            kind: "ul",
            items: [
              "What are you taking with you from today?",
              "How will you practice self-care today?",
              "What is a commitment you are willing to make today based on our circle today?",
            ],
          },
          {
            kind: "p",
            text: "After the closing round, the circlekeeper may guide a brief grounding exercise such as breathing, movement, a poem, a song, or a call and response.",
          },
          { kind: "p", bold: true, text: "Optional follow-up: Talking Pieces" },
          {
            kind: "p",
            text: "After the second circle, once participants have become more familiar with one another, the circlekeeper may invite them to bring an object of personal significance to serve as a talking piece and, if they wish, share why it is meaningful to them. In digital circles, the talking piece and mantle may be symbolic rather than physical, but the same principles still apply.",
          },
        ],
      },
    ],
  },
  {
    id: "reauthoring-circles",
    label: "L2",
    title: "Reauthoring Circles",
    sectionId: "restorative-practices",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "Reauthoring is a way of understanding how the stories we tell about ourselves are shaped by larger social forces, including institutions, culture, and systems of power. The term was first developed by Michael White and David Epston (1990) as part of Narrative Therapy. In this curriculum, reauthoring is not therapy. It is a community practice that helps people reflect on how dominant myths about race, class, gender, disability, criminalization, and belonging shape identity, and how those myths might be challenged.",
      },
      {
        kind: "p",
        text: "Reauthoring practice looks for what are sometimes called problem-saturated narratives: stories in which a person becomes defined by hardship, stigma, or a single experience. Reauthoring asks: what else is true? What strengths, values, knowledge, and insight are already present alongside hardship, stigma, or a single defining story? It refuses the single story and makes space for a fuller account.",
      },
      { kind: "p", bold: true, text: "A reauthoring circle is a structured conversation with three roles:" },
      {
        kind: "ul",
        items: [
          "storyteller: one person shares a story, challenge, or question",
          "witnesses: the group listens and reflects back strengths, values, and possibilities",
          "circlekeeper: the person who holds the structure and supports the process",
        ],
      },
      {
        kind: "p",
        text: "The goal is not to judge, fix, or give advice. It is to listen together for what matters, what has been survived, and what has been learned.",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Powerful Questions",
        blocks: [
          {
            kind: "p",
            text: "Before beginning, the circlekeeper asks for a volunteer storyteller willing to share a challenge, question, or moment of growth, and checks in with them to ensure consent. Introduce the process clearly: one person will share, others will listen and reflect back what they hear, the group listens for strength and for what matters, no advice is given.",
          },
          { kind: "p", bold: true, text: "Examples of good questions:" },
          {
            kind: "ul",
            items: [
              "What did you notice about yourself at that moment?",
              "What does this tell you about what matters to you?",
              "What did it take to get through that?",
              "What did you need at that time?",
              "What might help you think about this differently?",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Witnessing",
        blocks: [
          {
            kind: "p",
            text: "Witnessing means to listen for resilience, recognize knowledge and capacity, and reflect these back. The goal is not to fix, but to name what is already present.",
          },
          { kind: "p", bold: true, text: "Examples of witnessing:" },
          {
            kind: "ul",
            items: [
              "What I'm hearing is that you...",
              "You kept going despite...",
              "I'm noticing the strategies you developed to cope with that...",
              "It seems like care, dignity, or fairness really matter to you",
              "I'm hearing a deep commitment to...",
              "You've learned something important through that experience",
              "What I'm hearing is a story about how you cared, resisted, or learned along the way",
            ],
          },
        ],
      },
      {
        id: "a3",
        label: "A3",
        title: "Process & Closing Reflection",
        blocks: [
          { kind: "p", bold: true, text: "Process" },
          {
            kind: "ul",
            items: [
              "The circlekeeper convenes the opening of the circle.",
              "The storyteller shares while holding the talking piece.",
              "The group pauses.",
              "The talking piece is passed around the circle. Witnesses reflect on what they heard.",
              "When the talking piece returns to the storyteller, invite reflection.",
            ],
          },
          { kind: "p", bold: true, text: "Closing reflection prompts:" },
          {
            kind: "ul",
            items: [
              "What did you hear?",
              "What felt true?",
              "What surprised you?",
              "What do you want to carry forward?",
              "What stood out to you?",
              "What felt possible in this process?",
              "Where might you use this in your own work?",
              "What support would help you feel more confident facilitating it?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sharing-our-stories",
    label: "L3",
    title: "Sharing Our Stories",
    sectionId: "restorative-practices",
    facilitatorBlocks: [
      {
        kind: "p",
        text: 'This activity can begin as journaling, either in or between sessions, and later move into circle sharing. The task is to write "your story."',
      },
      {
        kind: "p",
        text: "Depending on group size, this activity may unfold across several sessions. It can help if one of the circlekeepers shares first to model the activity, or if a few participants are prepared in advance, to see if they might be comfortable sharing early on. Participants should always have the option to pass. Allow breaks between stories. These circles can be intense, and pauses help the group remain present for one another.",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Journaling Prompts",
        blocks: [
          { kind: "p", bold: true, text: "Prompts:" },
          {
            kind: "ul",
            items: [
              "What is your name?",
              "Where do you live? Did you always live there?",
              "Where did you grow up?",
              "What childhood memories stay with you?",
              "Who do you live with?",
              "Do you have siblings? What is your relationship with them?",
              "What is your relationship like with your parents or guardians?",
              "What hardships have you faced? What obstacles have you overcome?",
              "What accomplishments are you proud of?",
              "How did you come to this work?",
              "Why is this work important to you?",
              "How will you activate what you are learning?",
              "What are your passions and long-term goals?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "land-ancestor-acknowledgement",
    label: "L4",
    title: "Land & Ancestor Acknowledgement",
    sectionId: "restorative-practices",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "This activity invites participants to reflect on the histories, places, ancestors, and lineages that shape the space they are in. It is based on Native Land Digital's resources to move beyond performative or transactional frameworks.",
      },
      {
        kind: "p",
        text: "Before facilitating this activity, research whose land the circle is taking place on, who lived there in the past, and who lives there now. This may require formal research as well as conversations with community members.",
      },
      {
        kind: "p",
        text: "This can be a difficult activity. Participants may be adopted, may not know their histories, or may carry trauma related to family, slavery, colonization, migration, or displacement. Go slowly. Build in pauses.",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Reflection Prompts",
        blocks: [
          { kind: "p", bold: true, text: "Potential prompts" },
          {
            kind: "ul",
            items: [
              "Who are the ancestors and people we should appreciate as we gather?",
              "What is your migration story?",
              "Who are your elders, living and transitioned, and how are they present in you?",
            ],
          },
          { kind: "p", bold: true, text: "Follow up options" },
          {
            kind: "ul",
            items: [
              "write your own land acknowledgement",
              "share it in circle",
              "develop a collective acknowledgement in small groups or as a whole group",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Example Acknowledgement",
        blocks: [
          { kind: "p", bold: true, text: "Example from the Lenapehoking (NJ, eastern PA, southeastern NY):" },
          {
            kind: "p",
            text: '"I want to begin with an acknowledgement that we are on the unceded territory of the Lenape people. I would like to acknowledge and pay my respects to the Lenape ancestors and to present and future generations on this homeland, as well as throughout the Lenape diaspora. I would also like to extend this acknowledgement to all Indigenous peoples who now and in the future call these Lenape homelands, Lenapehoking, home. This acknowledgement is a commitment to addressing the ongoing legacies of settler colonialism, racism, mass incarceration, and the prison industrial complex."',
          },
        ],
      },
    ],
  },
  {
    id: "circle-questions",
    label: "L5",
    title: "Circle Questions and Listening Practices",
    sectionId: "restorative-practices",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "Source material includes Mediators Beyond Borders and The Art of Powerful Questions by Eric E. Vogt, Juanita Brown, and David Isaacs. In the Circle practice, questions are called prompts and are sequenced carefully moving from low-vulnerability questions (to build safety) to high-vulnerability questions (to address the core topic), and finish with reflection.",
      },
      { kind: "p", bold: true, text: "Quick Facilitator Tips for Round Questions" },
      {
        kind: "ul",
        items: [
          'Keep them open-ended: avoid questions that can be answered with a simple "yes" or "no". Use What, How, or Can you describe... instead of Why.',
          "Model the prompt: as the facilitator, it is often helpful to answer the question first when you introduce it.",
          "Pass is always an option: remind participants that when the talking piece comes to them, they can choose to pass, hold it in silence, or speak.",
        ],
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Opening & Deepening Questions",
        blocks: [
          { kind: "p", bold: true, text: "Opening questions — Please say your name and..." },
          {
            kind: "ul",
            items: [
              "share something you hope to experience or learn while you are here",
              "share something that would make you glad you chose to participate",
              "say what draws you to this inquiry",
              "name something you left behind in order to be here today",
            ],
          },
          { kind: "p", bold: true, text: "Deepening questions" },
          {
            kind: "ul",
            items: [
              "What is at the heart of this issue for you?",
              "What hopes, fears, concerns, or unmet needs are present for you around this issue?",
              "What dilemmas or opportunities do you see?",
            ],
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Processing, Forward-Moving & Closing Questions",
        blocks: [
          { kind: "p", bold: true, text: "Processing questions" },
          {
            kind: "ul",
            items: [
              "What is taking shape here?",
              "What are you hearing underneath the variety of opinions being expressed?",
              "What had real meaning for you in what you heard?",
              "Is there anything we are not seeing clearly?",
            ],
          },
          { kind: "p", bold: true, text: "Forward-moving questions" },
          {
            kind: "ul",
            items: [
              "What could happen that would help you feel fully engaged in this work?",
              "What is possible here, and who cares?",
              "What next steps would you like to take, individually or collectively?",
              "How can we support one another in taking those steps?",
              "What seed might we plant together that could make the most difference for the future of this situation?",
            ],
          },
          { kind: "p", bold: true, text: "Closing questions" },
          {
            kind: "ul",
            items: [
              "What are you taking with you from this circle?",
              "What did you contribute, or wish you had contributed?",
              "What next steps do you hope to take?",
              "What questions do you hope this group addresses next?",
              "What support do you need, or wish to offer, as you leave?",
            ],
          },
        ],
      },
      {
        id: "a3",
        label: "A3",
        title: "Skills for Active Listening",
        blocks: [
          {
            kind: "ul",
            items: [
              "Body language: maintain open body language and attention. Maintain eye contact where appropriate, face the speaker, adopt a relaxed posture, and avoid multitasking.",
              "Following: allow the speaker space to speak without interruption. This means reducing unnecessary questions, tolerating silence, and letting a thought unfold.",
              'Paraphrasing and reflecting: summarize what you heard, including both content and feeling. For example: "What I\'m hearing is..."',
              "Ask open-ended questions: that invite reflection rather than yes/no answers.",
              "Validation: assume that whatever is being shared, however clearly or imperfectly, comes from something real in the speaker's experience.",
            ],
          },
          { kind: "p", bold: true, text: "A mindful listening activity:" },
          {
            kind: "p",
            text: "Close your eyes and: notice how many sounds you can hear around you and within you; notice judgments arising without attaching to them; focus on the sound, flow, and rhythm of your breath; do a somatic inventory, moving slowly through the body and relaxing each part.",
          },
        ],
      },
    ],
  },
  {
    id: "grounding-activities",
    label: "L6",
    title: "Grounding Activities",
    sectionId: "restorative-practices",
    facilitatorBlocks: [
      {
        kind: "p",
        text: "Grounding exercises are techniques designed to quickly pull you away from anxiety, panic, or flashbacks by reconnecting you to the present moment and your physical surroundings. They can be part of intention setting for a workshop as well as connecting with members of a group.",
      },
    ],
    activities: [
      {
        id: "a1",
        label: "A1",
        title: "Connecting to the Land",
        blocks: [
          {
            kind: "p",
            text: 'The pace is important here. Allow for the movement for both the sitting and breathing. The facilitator says: "Find a place where you are sitting or can sit comfortably."',
          },
          {
            kind: "p",
            text: '"If you feel okay doing so, close your eyes. If you don\'t want to, then just find a place in front of you where you can gently focus. Now take four deep breaths. Feel your chest rise and fall as you take in the air and let it out. Each time you breathe in, imagine taking in a calm, peaceful feeling. As you breathe out, let all the stress leave your body. Let your shoulders relax and soften. Let your eyes and face relax and soften. Let all the stress leave your whole body. Feel the connection with our ancestors, the sacredness of the space, and the connection with the land."',
          },
        ],
      },
      {
        id: "a2",
        label: "A2",
        title: "Sensory Awareness (5-4-3-2-1)",
        blocks: [
          { kind: "p", bold: true, text: "Purpose: brain rapid reset" },
          {
            kind: "ul",
            items: [
              "5: Look for 5 things you can see around you (e.g., a chair, a plant, the sky).",
              "4: Focus on 4 things you can touch (e.g., your hair, the desk, the floor).",
              "3: Listen for 3 things you can hear (e.g., traffic, birds, your breath).",
              "2: Identify 2 things you can smell (e.g., soap, air, food).",
              "1: Notice 1 thing you can taste (e.g., toothpaste, coffee).",
            ],
          },
        ],
      },
      {
        id: "a3",
        label: "A3",
        title: "Physical & Tactile Grounding",
        blocks: [
          { kind: "p", bold: true, text: "Purpose: Awareness to your body and its connection to the environment" },
          {
            kind: "ul",
            items: [
              "Dig your heels in: focus on your feet against the ground, noticing the weight.",
              "Temperature change: run cold or warm water over your hands.",
              "Clench/Release: tighten your fists, hold for 5-10 seconds, then release and feel the relaxation.",
              "Carry a calming object: carry a small rock, fabric, or jewelry in your pocket to touch.",
              "Stretch: extend your arms and legs to feel sensations of tension and release.",
              "Butterfly tapping: tap your chest or shoulders gently with your hands, alternating sides.",
            ],
          },
        ],
      },
      {
        id: "a4",
        label: "A4",
        title: "Loving Kindness Meditation",
        blocks: [
          {
            kind: "p",
            text: "Loving-kindness meditation (also known as Metta) is a mindfulness practice designed to cultivate compassion, warmth, and goodwill. Place a hand on your heart if you feel emotional resistance. There is no right way to feel — simply intending to wish someone well carries the same mental benefits.",
          },
          { kind: "p", bold: true, text: "Yourself" },
          { kind: "p", text: '"May I be happy. May I be healthy. May I be safe. May I live with ease."' },
          { kind: "p", bold: true, text: "A Loved One" },
          {
            kind: "p",
            text: '"May you be happy. May you be healthy. May you be safe. May you live with ease."',
          },
          { kind: "p", bold: true, text: "All Beings" },
          { kind: "p", text: '"May all beings everywhere be happy, healthy, and free."' },
        ],
      },
    ],
  },
];
