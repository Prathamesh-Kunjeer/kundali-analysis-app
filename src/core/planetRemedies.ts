// ============================================================
//  CENTRALIZED TRADITIONAL REMEDY DATABASE (planetRemedies.ts)
// ============================================================

import type { Planet, PlanetAnalysis } from './models';
import { PLANET_LABELS } from './constants';

export interface RemedyItem {
  id: string;
  title: { en: string; mr: string };
  action: { en: string; mr: string };
  timing: { en: string; mr: string };
  rationale: { en: string; mr: string };
  category: 'devotion' | 'service' | 'lifestyle' | 'charity';
}

export interface PlanetRemedyGuide {
  planet: Planet;
  traditionalFocus: { en: string; mr: string };
  remedies: RemedyItem[];
}

export type ClassicalPlanet = Exclude<Planet, 'Ascendant'>;

export const PLANET_REMEDIES: Record<ClassicalPlanet, PlanetRemedyGuide> = {
  Sun: {
    planet: 'Sun',
    traditionalFocus: {
      en: 'Vitality, leadership, clarity of purpose, self-esteem, and fatherly harmony.',
      mr: 'आत्मविश्वास, शारीरिक ऊर्जा, नेतृत्व, स्पष्ट विचारसरणी आणि वडिलांशी सुसंवाद.',
    },
    remedies: [
      {
        id: 'sun-1',
        title: {
          en: 'Morning Surya Arghya & Sunrise Reflection',
          mr: 'सूर्योपासना व तांब्याच्या पात्रातून अर्घ्य',
        },
        action: {
          en: 'Offer fresh water to the rising sun from a copper or clean cup, facing east with a calm and grateful posture. Stand in early morning sunlight for 5–10 minutes.',
          mr: 'सकाळी पूर्व दिशेकडे तोंड करून तांब्याच्या पात्रातून उगवत्या सूर्याला शुद्ध पाणी अर्पण करा आणि ५ ते १० मिनिटे सकाळच्या कोवळ्या उन्हात शांत उभे राहा.',
        },
        timing: {
          en: 'Every Sunday morning around sunrise (or daily if possible)',
          mr: 'दर रविवारी सूर्योदयाच्या वेळी (किंवा शक्य असल्यास दररोज)',
        },
        rationale: {
          en: 'Traditionally practiced to revitalize solar energy, strengthen mental resolve, and clear lethargy.',
          mr: 'सूर्याच्या ऊर्जेने शरीरातील चैतन्य वाढते, इच्छाशक्ती बळकट होते आणि आळस दूर होण्यास मदत होते.',
        },
        category: 'devotion',
      },
      {
        id: 'sun-2',
        title: {
          en: 'Honor & Harmonious Relations with Father/Elders',
          mr: 'वडील व ज्येष्ठ व्यक्तींचा आदर व आशीर्वाद',
        },
        action: {
          en: 'Spend respectful, attentive time with your father, grandfathers, or fatherly figures. Seek their sincere blessings and avoid harsh arguments.',
          mr: 'वडील, आजोबा किंवा घरातील ज्येष्ठ व्यक्तींशी प्रेमाने व आदराने संवाद साधा. त्यांचे आशीर्वाद घ्या आणि मतभेद सामोपचाराने सोडवा.',
        },
        timing: {
          en: 'Ongoing daily practice, especially on Sundays',
          mr: 'नित्य आचरणात, विशेषतः रविवारी',
        },
        rationale: {
          en: 'The Sun governs the father and ancestral line in Vedic astrology; cordial relations nourish solar vitality.',
          mr: 'ज्योतिषशास्त्रानुसार सूर्य हा पितृकारक ग्रह मानला जातो; वडिलांशी स्नेहपूर्ण संबंध ठेवल्याने सूर्याचे बळ वाढते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'sun-3',
        title: {
          en: 'Mindful Gayatri Contemplation & Whole Wheat Charity',
          mr: 'सूर्य/गायत्री मंत्रजप व गरजू व्यक्तींना अन्नदान',
        },
        action: {
          en: 'Recite "Om Suryaya Namaha" or the Gayatri Mantra 11 times peacefully. Optionally donate whole wheat flour or jaggery (gur) to needy individuals within your means.',
          mr: '"ॐ सूर्याय नमः" किंवा गायत्री मंत्राचा ११ वेळा शांतपणे जप करा. यथाशक्ती गरजू व्यक्तींना गहू किंवा गूळ दान करा.',
        },
        timing: {
          en: 'Sundays during daytime',
          mr: 'रविवारी दिवसाच्या वेळी',
        },
        rationale: {
          en: 'Wheat and jaggery correspond classically to solar harmony, promoting inner warmth and nobility of spirit.',
          mr: 'गहू व गूळ हे सूर्याचे पारंपारिक कारक द्रव्य मानले जातात; या दानाने सात्त्विक ऊर्जा व आत्मबळ वाढते.',
        },
        category: 'charity',
      },
    ],
  },

  Moon: {
    planet: 'Moon',
    traditionalFocus: {
      en: 'Emotional equilibrium, peaceful sleep, intuition, motherly affection, and mental calm.',
      mr: 'मानसिक शांतता, भावनिक संतुलन, शांत झोप, आईचे प्रेम आणि अंतर्ज्ञान.',
    },
    remedies: [
      {
        id: 'moon-1',
        title: {
          en: 'Hydration & Evening Mindful Breathing',
          mr: 'पाणी सेवन व संध्याकालीन ध्यान',
        },
        action: {
          en: 'Drink adequate pure water throughout the day, preferably from a silver or clean earthen vessel. Practice 10 minutes of slow, deep diaphragmatic breathing before sleep.',
          mr: 'दिवसभरात पुरेसे शुद्ध पाणी प्या (शक्य असल्यास चांदीच्या किंवा मातीच्या पात्रातून). रात्री झोपण्यापूर्वी १० मिनिटे संथ व दीर्घ श्वसनाचा सराव करा.',
        },
        timing: {
          en: 'Daily, particularly on Monday evenings',
          mr: 'दररोज, विशेषतः सोमवारी संध्याकाळी',
        },
        rationale: {
          en: 'The Moon governs bodily fluids and the mental realm (Manas); mindful hydration cools emotional turbulence.',
          mr: 'चंद्र हा जलतत्त्व व मनाचा कारक आहे; योग्य जलसेवन आणि शांत ध्यान मनातील अस्वस्थता शांत करते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'moon-2',
        title: {
          en: 'Cherish & Support Your Mother',
          mr: 'आईची सेवा व तिच्याशी संवाद',
        },
        action: {
          en: 'Show genuine gratitude to your mother or maternal caregiver. Touch her feet, prepare something caring for her, and listen attentively to her thoughts.',
          mr: 'आपल्या आईला वेळ द्या, तिच्याशी आपुलकीने बोला आणि तिचे चरणस्पर्श करून आशीर्वाद घ्या. आईला सुख वाटेल अशा छोट्या गोष्टी करा.',
        },
        timing: {
          en: 'Regularly, especially Mondays',
          mr: 'नियमितपणे, विशेषतः सोमवारी',
        },
        rationale: {
          en: 'Vedic tradition considers the mother to be the living embodiment of Chandra; her contentment directly pacifies Moon afflictions.',
          mr: 'वेदांत मातेला चंद्राचे जिवंत रूप मानले गेले आहे; आईच्या समाधानाने पत्रिकेतील चंद्राची पीडा शांत होते.',
        },
        category: 'service',
      },
      {
        id: 'moon-3',
        title: {
          en: 'Chandra Mantra & Offering Water to Thirsty Travelers',
          mr: 'चंद्र मंत्रजप व तहानलेल्यांना जलदान',
        },
        action: {
          en: 'Chant "Om Chandraya Namaha" 11 times. Serve drinking water, milk, or white rice to thirsty birds, animals, or elderly individuals in need.',
          mr: '"ॐ चंद्राय नमः" मंत्राचा ११ वेळा शांतपणे जप करा. तहानलेल्यांना, पांथस्थांना किंवा मुक्या प्राण्यांना पिण्याचे पाणी व दूध द्या.',
        },
        timing: {
          en: 'Monday mornings or evenings under moonlit sky',
          mr: 'सोमवारी सकाळी किंवा संध्याकाळी',
        },
        rationale: {
          en: 'Sharing water and milk is celebrated in traditional Vedic culture as the most soothing remedy for anxiety.',
          mr: 'जल व दुधाचे दान हे मनाला शीतलता व मनःशांती प्रदान करणारा श्रेष्ठ पारंपारिक उपाय मानला जातो.',
        },
        category: 'charity',
      },
    ],
  },

  Mars: {
    planet: 'Mars',
    traditionalFocus: {
      en: 'Healthy physical courage, productive energy, constructive anger management, and sibling harmony.',
      mr: 'शारीरिक ऊर्जा, धैर्य, राग नियंत्रण, भावंडांशी सलोखा आणि योग्य दिशेने पराक्रम.',
    },
    remedies: [
      {
        id: 'mars-1',
        title: {
          en: 'Physical Activity & Channeling Energy Constructively',
          mr: 'नियमित व्यायाम व शारीरिक ऊर्जा संतुलन',
        },
        action: {
          en: 'Engage in 20–30 minutes of intentional physical exercise such as brisk walking, yoga asanas, or strength training to release restless adrenaline.',
          mr: 'दररोज २० ते ३० मिनिटे नियमित व्यायाम, योगासने किंवा चालण्याचा सराव करा, ज्यामुळे शरीरातील अतिरिक्त ऊर्जेला सकारात्मक वाट मिळते.',
        },
        timing: {
          en: 'Daily in the morning, with special dedication on Tuesdays',
          mr: 'दररोज सकाळी, विशेषतः मंगळवारी',
        },
        rationale: {
          en: 'Mars represents biological fire; conscious exertion prevents trapped frustration from turning into conflicts.',
          mr: 'मंगळ हा अग्नितत्त्वाचा ग्रह आहे; शारीरिक व्यायामाने राग, तणाव आणि आक्रमकता नियंत्रणात राहते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'mars-2',
        title: {
          en: 'Hanuman Chalisa & Patient Sibling Communication',
          mr: 'हनुमान चालीसा पठण व भावंडांशी संयमी संवाद',
        },
        action: {
          en: 'Read or listen to the Hanuman Chalisa peacefully. Consciously pause before reacting in disagreements with brothers, sisters, or close peers.',
          mr: 'शांत चित्ताने हनुमान चालीसाचे पठण करा. भावंडे किंवा सहकाऱ्यांशी बोलताना संयम बाळगा आणि तडकाफडकी निर्णय टाळा.',
        },
        timing: {
          en: 'Every Tuesday',
          mr: 'दर मंगळवारी',
        },
        rationale: {
          en: 'Hanuman epitomizes disciplined strength and unwavering devotion, counteracting chaotic Martian impulsiveness.',
          mr: 'हनुमान हे शिस्तबद्ध सामर्थ्य व निस्वार्थ सेवेचे प्रतीक आहेत, ज्यामुळे मंगळाची अनियंत्रित ऊर्जा शांत होते.',
        },
        category: 'devotion',
      },
      {
        id: 'mars-3',
        title: {
          en: 'Red Lentil (Masoor Dal) Charity & Emergency Worker Support',
          mr: 'मसूर डाळ दान व समाजसेवकांप्रति कृतज्ञता',
        },
        action: {
          en: 'Donate raw red lentils (masoor dal) to a community kitchen, or offer words of appreciation or cool refreshments to security personnel and firefighters.',
          mr: 'यथाशक्ती लाल मसूर डाळीचे दान गरजू कुटुंबाला किंवा अन्नछत्राला करा, तसेच सुरक्षा रक्षक किंवा मदतनीसांना पाणी/अन्न द्या.',
        },
        timing: {
          en: 'Tuesday afternoons',
          mr: 'मंगळवारी दुपारच्या वेळी',
        },
        rationale: {
          en: 'Traditional texts associate red grains and guardians of protection with Mars, harmonizing its protective nature.',
          mr: 'मसूर डाळ ही मंगळाचे कारक धान्य मानले जाते; रक्षक व कष्टाळू लोकांप्रति सद्भाव बाळगल्याने मंगळ अनुकूल होतो.',
        },
        category: 'charity',
      },
    ],
  },

  Mercury: {
    planet: 'Mercury',
    traditionalFocus: {
      en: 'Analytical sharpness, clear speech, business wisdom, nervous system balance, and joyful learning.',
      mr: 'बुद्धिमत्ता, संभाषण कौशल्य, व्यापार विवेक, मज्जासंस्थेचे आरोग्य आणि ज्ञानार्जन.',
    },
    remedies: [
      {
        id: 'mercury-1',
        title: {
          en: 'Nature Immersion & Nurturing Green Plants',
          mr: 'हिरव्या वनस्पतींचे संवर्धन व निसर्ग सान्निध्य',
        },
        action: {
          en: 'Water green indoor plants or a Tulsi bush. Spend 15 minutes walking barefoot on green grass or sitting amidst greenery in quiet reflection.',
          mr: 'तुळशीला किंवा घरातील हिरव्या रोपांना पाणी घाला. हिरव्यागार बागेत किंवा गवतावर अनवाणी चाला आणि निसर्गाशी संवाद साधा.',
        },
        timing: {
          en: 'Every Wednesday morning',
          mr: 'दर बुधवारी सकाळी',
        },
        rationale: {
          en: 'Green nature calms overactive mental processing and soothes the nervous system ruled by Mercury.',
          mr: 'हिरवा रंग व निसर्गाचा स्पर्श बुधाच्या अतिसक्रिय बुद्धीला व मज्जासंस्थेला शांत व ताजी ऊर्जा देतो.',
        },
        category: 'lifestyle',
      },
      {
        id: 'mercury-2',
        title: {
          en: 'Reflective Journaling & Truthful, Kind Speech',
          mr: 'दैनंदिन मनोगत लेखन व मधुर वाणीचा संकल्प',
        },
        action: {
          en: 'Maintain a personal journal to clarify thoughts before speaking. Practice speaking honestly without sarcasm, gossip, or hurried exaggerations.',
          mr: 'मनातील विचार कागदावर मांडण्याची सवय ठेवा. कोणाचीही निंदा-नालस्ती न करता शांत, स्पष्ट व सत्य बोलण्याचा प्रयत्न करा.',
        },
        timing: {
          en: 'Daily habit',
          mr: 'दररोजच्या व्यवहारात',
        },
        rationale: {
          en: 'Mercury is the celestial scribe (Vak-Karaka); honoring your words refines Mercury’s intellectual power.',
          mr: 'बुध हा वाणी व लेखनाचा कारक आहे; सत्य आणि गोड बोलण्याने बुधाची बुद्धिमत्ता अधिक प्रगल्भ होते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'mercury-3',
        title: {
          en: 'Budha Mantra & Supporting Underprivileged Students',
          mr: 'बुध मंत्रजप व गरजू विद्यार्थ्यांना शैक्षणिक मदत',
        },
        action: {
          en: 'Recite "Om Budhaya Namaha" 11 times. Donate notebooks, pencils, or green moong dal to school children or educational foundations.',
          mr: '"ॐ बुधाय नमः" मंत्राचा ११ वेळा जप करा. गरीब व गरजू विद्यार्थ्यांना वह्या, पुस्तके किंवा शैक्षणिक साहित्याची मदत करा.',
        },
        timing: {
          en: 'Wednesdays during daytime',
          mr: 'बुधवारी दिवसाच्या वेळी',
        },
        rationale: {
          en: 'Empowering children with education is traditionally considered the highest veneration of Mercury’s gift of learning.',
          mr: 'विद्यादान व विद्यार्थ्यांना मदत करणे हा ज्योतिषशास्त्रात बुधासाठी सर्वांत फलदायी उपाय मानला जातो.',
        },
        category: 'charity',
      },
    ],
  },

  Jupiter: {
    planet: 'Jupiter',
    traditionalFocus: {
      en: 'Wisdom, ethical compass, financial expansion, spiritual teacher connection, and benevolence.',
      mr: 'सद्बुद्धी, नीतिमत्ता, आर्थिक भरभराट, गुरूकृपा आणि आध्यात्मिक प्रगती.',
    },
    remedies: [
      {
        id: 'jupiter-1',
        title: {
          en: 'Gratitude & Respect toward Gurus and Teachers',
          mr: 'गुरू, शिक्षक व ज्येष्ठांप्रति कृतज्ञता',
        },
        action: {
          en: 'Contact or remember your teachers, mentors, or spiritual guides with deep appreciation. Seek their advice and show humility in learning.',
          mr: 'आपल्या शिक्षकांना, गुरूंना किंवा मार्गदर्शकांना वंदन करा, त्यांच्याशी कृतज्ञतापूर्वक संवाद साधा आणि त्यांच्या अनुभवातून शिका.',
        },
        timing: {
          en: 'Every Thursday',
          mr: 'दर गुरुवारी',
        },
        rationale: {
          en: 'Jupiter is the Guru (the dispeller of darkness); reverence toward living teachers invites Jupiterian grace and moral clarity.',
          mr: 'गुरू हा ज्ञानाचा कारक आहे; शिक्षकांचा आदर केल्याने बुद्धीला सात्त्विक दिशा आणि दैवी मार्गदर्शन लाभते.',
        },
        category: 'service',
      },
      {
        id: 'jupiter-2',
        title: {
          en: 'Reading Philosophical Literature & Ethical Reflection',
          mr: 'सद्ग्रंथ वाचन व नैतिक चिंतन',
        },
        action: {
          en: 'Dedicate 15 minutes to reading uplifting ethical or spiritual literature (such as Bhagavad Gita, Upanishadic reflections, or philosophical essays).',
          mr: 'दररोज किंवा गुरुवारी भगवद्गीता, संतांचे विचार किंवा आध्यात्मिक साहित्याचे शांतपणे वाचन करून आत्मचिंतन करा.',
        },
        timing: {
          en: 'Thursday mornings or evenings',
          mr: 'गुरुवारी सकाळी अथवा संध्याकाळी',
        },
        rationale: {
          en: 'Immersing the mind in universal truths expands the intellect beyond mundane pettiness, aligning with Jupiter’s vastness.',
          mr: 'सत्संग व सद्ग्रंथ वाचनाने मनाची क्षितिजे विस्तारतात आणि जीवनात योग्य निर्णय घेण्याची क्षमता वाढते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'jupiter-3',
        title: {
          en: 'Guru Mantra & Yellow Food/Gram Dal Charity',
          mr: 'बृहस्पती मंत्र व चणा डाळ/हळदीचे दान',
        },
        action: {
          en: 'Chant "Om Gurave Namaha" 11 times calmly. Donate yellow lentils (chana dal), bananas, or turmeric powder to a charitable kitchen or temple.',
          mr: '"ॐ गुरवे नमः" किंवा "ॐ बृहस्पतये नमः" चा ११ वेळा जप करा. चणा डाळ, केळी किंवा हळद गरजूंना अथवा अन्नछत्रात दान करा.',
        },
        timing: {
          en: 'Thursdays before sunset',
          mr: 'गुरुवारी सूर्यास्तापूर्वी',
        },
        rationale: {
          en: 'Yellow grains and turmeric embody Jupiter’s expansive warmth, dispelling pessimism and fostering abundance.',
          mr: 'पिवळा रंग व चणा डाळ गुरू ग्रहाचे कारक द्रव्य आहेत; यामुळे पत्रिकेतील गुरू बलवान होऊन आर्थिक व कौटुंबिक समृद्धी येते.',
        },
        category: 'charity',
      },
    ],
  },

  Venus: {
    planet: 'Venus',
    traditionalFocus: {
      en: 'Healthy partnerships, appreciation of beauty, personal hygiene, artistic expression, and graceful wealth.',
      mr: 'सुखी वैवाहिक जीवन, कला व सौंदर्य प्रेम, स्वच्छता आणि सुसंस्कृत समृद्धी.',
    },
    remedies: [
      {
        id: 'venus-1',
        title: {
          en: 'Clean Living Spaces & Personal Grooming',
          mr: 'स्वच्छता, टापटीप व सुगंधी वातावरण',
        },
        action: {
          en: 'Keep your living space, wardrobe, and desk clean, orderly, and pleasantly fragrant. Wear tidy, comfortable clothes that inspire self-respect.',
          mr: 'आपले घर, कामाची जागा व कपडे नेहमी स्वच्छ, नीटनेटके व सुगंधी ठेवा. स्वतःच्या आरोग्याची व व्यक्तिमत्त्वाची काळजी घ्या.',
        },
        timing: {
          en: 'Daily routine, especially on Fridays',
          mr: 'दररोज, विशेषतः शुक्रवारी',
        },
        rationale: {
          en: 'Venus represents refinement and harmony; outer beauty and order nurture inner contentment and relational warmth.',
          mr: 'शुक्र हा सौंदर्य, स्वच्छता व कलेचा कारक आहे; घरात व मनात स्वच्छता राखल्याने शुक्राचा शुभ प्रभाव वाढतो.',
        },
        category: 'lifestyle',
      },
      {
        id: 'venus-2',
        title: {
          en: 'Deep Respect for Partner & Women in Your Life',
          mr: 'जीवनसाथी व स्त्रियांचा मनापासून आदर',
        },
        action: {
          en: 'Express genuine love and appreciation to your spouse or partner. Treat all women—colleagues, family, service workers—with dignity and kindness.',
          mr: 'आपल्या जोडीदाराशी प्रेमाने वागा व त्यांचे कौतुक करा. घरातील व बाहेरील सर्व स्त्रियांचा मनापासून सन्मान करा.',
        },
        timing: {
          en: 'Continuous daily habit',
          mr: 'नित्य आचरणात',
        },
        rationale: {
          en: 'Venus is the karaka of marital joy and womanhood in Vedic thought; honoring feminine energy invites relational peace.',
          mr: 'शुक्र हा वैवाहिक सौख्याचा व स्त्री शक्तीचा कारक आहे; स्त्रियांचा आदर केल्याने कौटुंबिक सौख्य व आनंद वृद्धिंगत होतो.',
        },
        category: 'service',
      },
      {
        id: 'venus-3',
        title: {
          en: 'Shukra Mantra & Donating White Grains / Milk Products',
          mr: 'शुक्र मंत्रजप व तांदूळ/साखरेचे दान',
        },
        action: {
          en: 'Recite "Om Shukraya Namaha" 11 times peacefully. Donate white items such as raw rice, sugar, milk, or white clothes to individuals in need.',
          mr: '"ॐ शुक्राय नमः" मंत्राचा ११ वेळा शांतपणे जप करा. गरजू व्यक्तींना तांदूळ, साखर, दूध किंवा पांढऱ्या वस्त्रांचे दान करा.',
        },
        timing: {
          en: 'Friday mornings',
          mr: 'शुक्रवारी सकाळी',
        },
        rationale: {
          en: 'White grains and milk are classical offerings for Venus, believed to soothe emotional discontent and balance passions.',
          mr: 'पांढरे धान्य व दुग्धजन्य पदार्थ शुक्राशी संबंधित असून, यामुळे मनातील असंतोष कमी होऊन समाधान लाभते.',
        },
        category: 'charity',
      },
    ],
  },

  Saturn: {
    planet: 'Saturn',
    traditionalFocus: {
      en: 'Patience, disciplined consistency, service to the underprivileged, humility, and karmic resilience.',
      mr: 'संयम, कठीण परिश्रम, कामगार व दुर्बल घटकांची सेवा, नम्रता आणि संकटांशी सामना करण्याचे धैर्य.',
    },
    remedies: [
      {
        id: 'saturn-1',
        title: {
          en: 'Compassionate Service to Laborers & the Elderly',
          mr: 'कामगार, वृद्ध व दुर्बल घटकांची प्रत्यक्ष सेवा',
        },
        action: {
          en: 'Offer respectful, tangible help to sanitation workers, daily wage laborers, domestic helpers, or disabled elderly people. Provide fair wages and a warm meal.',
          mr: 'कष्टकरी, कामगार, सफाई कर्मचारी किंवा वृद्ध व्यक्तींना आदराने मदत करा. त्यांना योग्य मोबदला द्या आणि आवश्यकतेनुसार जेवण किंवा चहा द्या.',
        },
        timing: {
          en: 'Every Saturday',
          mr: 'दर शनिवारी',
        },
        rationale: {
          en: 'Saturn represents the hardworking lower-income classes; selfless kindness to those who toil without voice deeply pleases Shani.',
          mr: 'शनी हा कष्टकरी जनतेचा प्रतिनिधी आहे; श्रमिकांना व असहाय लोकांना मदत केल्याने शनीचे कडक परिणाम सौम्य होतात.',
        },
        category: 'service',
      },
      {
        id: 'saturn-2',
        title: {
          en: 'Consistent Daily Routine & Practical Patience',
          mr: 'नियमित दिनचर्या, सचोटी व संयमी वृत्ती',
        },
        action: {
          en: 'Wake up and sleep at predictable hours. Fulfill duties without procrastination or complaining, and cultivate patience through unavoidable delays.',
          mr: 'वेळेवर झोपणे व उठण्याची शिस्त पाळा. आपली कामे वेळेवर पूर्ण करा आणि कोणत्याही कामात आळस किंवा फसवणूक करू नका.',
        },
        timing: {
          en: 'Daily lifestyle',
          mr: 'दररोजच्या आचरणात',
        },
        rationale: {
          en: 'Saturn is the cosmic timekeeper (Maha-Kaal); submitting willingly to discipline removes the painful friction of forced lessons.',
          mr: 'शनी हा शिस्त आणि वेळेचा कारक आहे; स्वतःहून शिस्त पाळल्यास शनीची कठोर परीक्षा सोपी होते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'saturn-3',
        title: {
          en: 'Shani Mantra & Black Sesame / Mustard Oil Donation',
          mr: 'शनी मंत्रजप व काळे तीळ/मोहरीच्या तेलाचे दान',
        },
        action: {
          en: 'Chant "Om Sham Shanicharaya Namaha" 11 times. Feed stray black dogs or crows, or donate sesame oil/blankets to homeless shelters on Saturdays.',
          mr: '"ॐ शं शनैश्चराय नमः" मंत्राचा ११ वेळा शांतपणे जप करा. कावळ्यांना किंवा भटक्या कुत्र्यांना अन्न द्या, तसेच गरजूंना उबदार कपडे किंवा तेलाचे दान करा.',
        },
        timing: {
          en: 'Saturday evenings after sunset',
          mr: 'शनिवारी सूर्यास्तानंतर',
        },
        rationale: {
          en: 'Dark sesame and oil represent Saturnian grounding; sharing these eases heavy karmic pressure.',
          mr: 'काळे तीळ, तेल आणि कावळ्याला अन्न देणे हे शनीच्या दुष्प्रभावातून मुक्ती देणारे श्रेष्ठ उपाय मानले जातात.',
        },
        category: 'charity',
      },
    ],
  },

  Rahu: {
    planet: 'Rahu',
    traditionalFocus: {
      en: 'Mental clarity, overcoming obsessions, freedom from illusions, and healthy digital boundaries.',
      mr: 'मानसिक स्पष्टता, व्यसनांपासून मुक्ती, भ्रमाचा निरास आणि डिजिटल साधनांचा समतोल वापर.',
    },
    remedies: [
      {
        id: 'rahu-1',
        title: {
          en: 'Digital Detox & Evening Mental Stillness',
          mr: 'डिजिटल डिटॉक्स व संध्याकाळी शांत मनःस्थिती',
        },
        action: {
          en: 'Turn off screens, social media feeds, and sensational news at least 45 minutes before sleep. Spend that time in silent reading or quiet reflection.',
          mr: 'झोपण्यापूर्वी किमान ४५ मिनिटे मोबाईल, टीव्ही आणि सोशल मीडिया बंद ठेवा. त्या वेळेत शांत बसा, हलके संगीत ऐका किंवा शांत ध्यान करा.',
        },
        timing: {
          en: 'Every evening, particularly Wednesdays and Saturdays',
          mr: 'दररोज संध्याकाळी, विशेषतः बुधवारी व शनिवारी',
        },
        rationale: {
          en: 'Rahu rules illusion, screens, and overstimulation; unplugging shields the psyche from scattered restlessness.',
          mr: 'राहू हा आभासी जग, अतिविचार व व्यग्रतेचा कारक आहे; स्क्रीनपासून दूर राहिल्याने मानसिक शांतता व एकाग्रता मिळते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'rahu-2',
        title: {
          en: 'Care for Stray Animals & Sanitation Workers',
          mr: 'मुक्या प्राण्यांची काळजी व सफाई कामगारांचा सन्मान',
        },
        action: {
          en: 'Feed stray street dogs and birds with healthy food. Treat sanitation workers with profound respect and tip them generously.',
          mr: 'रस्त्यावरील भटक्या जनावरांना, पक्षांना अन्न-पाणी द्या. स्वच्छता कामगारांना आदरपूर्वक वागणूक द्या आणि त्यांना मदत करा.',
        },
        timing: {
          en: 'Weekly on Saturdays or Wednesdays',
          mr: 'आठवड्यातून एकदा, विशेषतः शनिवारी किंवा बुधवारी',
        },
        rationale: {
          en: 'Rahu corresponds to unconventional and marginalized beings; caring for them transforms chaotic Rahu energy into protective blessings.',
          mr: 'दुर्लक्षित घटक व मुक्या प्राण्यांची सेवा केल्याने राहूची नकारात्मक ऊर्जा सकारात्मक आशीर्वादात बदलते.',
        },
        category: 'service',
      },
      {
        id: 'rahu-3',
        title: {
          en: 'Rahu Mantra & Coconut / Barley Flour Offering',
          mr: 'राहू मंत्रजप व नारळ/जवस दान',
        },
        action: {
          en: 'Chant "Om Rahave Namaha" 11 times calmly. In traditional practice, float a dry whole coconut in running water or donate barley to animal shelters.',
          mr: '"ॐ राहवे नमः" मंत्राचा ११ वेळा शांतपणे जप करा. पारंपारिक प्रथेनुसार वाहत्या पाण्यात नारळ अर्पण करा किंवा मुक्या जनावरांसाठी जवस/धान्य दान करा.',
        },
        timing: {
          en: 'Saturday evenings around dusk',
          mr: 'शनिवारी संध्याकाळी संधिप्रकाशात',
        },
        rationale: {
          en: 'Coconuts and barley absorb and pacify the smoky, erratic vibrations associated with the North Node.',
          mr: 'नारळ व जव हे राहूचे कारक मानले जातात; यामुळे राहूचा भ्रम व अचानक येणाऱ्या अडचणी शांत होतात.',
        },
        category: 'devotion',
      },
    ],
  },

  Ketu: {
    planet: 'Ketu',
    traditionalFocus: {
      en: 'Spiritual detachment, deep meditation, intuition, release of past baggage, and inner peace.',
      mr: 'अध्यात्म, अंतर्ज्ञान, विरक्ती, पूर्वग्रहांपासून मुक्ती आणि आंतरिक शांती.',
    },
    remedies: [
      {
        id: 'ketu-1',
        title: {
          en: 'Silent Meditation & Breath Awareness (Pranayama)',
          mr: 'शांत ध्यान व प्राणायाम साधना',
        },
        action: {
          en: 'Sit in complete silence for 15 minutes daily. Focus on the breath at the tip of the nostrils or cultivate awareness of inner silence.',
          mr: 'दररोज १५ मिनिटे पूर्ण शांततेत बसा. नासिकाग्रावर लक्ष केंद्रित करून संथ श्वासोच्छ्वासाचे निरीक्षण करा किंवा विपश्यना करा.',
        },
        timing: {
          en: 'Early morning at dawn or before sleep',
          mr: 'सकाळी ब्राह्ममुहूर्तावर किंवा रात्री झोपण्यापूर्वी',
        },
        rationale: {
          en: 'Ketu is the planet of Moksha (liberation); silent meditation directly aligns with its deepest spiritual desire.',
          mr: 'केतू हा मोक्ष व आत्मज्ञानाचा कारक आहे; शांत ध्यानसाधनेने केतूची ऊर्जा आत्मिक शांतीकडे वळते.',
        },
        category: 'lifestyle',
      },
      {
        id: 'ketu-2',
        title: {
          en: 'Compassion towards Stray Street Dogs',
          mr: 'भटक्या श्वानांना पोळी/अन्न देणे',
        },
        action: {
          en: 'Feed street dogs with whole wheat rotis, bread, or dog food. Protect them from harsh weather and never kick or mistreat them.',
          mr: 'रस्त्यावरील मुक्या कुत्र्यांना प्रेमाने पोळी किंवा बिस्किटे खायला द्या. त्यांना त्रास न देता त्यांच्यावर दया दाखवा.',
        },
        timing: {
          en: 'Tuesdays or Sundays',
          mr: 'मंगळवारी किंवा रविवारी',
        },
        rationale: {
          en: 'In Vedic folklore, dogs are sacred to Lord Bhairava and embody the protective, loyal dimension of Ketu.',
          mr: 'श्वान हे भैरवाचे वाहन मानले जाते; श्वानांची सेवा केल्याने केतूचा अशुभ प्रभाव शांत होऊन मानसिक निर्भयता येते.',
        },
        category: 'service',
      },
      {
        id: 'ketu-3',
        title: {
          en: 'Ketu Mantra & Donating Multi-Colored Blankets to the Poor',
          mr: 'केतू मंत्रजप व गरजूंना कांबळे/उबदार वस्त्र दान',
        },
        action: {
          en: 'Recite "Om Ketave Namaha" 11 times. Donate a warm, multi-colored blanket (or seasonal clothing) to someone sleeping without shelter.',
          mr: '"ॐ केतवे नमः" मंत्राचा ११ वेळा शांतपणे जप करा. बेघर, गरजू व्यक्तींना बहुरंगी कांबळे किंवा गरम कपडे दान करा.',
        },
        timing: {
          en: 'Tuesday mornings or Thursday evenings',
          mr: 'मंगळवारी सकाळी किंवा गुरुवारी संध्याकाळी',
        },
        rationale: {
          en: 'Sheltering the cold-affected aligns with Ketu’s ascetic nature, transforming spiritual alienation into active empathy.',
          mr: 'थंडीत कुडकुडणाऱ्या गरजूंना वस्त्रदान केल्याने केतूचे दोष नाहीसे होऊन आत्मिक समाधान लाभते.',
        },
        category: 'charity',
      },
    ],
  },
};

// ─── Classification Logic ───────────────────────────────────────────────────

export type RemedyCategoryType = 'attention' | 'support' | 'none';

/**
 * Reuses the existing Planet Analysis without modifying any core astrology engine logic.
 * Returns:
 * - 'attention': Challenging / Weak planets (needing active attention)
 * - 'support': Moderate / Mixed planets (needing gentle support)
 * - 'none': Strong & Supportive planets (no remedy recommended by default)
 */
export function classifyRemedyStatus(analysis: PlanetAnalysis): RemedyCategoryType {
  const { strengthLevel, isDebilitated, isCombust, isAfflicted, functionalNature, position } = analysis;

  // 1. Challenging / Weak -> Needs Attention
  if (
    isDebilitated ||
    isCombust ||
    strengthLevel === 'Weak' ||
    (isAfflicted && strengthLevel !== 'Strong')
  ) {
    return 'attention';
  }

  // 2. Moderate / Mixed -> Needs Support
  if (
    strengthLevel === 'Moderate' ||
    (isAfflicted && strengthLevel === 'Strong') ||
    functionalNature === 'Malefic' ||
    position.dignity === 'Enemy' ||
    position.dignity === 'GreatEnemy'
  ) {
    return 'support';
  }

  // 3. Clearly Strong & Supportive -> None
  return 'none';
}

/**
 * Generates 1–3 simple, compassionate, non-frightening sentences explaining
 * WHY this planet is classified under pressure, using the chart's actual data.
 */
export function getWhyExplanation(analysis: PlanetAnalysis, lang: string = 'en'): string {
  const isMr = lang === 'mr';
  const { position, isDebilitated, isCombust, isRetrograde, isAfflicted, strengthLevel, functionalNature } = analysis;
  const pName = isMr
    ? (PLANET_LABELS[analysis.planet]?.sanskrit || analysis.planet)
    : PLANET_LABELS[analysis.planet]?.english;

  const reasons: string[] = [];

  // Dusthana houses
  if ([6, 8, 12].includes(position.house)) {
    if (isMr) {
      reasons.push(`${pName} हा भाव ${position.house} मध्ये स्थित असल्याने त्याच्या नैसर्गिक अभिव्यक्तीवर काहीसा ताण येतो.`);
    } else {
      reasons.push(`${pName} is located in House ${position.house}, which places extra pressure on its natural expression.`);
    }
  } else {
    if (isMr) {
      reasons.push(`${pName} सध्या तुमच्या पत्रिकेत भाव ${position.house} मध्ये स्थित आहे.`);
    } else {
      reasons.push(`${pName} is situated in House ${position.house} of your chart.`);
    }
  }

  // Dignity / Combust / Affliction
  if (isDebilitated) {
    if (isMr) {
      reasons.push(`हा ग्रह नीच राशीत असल्याने त्याचे फळ मिळण्यासाठी अधिक परिश्रम व संयमाची गरज भासते.`);
    } else {
      reasons.push(`Being in its debilitated sign, it requires conscious patience and steady effort to express its strengths.`);
    }
  } else if (isCombust) {
    if (isMr) {
      reasons.push(`सूर्याच्या अगदी जवळ असल्याने हा ग्रह अस्त झाला असून त्याचे स्वतंत्र बळ काहीसे झाकोळले गेले आहे.`);
    } else {
      reasons.push(`Being very close to the Sun (combust), its independent strength is somewhat dimmed in this chart.`);
    }
  } else if (position.dignity === 'Enemy' || position.dignity === 'GreatEnemy') {
    if (isMr) {
      reasons.push(`हा ग्रह अनुकूल नसलेल्या राशीत असल्याने त्याला कार्य करताना काहीसा संघर्ष जाणवतो.`);
    } else {
      reasons.push(`It sits in an unfriendly sign environment, which can make its results less consistent.`);
    }
  }

  // Afflicted or Weak
  if (isAfflicted) {
    if (isMr) {
      reasons.push(`इतर ग्रहांच्या कडक प्रभावामुळे या जीवनक्षेत्रात शांत व सकारात्मक दृष्टिकोन ठेवणे लाभदायक ठरेल.`);
    } else {
      reasons.push(`It receives challenging influences from other planets, making regular mindful habits particularly helpful.`);
    }
  } else if (strengthLevel === 'Weak') {
    if (isMr) {
      reasons.push(`एकूण ग्रहबळ पाहता हा ग्रह काहीसा कमजोर असून पारंपरिक उपायांद्वारे त्याला पोषक बळ देता येते.`);
    } else {
      reasons.push(`Its overall strength score is on the lower side, so traditional practices can provide gentle support.`);
    }
  } else if (functionalNature === 'Malefic') {
    if (isMr) {
      reasons.push(`या लग्नासाठी त्याची भूमिका काहीशी आव्हानात्मक असल्याने शिस्त व संयम राखणे उपयुक्त ठरते.`);
    } else {
      reasons.push(`Its functional role for your rising sign brings occasional tests that respond well to disciplined routines.`);
    }
  }

  if (isRetrograde) {
    if (isMr) {
      reasons.push(`हा ग्रह वक्री असल्याने याचे परिणाम अधिक अंतर्मुख व सखोल विचार करायला लावणारे असू शकतात.`);
    } else {
      reasons.push(`Because it is retrograde, its influence tends to be more internalized and karma-oriented.`);
    }
  }

  return reasons.slice(0, 3).join(' ');
}
