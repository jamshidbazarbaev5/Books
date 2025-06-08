// Mock data for the app
export const mockWriters = [
    {
        id: 1,
        name: "William Shakespeare",
        period: "1564-1616",
        nation: "English",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/800px-Shakespeare.jpg",
        gallery: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/800px-Shakespeare.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/First_Folio.jpg/800px-First_Folio.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Shakespeare_Birthplace_2016.jpg/800px-Shakespeare_Birthplace_2016.jpg",
        ],
        biography:
            "William Shakespeare was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world's greatest dramatist. He is often called England's national poet and the \"Bard of Avon\". His extant works, including collaborations, consist of some 39 plays, 154 sonnets, two long narrative poems, and a few other verses, some of uncertain authorship. His plays have been translated into every major living language and are performed more often than those of any other playwright.",
        riddles: [
            {
                id: 901,
                title: "Life's Mystery",
                content: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?",
                answers: ["A river"]
            },
            {
                id: 902,
                title: "The Silent Guard",
                content: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. I have roads, but no cars. What am I?",
                answers: ["A map"]
            }
        ],
        poems: [
            {
                id: 1,
                title: "Sonnet 18",
                year: "1609",
                content:
                    "Shall I compare thee to a summer's day?\nThou art more lovely and more temperate.\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date.\nSometime too hot the eye of heaven shines,\nAnd often is his gold complexion dimmed;\nAnd every fair from fair sometime declines,\nBy chance, or nature's changing course, untrimmed;\nBut thy eternal summer shall not fade,\nNor lose possession of that fair thou ow'st,\nNor shall death brag thou wand'rest in his shade,\nWhen in eternal lines to Time thou grow'st.\nSo long as men can breathe, or eyes can see,\nSo long lives this, and this gives life to thee.",
            },
            {
                id: 2,
                title: "Sonnet 116",
                year: "1609",
                content:
                    "Let me not to the marriage of true minds\nAdmit impediments. Love is not love\nWhich alters when it alteration finds,\nOr bends with the remover to remove.\nO no! it is an ever-fixed mark\nThat looks on tempests and is never shaken;\nIt is the star to every wand'ring bark,\nWhose worth's unknown, although his height be taken.\nLove's not Time's fool, though rosy lips and cheeks\nWithin his bending sickle's compass come;\nLove alters not with his brief hours and weeks,\nBut bears it out even to the edge of doom.\nIf this be error and upon me proved,\nI never writ, nor no man ever loved.",
            },
        ],
        books: [
            {
                id: 101,
                title: "Hamlet",
                year: "1601",
                content: [
                    "Act I, Scene 1\n\nElsinore. A platform before the castle.\nFRANCISCO at his post. Enter to him BERNARDO\n\nBERNARDO: Who's there?\n\nFRANCISCO: Nay, answer me: stand, and unfold yourself.\n\nBERNARDO: Long live the king!\n\nFRANCISCO: Bernardo?\n\nBERNARDO: He.\n\nFRANCISCO: You come most carefully upon your hour.\n\nBERNARDO: 'Tis now struck twelve; get thee to bed, Francisco.",
                    
                    "Act I, Scene 2\n\nA room of state in the castle.\nEnter KING CLAUDIUS, QUEEN GERTRUDE, HAMLET, POLONIUS, LAERTES, VOLTIMAND, CORNELIUS, Lords, and Attendants\n\nKING CLAUDIUS: Though yet of Hamlet our dear brother's death\nThe memory be green, and that it us befitted\nTo bear our hearts in grief and our whole kingdom\nTo be contracted in one brow of woe,\nYet so far hath discretion fought with nature\nThat we with wisest sorrow think on him,\nTogether with remembrance of ourselves.",
                    
                    "Act I, Scene 3\n\nA room in Polonius' house.\nEnter LAERTES and OPHELIA\n\nLAERTES: My necessaries are embark'd: farewell:\nAnd, sister, as the winds give benefit\nAnd convoy is assistant, do not sleep,\nBut let me hear from you.\n\nOPHELIA: Do you doubt that?\n\nLAERTES: For Hamlet and the trifling of his favour,\nHold it a fashion and a toy in blood,\nA violet in the youth of primy nature,"
                ].join('\n\n'),
                audio: {
                    ios: 'Черная любовь.mp3',
                    android: 'raw/chernaya_lubov'
                }
            },
            {
                id: 102,
                title: "Romeo and Juliet",
                year: "1595",
                content: [
                    "Prologue\n\nTwo households, both alike in dignity,\nIn fair Verona, where we lay our scene,\nFrom ancient grudge break to new mutiny,\nWhere civil blood makes civil hands unclean.\nFrom forth the fatal loins of these two foes\nA pair of star-cross'd lovers take their life;",
                    
                    "Act I, Scene 1\n\nVerona. A public place.\nEnter SAMPSON and GREGORY, of the house of Capulet, armed with swords and bucklers\n\nSAMPSON: Gregory, o' my word, we'll not carry coals.\n\nGREGORY: No, for then we should be colliers.",
                    
                    "Act I, Scene 2\n\nA street.\nEnter CAPULET, PARIS, and Servant\n\nCAPULET: But Montague is bound as well as I,\nIn penalty alike; and 'tis not hard, I think,\nFor men so old as we to keep the peace."
                ].join('\n\n'),
                audio: {
                    ios: 'Черная любовь.mp3',
                    android: 'raw/chernaya_lubov'
                }
            }
        ]
    },
    {
        id: 2,
        name: "Emily Dickinson",
        period: "1830-1886",
        nation: "American",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Emily_Dickinson_daguerreotype_%28cropped%29.jpg/800px-Emily_Dickinson_daguerreotype_%28cropped%29.jpg",
        gallery: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Emily_Dickinson_daguerreotype_%28cropped%29.jpg/800px-Emily_Dickinson_daguerreotype_%28cropped%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Emily_Dickinson_Homestead.JPG/800px-Emily_Dickinson_Homestead.JPG",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Emily_Dickinson_manuscript_There%27s_a_certain_slant_of_light.jpg/800px-Emily_Dickinson_manuscript_There%27s_a_certain_slant_of_light.jpg",
        ],
        biography:
            "Emily Elizabeth Dickinson was an American poet. Little-known during her life, she has since been regarded as one of the most important figures in American poetry. Dickinson was born in Amherst, Massachusetts into a prominent family with strong ties to its community. After studying at the Amherst Academy for seven years in her youth, she briefly attended the Mount Holyoke Female Seminary before returning to her family's house in Amherst. Evidence suggests that Dickinson lived much of her life in isolation. Considered an eccentric by locals, she developed a penchant for white clothing and was known for her reluctance to greet guests or, later in life, to even leave her bedroom. Dickinson never married, and most friendships between her and others depended entirely upon correspondence.",
        riddles: [
            {
                id: 903,
                title: "The Broken Need",
                content: "What has to be broken before you can use it?",
                answers: ["An egg"]
            },
            {
                id: 904,
                title: "Time's Flame",
                content: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
                answers: ["A candle"]
            }
        ],
        poems: [
            {
                id: 3,
                title: "Hope is the thing with feathers",
                year: "1861",
                content:
                    '"Hope" is the thing with feathers -\nThat perches in the soul -\nAnd sings the tune without the words -\nAnd never stops - at all -\n\nAnd sweetest - in the Gale - is heard -\nAnd sore must be the storm -\nThat could abash the little Bird\nThat kept so many warm -\n\nI\'ve heard it in the chillest land -\nAnd on the strangest Sea -\nYet - never - in Extremity,\nIt asked a crumb - of me.',
            },
            {
                id: 4,
                title: "Because I could not stop for Death",
                year: "1863",
                content:
                    "Because I could not stop for Death –\nHe kindly stopped for me –\nThe Carriage held but just Ourselves –\nAnd Immortality.\n\nWe slowly drove – He knew no haste\nAnd I had put away\nMy labor and my leisure too,\nFor His Civility –\n\nWe passed the School, where Children strove\nAt Recess – in the Ring –\nWe passed the Fields of Gazing Grain –\nWe passed the Setting Sun –\n\nOr rather – He passed Us –\nThe Dews drew quivering and Chill –\nFor only Gossamer, my Gown –\nMy Tippet – only Tulle –\n\nWe paused before a House that seemed\nA Swelling of the Ground –\nThe Roof was scarcely visible –\nThe Cornice – in the Ground –\n\nSince then – 'tis Centuries – and yet\nFeels shorter than the Day\nI first surmised the Horses' Heads\nWere toward Eternity –",
            },
        ],
        books: [
            {
                id: 201,
                title: "Letters to the World",
                year: "1886",
                content: "This is my letter to the World\nThat never wrote to Me—\nThe simple News that Nature told—\nWith tender Majesty\n\nHer Message is committed\nTo Hands I cannot see—\nFor love of Her—Sweet—countrymen—\nJudge tenderly—of Me\n\nDear Friend—\nI could not stop for Death, but Death was kind and stopped for me. The Carriage held but just ourselves and Immortality. I write to you from the garden of possibility, where Hope perches in the soul and sings without pause...\n\nThe letters continue, each a window into a world where even the smallest detail holds the weight of existence. Time is but a pause between eternities, and words are the bridges we build across the void."
            },
            {
                id: 202,
                title: "Collected Thoughts on Nature",
                year: "1880",
                content: "Nature is what we know -\nYet have not art to say -\nSo impotent Our Wisdom is\nTo her Simplicity\n\nThe Murmur of a Bee\nA Witchcraft - yieldeth me -\nIf any ask me why -\nTwere easier to die -\nThan tell -\n\nThe Red upon the Hill\nTaketh away my will -\nIf anybody sneer -\nTake care - for God is here -\nThat's all.\n\nIn these pages, I contemplate the mysteries of our natural world. Each flower that blooms in the garden carries a message from the divine, and every sunset paints a canvas that even the greatest artist could not replicate..."
            }
        ]
    },
    {
        id: 3,
        name: "Pablo Neruda",
        period: "1904-1973",
        nation: "Chilean",
        image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Pablo_Neruda_1963.jpg/800px-Pablo_Neruda_1963.jpg",
        gallery: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Pablo_Neruda_1963.jpg/800px-Pablo_Neruda_1963.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/La_Sebastiana%2C_Valpara%C3%ADso%2C_Chile.jpg/800px-La_Sebastiana%2C_Valpara%C3%ADso%2C_Chile.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Isla_Negra_-_Casa_de_Pablo_Neruda_%28Exterior%29.JPG/800px-Isla_Negra_-_Casa_de_Pablo_Neruda_%28Exterior%29.JPG",
        ],
        biography:
            "Pablo Neruda was a Chilean poet-diplomat and politician who won the Nobel Prize for Literature in 1971. Neruda became known as a poet when he was 13 years old, and wrote in a variety of styles, including surrealist poems, historical epics, overtly political manifestos, a prose autobiography, and passionate love poems such as the ones in his collection Twenty Love Poems and a Song of Despair (1924). Neruda occupied many diplomatic positions in various countries during his lifetime and served a term as a Senator for the Chilean Communist Party. When President Gabriel González Videla outlawed communism in Chile in 1948, a warrant was issued for Neruda's arrest. Friends hid him for months in the basement of a house in the port city of Valparaíso, and he later escaped through a mountain pass near Maihue Lake into Argentina.",
        riddles: [
            {
                id: 905,
                title: "Nature's Song",
                content: "What has keys, but no locks; space, but no room; and you can enter, but not go in?",
                answers: ["A keyboard"]
            },
            {
                id: 906,
                title: "Light's Dance",
                content: "The more you take, the more you leave behind. What am I?",
                answers: ["Footsteps"]
            }
        ],
        poems: [
            {
                id: 5,
                title: "Tonight I Can Write",
                year: "1924",
                content:
                    "Tonight I can write the saddest lines.\n\nWrite, for example, 'The night is starry\nand the stars are blue and shiver in the distance.'\n\nThe night wind revolves in the sky and sings.\n\nTonight I can write the saddest lines.\nI loved her, and sometimes she loved me too.\n\nThrough nights like this one I held her in my arms.\nI kissed her again and again under the endless sky.\n\nShe loved me, sometimes I loved her too.\nHow could one not have loved her great still eyes.\n\nTonight I can write the saddest lines.\nTo think that I do not have her. To feel that I have lost her.\n\nTo hear the immense night, still more immense without her.\nAnd the verse falls to the soul like dew to the pasture.\n\nWhat does it matter that my love could not keep her.\nThe night is starry and she is not with me.\n\nThis is all. In the distance someone is singing. In the distance.\nMy soul is not satisfied that it has lost her.\n\nMy sight tries to find her as though to bring her closer.\nMy heart looks for her, and she is not with me.\n\nThe same night whitening the same trees.\nWe, of that time, are no longer the same.\n\nI no longer love her, that's certain, but how I loved her.\nMy voice tried to find the wind to touch her hearing.\n\nAnother's. She will be another's. As she was before my kisses.\nHer voice, her bright body. Her infinite eyes.\n\nI no longer love her, that's certain, but maybe I love her.\nLove is so short, forgetting is so long.\n\nBecause through nights like this one I held her in my arms\nmy soul is not satisfied that it has lost her.\n\nThough this be the last pain that she makes me suffer\nand these the last verses that I write for her.",
            },
        ],
        books: [
            {
                id: 301,
                title: "Twenty Love Poems and a Song of Despair",
                year: "1924",
                content: "Body of woman, white hills, white thighs,\nyou look like a world, lying in surrender.\nMy rough peasant's body digs in you\nand makes the son leap from the depth of the earth.\n\nI was alone like a tunnel. The birds fled from me,\nand night swamped me with its crushing invasion.\nTo survive myself I forged you like a weapon,\nlike an arrow in my bow, a stone in my sling.\n\nBut the hour of vengeance falls, and I love you.\nBody of skin, of moss, of eager and firm milk.\nOh the goblets of the breast! Oh the eyes of absence!\nOh the roses of the pubis! Oh your voice, slow and sad!\n\nBody of my woman, I will persist in your grace.\nMy thirst, my boundless desire, my shifting road!\nDark river-beds where the eternal thirst flows\nand weariness follows, and the infinite ache."
            },
            {
                id: 302,
                title: "Memoirs: Confieso que he vivido",
                year: "1974",
                content: "I grew up in this town, my poetry was born between the hill and the river, it took its voice from the rain, and like the timber, it steeped itself in the forests...\n\nWhat did I do before I kissed you? What were my thoughts each morning? I am sure that I would not recognise myself in the shards of those days. Your name, written clearly on all the walls of my memory, on all the walls of my future, marks the boundaries of my territory, the exact measurements of my soul...\n\nPerhaps the world is a dream of the sea. I have so much of the sea in me that I am partly a being of foam, of waves moving at night and of vessels remote and tragic. Let me rest a moment more by your side. What torments me is not your kisses - my love, what torments me is your love."
            }
        ]
    },
]

export const mockFavorites = [
    {
        writer: mockWriters[0],
        poem: mockWriters[0].poems[0],
    },
    {
        writer: mockWriters[1],
        poem: mockWriters[1].poems[0],
    },
]
