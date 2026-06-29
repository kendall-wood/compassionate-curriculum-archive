// Ice Breakers appendix, sourced from the Google Doc's Appendix. Kept here as
// structured data (English) and rendered on /appendix. Translations are held
// until content is final; this can be wired into the translate pipeline later.

export type IceBreakerBlock = { heading?: string; text: string };

export type IceBreaker = {
  title: string;
  blocks: IceBreakerBlock[];
};

export const ICE_BREAKERS_INTRO =
  "Icebreakers are short activities designed to warm up a group, encourage participation, and foster genuine connections before diving into a workshop, meeting or class. The co-facilitator(s) should model the activity first, especially when asking for participation that leans on sharing personal stories.";

export const ICE_BREAKERS: IceBreaker[] = [
  {
    title: "Walking circle",
    blocks: [
      {
        heading: "Directions",
        text: "This is a great icebreaker for activating a space. You will share a prompt and then change it up. The facilitator(s) may need to assess the mobility of participants, and adjust the prompt from walk to move (etc.). Walk like you are carefree… walk like a professor, walk like a new student at the university… like a tourist in NYC…, like an Olympian… like you're happy, etc.",
      },
    ],
  },
  {
    title: "Zip, Zap, Zop",
    blocks: [
      {
        heading: "Directions",
        text: "Stand in a circle. Someone begins by pointing to another person in the circle and saying \"ZIP!\" That person then points to yet another person and says \"ZAP!\" That person points to another person and says \"ZOP!\" This continues, but the words must be said in order: ZIP, ZAP, ZOP. If someone makes a mistake and says a word out of order, that person is out of the game.",
      },
      {
        heading: "Alternatives",
        text: "Sit in a circle. One person starts by turning to the person (either direction) next to them and saying Zip. The Zip is passed around in the same direction until someone says Zap, which acts as a reverse. The Zoop is used for anyone in the circle, said and directed using eye contact and body language for the other person to pick up and respond with a Zip, Zap, or Zoop!",
      },
    ],
  },
  {
    title: "Name Toss",
    blocks: [
      {
        heading: "Directions",
        text: "Arrange the group in a circle. One person starts off by saying the name of someone else in the circle, and tossing the ball to them. That person then in turn says \"thank you _____\" to the person who threw it to them, then says the name of a different person who has not yet received the ball and tosses it to them. That continues until everyone in the circle has received the ball once. Generally, the objective is to pass the ball around the circle without dropping it. If the ball is dropped, the group restarts until completed without dropping.",
      },
      {
        heading: "Alternatives",
        text: "Once the group has accomplished the task as described above, add a second item (ball, rubber chicken, etc.) and instruct the group that it, too, must travel in the same pattern. You can add more items as you see fit. For a more \"team-building\" type game, add 4-6 items, and hold the rules in place. For a more \"ice breaker\" type game, add as many items as possible, particularly goofy props. Or, playing the original game, the team must work backwards in the order the ball was tossed.",
      },
    ],
  },
  {
    title: "Catch a Story (10 minutes)",
    blocks: [
      {
        heading: "Directions",
        text: "Have a ball or (better) a beanbag. Begin a story. Throw it to the person who must continue the story. This is better than dragging around the circle, and shy people can get rid of the story after only one word.",
      },
      {
        heading: "Alternatives",
        text: "A variation on this is \"fortunately, unfortunately\". Each person must add a sentence, changing the sentence of the main character.",
      },
    ],
  },
  {
    title: "Banana Slap",
    blocks: [
      {
        heading: "Directions",
        text: "Everyone is in a circle with their hands out, with one person in the middle holding a banana shaped object (optional). Someone in the circle calls out the name of another person in the circle. The person in the middle tries to slap the hand of the person whose name is called. The person whose name is called tries to call the name of another person in the circle before their hand is slapped.",
      },
    ],
  },
  {
    title: "Big Wind Blows",
    blocks: [
      {
        heading: "Directions",
        text: "Participants stand in a circle with one fewer chair (or marked spot) than there are players, leaving one person in the middle. The person in the middle calls out \"The big wind blows for anyone who…\" and names something true for them (e.g. \"…is wearing trainers\"). Everyone for whom it is true must move to a new spot, and the person left without one starts the next round.",
      },
    ],
  },
  {
    title: "Biggest Fans",
    blocks: [
      {
        heading: "Directions",
        text: "Participants pair up and compete in rock, paper, scissors. Whoever wins 2 out of 3 games with the partner is the \"winner\" of that pair. The loser then becomes the winner's \"biggest fan,\" following around and cheering them on in their matches with others. Each \"winner\" collects the fans of the person they win against until there are two finalists, each with a group of biggest fans.",
      },
    ],
  },
  {
    title: "History of your name",
    blocks: [
      {
        heading: "Note",
        text: "This activity can be triggering for individuals with a history of trauma. Alternatively, instructions can include your 'chosen name or family name.'",
      },
    ],
  },
  {
    title: "History of your body art",
    blocks: [
      {
        heading: "Directions",
        text: "Tell the story of a tattoo that you have; or a tattoo that you'd consider getting, even if it might be invisible to others.",
      },
    ],
  },
  {
    title: "Describe 2-3 words or phrases of slang that are currently used where you live now, or were used where you grew up.",
    blocks: [
      {
        heading: "Note",
        text: "Reminding folks of community agreements around types of language/vocabulary that are part of the setting may need to occur before this activity. For example, use of profanity or words that are derogatory.",
      },
    ],
  },
  {
    title: "Who are five people, living or dead, who you would invite to a dinner party?",
    blocks: [],
  },
  {
    title: "Describe 1-2 objects that are dear to you, that represent some aspect of your personality.",
    blocks: [],
  },
  {
    title: "Describe a song that is meaningful to you, that you associate with a positive memory.",
    blocks: [
      {
        text: "This could be a song you associate with a holiday, from the radio, from time with family or friends.",
      },
      {
        heading: "Note",
        text: "If time allows that same day or later in a multiple-day workshop or meeting, create a playlist of the songs mentioned.",
      },
    ],
  },
  {
    title: "If you could have a portrait created of you in any media or style, what would it be?",
    blocks: [
      {
        heading: "Directions",
        text: "Describe where you are, what you're wearing, how you are positioned, and any items you might hold or have surrounding you.",
      },
    ],
  },
  {
    title: "If you've ever received any useful advice, describe it. Or, describe advice you'd give to your younger self.",
    blocks: [
      {
        heading: "Directions",
        text: "Describe why it was or is useful. You may use a format such as \"Dear {name}, you…\" to activate the advice in the here and now.",
      },
    ],
  },
  {
    title: "Community Building Activity (for workshops with multiple sessions)",
    blocks: [
      {
        heading: "Directions",
        text: "Ask the group: What can we do within each session to facilitate the group connecting with each other?",
      },
    ],
  },
  {
    title: "To end each session — Summary and Assessment",
    blocks: [
      {
        heading: "Directions",
        text: "Ask what people learned, what they liked, and especially how they can apply information learned to their lives. Also, ask what they would do differently for that session or day of the workshop, or the next day/session.",
      },
    ],
  },
  {
    title: "ZOOM / Online Icebreakers",
    blocks: [
      {
        heading: "The Chat Waterfall",
        text: "Ask an open-ended question (e.g. \"What's one thing that made you smile this week?\", \"Where is your dream travel destination?\", or \"What is your comfort food?\"). Tell participants to type their answer into the chat box, but not to press Enter yet. Count down from three and tell everyone to hit send at the same time. This creates a cascade of answers everyone can read at once.",
      },
      {
        heading: "Two-Word Check-in",
        text: "Ask everyone to think of exactly two words that describe how they are feeling at that moment or how their week is going. Have participants type their two words into the chat, or call on them one by one to unmute and share.",
      },
      {
        heading: "Scavenger Hunt",
        text: "Tell participants that they have 3 minutes to find as many of these things as they can: something blue; something that smells good; something that you should get rid of; something that makes you happy. (Other options: your fave midnight snack; the last note you wrote yourself; the last text you sent to someone; something that reminds you of someone you love.) Have everyone hold their items up to their camera and share a brief story about an object. Alternate participation to include different folks.",
      },
      {
        heading: "Breakout Room Pairings",
        text: "Use the Zoom Breakout Room feature to place participants into pairs. Give them a prompt (e.g. \"Tell your partner a favorite childhood memory\" or \"Together, invent an imaginary secret handshake\"). Set a timer for 3 to 5 minutes, then rotate participants into new pairs for a different prompt.",
      },
    ],
  },
];
