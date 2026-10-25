import type { Dictionary } from './ar';

export const en: Dictionary = {
  meta: {
    title: 'Ahwa Baladi: Fatla Wala Koshary? Egyptian Tea Studio',
    description:
      "Build your Egyptian street-cafe tea on a brass tray: loose-leaf Koshary or tea-bag Fatla, heavy or light, sugar '3al reeha'. Can't decide? The Ma'allem picks.",
    ogAlt:
      'A waisted Egyptian tea glass on a brass tray: Ahwa Baladi, Fatla Wala Koshary?'
  },
  nav: {
    brand: 'Ahwa Baladi',
    tagline: 'Fatla Wala Koshary?',
    skip: 'Skip to the good stuff',
    langGroup: 'Choose language',
    mute: 'Mute sounds',
    unmute: 'Unmute sounds'
  },
  poll: {
    title: "What's the Street Saying?",
    live: 'Live from the ahwa',
    koshary: 'Koshary Party',
    fatla: 'Fatla Party',
    voteKoshary: 'Koshary since day one',
    voteFatla: 'Proud Fatla',
    votes: 'votes',
    hint: "You're a Ma'allem here, and a Ma'allem's vote counts 25! Pick a side and flip the table.",
    pause: 'Pause the trash talk',
    play: 'Resume the trash talk',
    welcome: {
      koshary:
        "Welcome to the Party of Authenticity! Pull up a chair by the Ma'allem and let the leaves settle.",
      fatla:
        "Welcome to the Party of Speed! Dunk, lift, and don't be late for work."
    },
    talk: {
      koshary: [
        'Fatla is tea in installments — a paper bag in hot water, khalas.',
        'Fatla drinkers read the last page of the novel first.',
        'Koshary is a school, habibi. Fatla is an online course.',
        "We wait for the leaves to settle. That patience isn't for everyone.",
        "Fatla? That's Zoom-meeting tea."
      ],
      fatla: [
        'Ya 3am, we have jobs. Nobody has time to wait for leaves to sit down.',
        "Koshary is nice — but who's picking the leaves out of your teeth?",
        'Dunk, lift, done. Clean tea, zero headache.',
        "The Koshary Party is still waiting. We're on our second glass.",
        "Authenticity is lovely, but time is gold, ya Ma'allem."
      ]
    }
  },
  hero: {
    greeting: 'Sabah el Mazag el 3aly!',
    title: 'Fatla Wala Koshary?',
    subtitle:
      "The Eternal Street Debate: Loose-Leaf Koshary vs. Tea-Bag Fatla. Build your glass on the brass tray — and if your brain isn't awake yet, let the Ma'allem decide for you.",
    ctaStudio: "Tune the Ta'meera, Ma'allem",
    ctaQuiz: "Can't decide? Let the Ma'allem pick",
    stickers: [
      'Koshary: ink that washes worries away',
      'Fatla: for people in a hurry',
      "Sugar '3al Reeha'"
    ]
  },
  quiz: {
    kicker: "The Ma'allem's Verdict",
    title: "Can't decide? Let the Ma'allem pick",
    subtitle:
      "Three quick questions and the Ma'allem will read your mind — and your mood.",
    start: "Go on, Ma'allem, ask me",
    hide: "Never mind, I've decided",
    step: 'Question',
    of: 'of',
    back: 'Back',
    questions: {
      head: "How's your head doing right now?",
      meal: 'What did you eat before the tea?',
      spot: 'Where are you sitting right now?'
    },
    answers: {
      headache: {
        label: 'Pounding — I need to wake up',
        quip: 'That headache only leaves for a heavy glass that resets the brain.'
      },
      chill: {
        label: 'Chill and chasing some saltana',
        quip: "Chill vibes need tea mazbout to the hair and sugar '3al reeha'."
      },
      rushed: {
        label: 'Drowning in work and in a hurry',
        quip: 'Busy bees get a light glass they can finish in two sips, plus extra sugar for the next meeting.'
      },
      heavy: {
        label: 'A heavy meal (koshary, mahshi or feseekh)',
        quip: "After that meal you need mint to digest — or you'll fall asleep in your chair."
      },
      breakfast: {
        label: 'A light breakfast — cheese & pâté',
        quip: 'Cheese and pâté only pair with milk tea, ya prince.'
      },
      empty: {
        label: 'Nothing — running on an empty stomach',
        quip: 'Empty stomach? Then no philosophy — your stomach is a trust on your shoulders.'
      },
      balcony: {
        label: 'On the balcony at night',
        quip: 'Balcony nights call for authentic Koshary and saltana till dawn.'
      },
      office: {
        label: 'In front of the laptop at the office',
        quip: 'Laptop and emails? Dunk a Fatla, lift it, and get back to work, champ.'
      },
      blanket: {
        label: 'Freezing and tucked under the blanket',
        quip: 'This cold needs Maghly over the sabertaya to warm your bones.'
      }
    },
    verdictKicker: "The Ma'allem has spoken",
    verdicts: {
      koshary: "Authentic Koshary, Ma'allem! Settled leaves, balanced words.",
      fatla: 'A speedy Fatla, ya Basha! Dunk, lift, carry on with your day.',
      maghly:
        "Sa'eedi Maghly over the sabertaya! Ink strong enough to wake the whole block."
    },
    applied: 'Your tray below is now set to your mood',
    seeGlass: 'Show me the glass',
    retry: 'Ask me again',
    teaser:
      "The Ma'allem has run this ahwa since before your dad got married — he reads your mood from the way you pull up a chair. Answer three questions and leave the rest to him.",
    greeting: "Ahlan ya Basha, you lit up the ahwa! What'll it be?",
    listening: "Go on, I'm listening… and no beating around the bush.",
    final: "That's my verdict — and no appeals!",
    reasons: 'Grounds for the verdict',
    shout: "'3andak wa7ed!' One coming up:",
    stamp: 'Final verdict',
    badge: 'Certified by the whole block',
    maallem:
      "The Ma'allem in his red tarboosh and big mustache, holding a glass of tea"
  },
  studio: {
    kicker: "The Ma'allem's Tray",
    title: 'Build Your Glass',
    subtitle:
      'Pick the base, the strength, the sugar and the tahbeesha — and watch your glass come together on the brass tray.',
    steps: {
      type: 'The Base',
      strength: 'The Strength',
      sugar: 'The Sugar',
      addon: 'The Tahbeesha'
    },
    prompts: {
      type: 'How do you brew it?',
      strength: 'Heavy or light?',
      sugar: 'How much sugar?',
      addon: 'What should we dress it with?'
    },
    glassLabel: 'A waisted Egyptian tea glass on a brass tray',
    clink: 'Clink the Spoon 🥄',
    sip: 'Take a Sip ☕',
    refill: "Pour Again, Ma'allem!",
    clinked: "Tak-taka-tak! The waiter heard you — he's on his way.",
    sips: [
      'Aaah… what a sip.',
      'My brain just got fixed, wallahi.',
      "One more sip and you're officially a Ma'allem."
    ],
    empty: 'Glass empty! Settle the bill — or shall we pour another?',
    refilled: 'Freshly poured. Bel hana wel shefa!',
    hint: 'Your glass is served, ya Basha! Clink for the waiter, or sip and relax.',
    tag: 'FATLA'
  },
  options: {
    type: {
      koshary: {
        label: 'Authentic Koshary',
        desc: 'Loose leaves straight in the glass, bubbling water poured on top. You wait for the leaves to settle — the tea of patience and heritage.',
        short: 'Koshary tea'
      },
      fatla: {
        label: 'Speedy Fatla',
        desc: 'A bag on a string with a yellow tag swinging outside the glass. Dunk, lift, done — for people in a hurry and office folks.',
        short: 'Fatla tea'
      },
      maghly: {
        label: 'Boiled on the Sabertaya',
        desc: "Tea and water boiled together in the kettle until it turns to ink. The Sa'eedi way, for night owls till dawn.",
        short: 'Maghly tea'
      }
    },
    strength: {
      khafeef: {
        label: 'Light — Golden Water',
        desc: 'For those still getting to know tea. Golden color, calm mood.',
        short: 'Light'
      },
      mazbout: {
        label: 'Mazbout — Spot On',
        desc: 'Upsets no one, gives no one a headache. By the book.',
        short: 'Mazbout'
      },
      teqeel: {
        label: "Sa'eedi Heavy Ink",
        desc: 'Wakes the dead and keeps sleep away till tomorrow.',
        short: 'Heavy'
      }
    },
    sugar: {
      sada: {
        label: 'Sada — Plain & Honest',
        desc: 'For those who like the truth bitter, as it is.',
        short: 'No sugar'
      },
      riha: {
        label: "Sugar '3al Reeha' (Just a Whisper)",
        desc: 'A tiny sprinkle… just for the scent.',
        short: "Sugar '3al reeha'"
      },
      mazbout: {
        label: 'Mazbout',
        desc: "Two spoons, just how the Ma'allem likes it.",
        short: 'Sugar mazbout'
      },
      zyada: {
        label: 'Zyada (Extra on the Side)',
        desc: "That's sherbet, not tea, ya Ma'allem.",
        short: 'Extra sugar'
      }
    },
    addon: {
      none: {
        label: 'No Philosophy (Plain)',
        desc: 'Plain — no extras, no drama.',
        short: 'No tahbeesha'
      },
      mint: {
        label: 'Fresh Baladi Mint',
        desc: 'Opens the appetite and settles the lunch.',
        short: 'Mint tahbeesha'
      },
      milk: {
        label: 'Milk (Shai Bel Laban)',
        desc: 'For breakfast, blankets and winter days.',
        short: 'with milk'
      },
      cloves: {
        label: 'Two Clove Buds',
        desc: 'For colds and coughs… warms the heart before the hands.',
        short: 'Clove tahbeesha'
      }
    }
  },
  timer: {
    kicker: 'The Steeping Counter',
    title: 'Good tea takes its time',
    subtitle:
      "Pour the water and the Ma'allem stays by your side, coaching you step by step — based on your glass.",
    start: 'Pour the Boiling Water!',
    pause: 'Hold on',
    resume: 'Carry on',
    reset: 'Start over',
    fastForward: 'Tired of waiting? Fast-forward ⚡',
    idle: "The water is bubbling and waiting for you, Ma'allem.",
    remaining: 'Left',
    coach: "The Ma'allem says",
    doneTitle: "Tea's ready!",
    tips: {
      koshary: [
        "Leaves in the glass, then pour the water while it's still bubbling.",
        "Don't stir now! Let the leaves sink to the bottom on their own.",
        "See the leaves settling? That's the tea cooking on white water.",
        "Almost there… just don't drink the leaves, Ma'allem."
      ],
      fatla: [
        'Dunk the Fatla and keep the yellow tag outside the glass.',
        'Bob the bag up and down — gently, have mercy on it.',
        "Don't leave the bag in too long or it turns bitter like medicine.",
        "Pull the bag out now — and don't squeeze it with the spoon!"
      ],
      maghly: [
        'Tea and water go into the kettle together, straight onto the sabertaya.',
        "Let it boil… the Sa'eedis wait until it turns to ink.",
        'Smell that? The mood is cooking over a low flame.',
        "Almost Sa'eedi ink… get the glass ready."
      ]
    },
    done: {
      koshary:
        "The leaves have settled and the tea is ready! Bel hana, Ma'allem.",
      fatla: 'Pull the bag out NOW! Your glass is ready, ya Basha.',
      maghly: "The Sa'eedi ink is ready! Drink up and wake the whole street."
    }
  },
  receipt: {
    kicker: 'Settle the Bill',
    title: "The Ahwa Check & The Ma'allem's Wisdom",
    subtitle:
      "The check writes itself from your order — and the Ma'allem never runs out of wisdom.",
    shop: "The Ma'allem's Ahwa",
    shopTagline: 'Baladi since forever — no Wi-Fi, talk to each other',
    table: 'Table',
    waiter: 'Waiter: Hamada',
    order: 'Order',
    price: 'Price',
    total: 'Total',
    currency: 'EGP',
    tip: 'Tip: whatever your heart says',
    onWater: 'on white water',
    onMilk: 'with milk',
    metersTitle: 'Caffeine & Mood Meter',
    meters: { focus: 'Focus', vibe: 'Vibe', cred: 'Street Cred' },
    wisdomTitle: 'Wisdom of the Day',
    nextWisdom: "Another one, Ma'allem 🎲",
    copy: 'Copy Order Receipt 📋',
    copied: 'Receipt copied! Send it to the shilla.',
    copyFailed: 'Your browser got shy and refused to copy. Try again.',
    thanks: 'You lit up the place — now settle the bill!',
    wisdoms: [
      "Rush the Koshary, and you'll be drinking leaves.",
      "Leave the Fatla in too long and it'll make your whole life bitter.",
      "Heavy tea is like a gada' friend — it shows up when things get tight.",
      "One glass at the ahwa solves problems the United Nations couldn't.",
      "Sugar '3al Reeha' is like sweet talk: a whisper is enough, a spoonful gets sticky.",
      'No taste for tea? No seat at the table.',
      'Life is an hour of this and an hour of that… and tea fits in both.',
      'Mint in the glass is a smile on the face of the morning.',
      "When the Ma'allem is away, the waiter adds extra sugar.",
      'Patience is the key to relief… and patience with the leaves is the key to keif.',
      'Never drop the Fatla before the water — haste is from the devil.',
      'Milk tea without biscuits is a wedding without a zaghrouta.',
      'Every glass has its spoon, and every spoon has its ring.',
      'Drink Maghly from the sabertaya and the morning headache will think twice.',
      "What's said at the ahwa stays at the ahwa."
    ]
  },
  footer: {
    made: 'Brewed with love and one very heavy glass of tea on the sidewalk.',
    sounds: 'Every sound is synthesized in code — no MP3s were harmed.'
  },
  notFound: {
    title: "This glass isn't on our tray",
    body: "Looks like you got lost in the alleys, ya Ma'allem. Head back to the ahwa and we'll pour you a fresh one.",
    home: 'Back to the ahwa'
  }
};
