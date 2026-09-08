// ============================================================
//  VARGA INTERPRETATION ENGINE
//  Layer 2: Astrological interpretation & narrative generator
//  Pure logic, zero UI dependencies.
//
//  Converts raw DivisionalChart mathematical positions into
//  context-aware, balanced, plain-language life insights
//  following Parashari principles in English and Marathi.
// ============================================================

import type { DivisionalChart, DivisionalPlanet, VargaDivision } from './varga';
import type { Planet, Sign, Dignity } from './models';
import { RASHIS } from './constants';
import type { Language } from '../translations';
import { getTranslation } from '../translations';

export interface VargaObservation {
  title: string;
  explanation: string;
  why: string;
  technicalDetail: string;
}

export interface VargaPlanetInsight {
  planet: Planet;
  placement: string;
  role: string;
  positive: string;
  challenge: string;
  technical: string;
}

export type VargaOverallTone = 'Supportive' | 'Mixed' | 'Challenging';

export interface VargaInterpretation {
  division: VargaDivision;
  code: string;
  name: string;
  about: string;
  overallTone: VargaOverallTone;
  toneExplanation: string;
  takeaway: string;
  standout: VargaObservation[];
  positives: VargaObservation[];
  watchOuts: VargaObservation[];
  planetInsights: VargaPlanetInsight[];
}

// ─── Thematic Metadata for Each Varga ─────────────────────────────────────────

interface VargaThemeConfig {
  aboutEn: string;
  aboutMr: string;
  keyHouses: number[];
  primaryKarakas: Planet[];
  focusAreaNameEn: string;
  focusAreaNameMr: string;
  lagnaSignFocusEn: (sign: Sign, element: string) => string;
  lagnaSignFocusMr: (signMr: string, elementMr: string, elementRaw: string) => string;
}

const VARGA_THEMES: Record<VargaDivision, VargaThemeConfig> = {
  1: {
    aboutEn: 'The D1 (Rashi) chart represents the foundation of your life — your physical vitality, general mindset, core personality, and overall life direction.',
    aboutMr: 'D1 (राशी) कुंडली तुमच्या संपूर्ण जीवनाचा पाया दर्शवते — तुमची शारीरिक ऊर्जा, मानसिक दृष्टिकोन, मूळ स्वभाव आणि आयुष्याची प्रमुख दिशा.',
    keyHouses: [1, 5, 9, 10],
    primaryKarakas: ['Sun', 'Moon'],
    focusAreaNameEn: 'overall life path and vitality',
    focusAreaNameMr: 'एकूण जीवनमार्ग आणि शारीरिक व मानसिक ऊर्जा',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna gives your general life approach an element of ${el === 'Fire' ? 'bold initiative, confidence and clear direction' : el === 'Earth' ? 'practical stability, persistence and grounded values' : el === 'Air' ? 'curiosity, mental versatility and communicative ease' : 'emotional depth, intuitive empathy and adaptability'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `${signMr} (${elMr}) लग्नामुळे तुमच्या जीवन दृष्टिकोनात ${el === 'Fire' ? 'उत्साह, आत्मविश्वास व पुढाकार घेण्याची वृत्ती' : el === 'Earth' ? 'व्यावहारिक स्थैर्य, चिकाटी व संयम' : el === 'Air' ? 'जिज्ञासा, कल्पकता व संवाद कौशल्य' : 'भावनिक समजूतदारपणा, संवेदनशीलता व लवचिकता'} प्रामुख्याने दिसून येते.`,
  },
  2: {
    aboutEn: 'The D2 (Hora) chart traditionally evaluates wealth generation, savings tendencies, material security, and the psychological attitude toward money and assets.',
    aboutMr: 'D2 (होरा) कुंडली पारंपरिकरीत्या संपत्ती संचय, बचत प्रवृत्ती, आर्थिक सुरक्षितता आणि पैशांकडे पाहण्याचा दृष्टिकोन दर्शवते.',
    keyHouses: [2, 11, 1],
    primaryKarakas: ['Jupiter', 'Mercury', 'Venus'],
    focusAreaNameEn: 'wealth, earnings, and financial habits',
    focusAreaNameMr: 'संपत्ती, कमाई आणि आर्थिक सवयी',
    lagnaSignFocusEn: (sign) => sign === 'Leo' 
      ? 'A solar Lagna in Hora signifies self-earned resources, ambition, direct effort, and taking charge of financial avenues.'
      : 'A lunar Lagna in Hora highlights wealth preservation, intuitive money management, family support, and steady resource retention.',
    lagnaSignFocusMr: (sign) => sign === 'Leo'
      ? 'होरा कुंडलीत सूर्य लग्न असल्याने स्वतःच्या परिश्रमाने संपत्ती निर्माण करणे, महत्त्वाकांक्षा आणि आर्थिक बाबतीत पुढाकार घेणे दिसून येते.'
      : 'होरा कुंडलीत चंद्र लग्न असल्याने संपत्तीची जपणूक, विचारपूर्वक गुंतवणूक, कुटुंबाचा आधार आणि स्थिर आर्थिक वाढ दर्शवते.',
  },
  3: {
    aboutEn: 'The D3 (Drekkana) chart is traditionally studied for courage, physical stamina, relationship with brothers and sisters, and the willpower to take bold initiatives.',
    aboutMr: 'D3 (द्रेष्काण) कुंडली धाडस, शारीरिक ऊर्जा, बंधू-भगिनींशी नातेसंबंध आणि नवीन उपक्रम सुरू करण्याची इच्छाशक्ती दर्शवते.',
    keyHouses: [3, 11, 1],
    primaryKarakas: ['Mars', 'Mercury'],
    focusAreaNameEn: 'courage, personal initiative, and sibling bonds',
    focusAreaNameMr: 'धाडस, वैयक्तिक पुढाकार आणि बंधू-भगिनींचे संबंध',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Ascendant in Drekkana shapes your drive, encouraging ${el === 'Fire' ? 'fearless action and spontaneous leadership' : el === 'Earth' ? 'disciplined persistence and methodical execution' : el === 'Air' ? 'clever communication, collaboration and varied interests' : 'protective courage guided by gut instinct and care'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `द्रेष्काण कुंडलीत ${signMr} (${elMr}) लग्न असल्यामुळे तुमची कार्यशक्ती ${el === 'Fire' ? 'निर्भय कृती आणि उत्स्फूर्त नेतृत्व' : el === 'Earth' ? 'शिस्तबद्ध चिकाटी आणि पद्धतशीर अंमलबजावणी' : el === 'Air' ? 'उत्तम संभाषण, सहकार्य आणि बहुआयामी स्वारस्य' : 'अंतःप्रेरणेने घेतलेले धाडस व काळजीवाहू वृत्ती'} या दिशेने कार्य करते.`,
  },
  4: {
    aboutEn: 'The D4 (Chaturthamsha) chart reveals domestic security, real estate, physical home environment, vehicular comforts, and internal emotional peace.',
    aboutMr: 'D4 (चतुर्थांश) कुंडली कौटुंबिक सौख्य, घर-जमीन, स्थावर मालमत्ता, वाहन सुख आणि मनाची अंतर्गत शांती दर्शवते.',
    keyHouses: [4, 1, 9],
    primaryKarakas: ['Moon', 'Venus', 'Mars'],
    focusAreaNameEn: 'home, property, and personal foundation',
    focusAreaNameMr: 'घर, संपत्ती आणि कौटुंबिक सौख्य',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Chaturthamsha suggests that your domestic comfort thrives through ${el === 'Earth' ? 'stable land, enduring property, and a quiet physical sanctuary' : el === 'Water' ? 'emotional harmony, closeness with family, and a nurturing atmosphere' : el === 'Air' ? 'a spacious, intellectually stimulating, and open home environment' : 'an inspiring, warm, and energetically uplifting domestic space'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `चतुर्थांश कुंडलीत ${signMr} (${elMr}) लग्न सूचित करते की तुमचे कौटुंबिक सुख ${el === 'Earth' ? 'स्थिर मालमत्ता, स्वतःचे घर आणि शांत वातावरण' : el === 'Water' ? 'नातेसंबंधातील आपुलकी, कौटुंबिक जिव्हाळा आणि सुसंवाद' : el === 'Air' ? 'मोकळे, वैचारिक देवाणघेवाणीस पोषक आणि प्रसन्न घर' : 'उत्साही, प्रेरणादायी आणि आनंदी कौटुंबिक वातावरण'} यातून वृद्धिंगत होते.`,
  },
  5: {
    aboutEn: 'The D5 (Panchamsha) chart reflects higher creative intelligence, spiritual devotion (Upasana), artistic ingenuity, and past-life earned merit (Purva Punya).',
    aboutMr: 'D5 (पंचमांश) कुंडली उच्च बौद्धिक प्रतिभा, आध्यात्मिक उपासना, कलात्मक कौशल्य आणि पूर्वजन्मातील संचित पुण्य दर्शवते.',
    keyHouses: [5, 9, 1],
    primaryKarakas: ['Jupiter', 'Mercury', 'Sun'],
    focusAreaNameEn: 'creative intellect, inspiration, and spiritual talent',
    focusAreaNameMr: 'सर्जनशील बुद्धिमत्ता, आध्यात्मिक ओढ आणि विशेष कलागुण',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Panchamsha points toward creative expression rooted in ${el === 'Fire' ? 'dynamic vision, inspiring leadership, and expressive brilliance' : el === 'Air' ? 'original concepts, intellectual synthesis, and inventive ideas' : el === 'Water' ? 'poetic intuition, deep empathy, and soulful artistic creations' : 'careful craft, structured intellect, and functional beauty'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `पंचमांश कुंडलीत ${signMr} (${elMr}) लग्न तुमची बुद्धिमत्ता व प्रतिभा ${el === 'Fire' ? 'दूरगामी दृष्टिकोन, तेजस्वी नेतृत्व व प्रभावी अभिव्यक्ती' : el === 'Air' ? 'नवीन संकल्पना, विश्लेषणात्मक विचार व कल्पक कल्पना' : el === 'Water' ? 'भावनिक संवेदनशीलता, गूढ समज व कलात्मक निर्मिती' : 'पद्धतशीर अभ्यास, कौशल्य व व्यावहारिक उपयोगिता'} याद्वारे व्यक्त होण्यास अनुकूल करते.`,
  },
  6: {
    aboutEn: 'The D6 (Shashthamsha) chart provides guidance on overcoming difficulties, managing physical health and digestion, dealing with debts, and handling competitive pressures.',
    aboutMr: 'D6 (षष्ठांश) कुंडली अडचणींवर मात करण्याची क्षमता, आरोग्य व्यवस्थापन, स्पर्धात्मक जिद्द आणि दैनंदिन सेवाभाव दर्शवते.',
    keyHouses: [6, 1, 10],
    primaryKarakas: ['Mars', 'Saturn', 'Mercury'],
    focusAreaNameEn: 'resilience, health management, and handling obstacles',
    focusAreaNameMr: 'आरोग्य व्यवस्थापन, प्रतिकारशक्ती आणि संकटांवर मात',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Shashthamsha indicates that you handle life’s obstacles best through ${el === 'Fire' ? 'direct action, courage, and facing problems head-on' : el === 'Earth' ? 'methodical routine, dietary consistency, and realistic problem-solving' : el === 'Air' ? 'negotiation, strategic analysis, and clear mental detachment' : 'restorative self-care, emotional boundary-setting, and patience'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `षष्ठांश कुंडलीत ${signMr} (${elMr}) लग्न दर्शवते की तुम्ही जीवनातील आव्हानांना ${el === 'Fire' ? 'थेट धैर्याने व संकटांचा थेट सामना करून' : el === 'Earth' ? 'नियमित दिनचर्या, आहार नियोजन व व्यावहारिक उपायांनी' : el === 'Air' ? 'रणनीती, संवाद व शांत विचारसरणीने' : 'संयम, मानसिक शांती व आरोग्य संवर्धनाने'} यशस्वीरीत्या सामोरे जाता.`,
  },
  7: {
    aboutEn: 'The D7 (Saptamsha) chart is traditionally consulted regarding children, creative offspring, the happiness derived from progeny, and the ongoing legacy you nurture.',
    aboutMr: 'D7 (सप्तांश) कुंडली संतती सुख, मुलांचे संगोपन, सर्जनशीलता आणि तुमच्या जीवन कार्याचा भावी वारसा दर्शवते.',
    keyHouses: [5, 7, 9],
    primaryKarakas: ['Jupiter', 'Venus'],
    focusAreaNameEn: 'children, progeny happiness, and creative legacy',
    focusAreaNameMr: 'संतती सुख, मुलांचे संगोपन आणि भावी वारसा',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Saptamsha suggests a parenting and mentoring style characterized by ${el === 'Water' ? 'deep emotional devotion, gentleness, and protective care' : el === 'Fire' ? 'encouraging independence, active encouragement, and strong principles' : el === 'Air' ? 'open dialogue, intellectual curiosity, and friendly mentorship' : 'providing steady grounding, reliable values, and practical habits'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `सप्तांश कुंडलीत ${signMr} (${elMr}) लग्न सूचित करते की मुलांचे संगोपन व मार्गदर्शन करताना ${el === 'Water' ? 'मायेची ऊब, भावनिक जपणूक व प्रेमळ काळजी' : el === 'Fire' ? 'स्वावलंबन, स्वाभिमान व तत्त्वनिष्ठ आचार' : el === 'Air' ? 'मोकळा संवाद, वैचारिक स्वातंत्र्य व मित्रत्वाचे नाते' : 'सुसंस्कार, व्यावहारिक शिस्त व भक्कम कौटुंबिक आधार'} अधिक प्रभावी ठरतात.`,
  },
  8: {
    aboutEn: 'The D8 (Ashtamsha) chart sheds light on longevity, unexpected turns of events, transformation through life crises, deep research, and psychological resilience.',
    aboutMr: 'D8 (अष्टांश) कुंडली दीर्घायुष्य, अकस्मात घडणारे बदल, संकटातून शिकून होणारे स्थित्यंतर आणि मानसिक कणखरता दर्शवते.',
    keyHouses: [8, 1, 9],
    primaryKarakas: ['Saturn', 'Mars', 'Ketu'],
    focusAreaNameEn: 'transformation, sudden events, and psychological resilience',
    focusAreaNameMr: 'जीवन परिवर्तन, अचानक घडणारे प्रसंग आणि मानसिक कणखरता',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Ashtamsha reflects an inner capacity to transform setbacks into strength through ${el === 'Water' ? 'deep emotional healing and spiritual surrender' : el === 'Earth' ? 'unshakeable patience, composure, and endurance' : el === 'Fire' ? 'renewed resolve, self-belief, and rising from difficulty' : 'philosophical insight, mental adaptability, and broader perspective'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `अष्टांश कुंडलीत ${signMr} (${elMr}) लग्न दर्शवते की अनपेक्षित प्रसंगांतून सावरताना तुम्ही ${el === 'Water' ? 'भावनिक परिपक्वता व ईश्वरीय श्रद्धेतून' : el === 'Earth' ? 'अढळ संयम, शांतता व सहनशीलतेतून' : el === 'Fire' ? 'नव्या आत्मविश्वासाने पुन्हा उभे राहून' : 'तत्त्वज्ञानात्मक दृष्टिकोन व मानसिक लवचिकतेतून'} स्वतःला अधिक बलवान बनवता.`,
  },
  9: {
    aboutEn: 'The D9 (Navamsha) chart is the crown jewel of divisional charts — revealing inner spiritual strength (Dharma), long-term life partner dynamics, and planetary strength after youth.',
    aboutMr: 'D9 (नवांश) कुंडली सर्व वर्ग कुंडल्यांमध्ये अत्यंत महत्त्वाची मानली जाते — ती विवाह सुख, जोडीदाराशी सुसंवाद, धर्मनिष्ठा आणि उतारवयातील खरी ग्रह ताकद दर्शवते.',
    keyHouses: [7, 1, 9, 4],
    primaryKarakas: ['Venus', 'Jupiter', 'Sun'],
    focusAreaNameEn: 'marriage, relationships, and deeper soul strength',
    focusAreaNameMr: 'विवाह, जोडीदाराशी सुसंवाद आणि आंतरिक आत्मबळ',
    lagnaSignFocusEn: (sign, el) => `Your Navamsha Lagna is ${sign} (${el}), signifying that in your inner self and primary relationships, you value ${el === 'Water' ? 'emotional empathy, loyalty, and a soulful intuitive connection' : el === 'Air' ? 'mental rapport, shared ideals, conversation, and mutual freedom' : el === 'Earth' ? 'stability, dependability, quiet loyalty, and tangible support' : 'mutual inspiration, shared purpose, honesty, and positive enthusiasm'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `तुमचे नवांश लग्न ${signMr} (${elMr}) आहे. याचा अर्थ तुमच्या वैवाहिक जीवनात आणि आंतरिक स्वभावात तुम्ही ${el === 'Water' ? 'भावनिक एकरूपता, निष्ठा आणि अंतर्मनाचा जिव्हाळा' : el === 'Air' ? 'वैचारिक सुसंवाद, समान विचारसरणी व एकमेकांना दिलेले स्वातंत्र्य' : el === 'Earth' ? 'स्थैर्य, विश्वासार्हता आणि कौटुंबिक आधार' : 'परस्पर प्रेरणा, प्रामाणिकपणा आणि सकारात्मक उत्साह'} या मूल्यांना सर्वोच्च प्राधान्य देता.`,
  },
  10: {
    aboutEn: 'The D10 (Dashamsha) chart reveals your career path, leadership potential, reputation in society, professional responsibilities, and public standing.',
    aboutMr: 'D10 (दशांश) कुंडली करिअर, नोकरी-व्यवसाय, सामाजिक प्रतिष्ठा, नेतृत्व क्षमता आणि सार्वजनिक जबाबदाऱ्या दर्शवते.',
    keyHouses: [10, 1, 6, 11],
    primaryKarakas: ['Sun', 'Saturn', 'Jupiter', 'Mercury'],
    focusAreaNameEn: 'career, profession, and public contribution',
    focusAreaNameMr: 'करिअर, व्यवसाय आणि सामाजिक प्रतिष्ठा',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Dashamsha points to a professional presence defined by ${el === 'Earth' ? 'practical reliability, organizational skill, and visible tangible outcomes' : el === 'Fire' ? 'leadership initiative, executive vision, and inspiring authority' : el === 'Air' ? 'communication, strategic advisory, business networking, and innovation' : 'empathy, service orientation, creative insight, and intuitive leadership'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `दशांश कुंडलीत ${signMr} (${elMr}) लग्न असल्यामुळे तुमच्या कामात ${el === 'Earth' ? 'व्यावहारिक अचूकता, संघटनात्मक कौशल्य व ठोस परिणाम' : el === 'Fire' ? 'नेतृत्व, पुढाकार, अधिकार पद व धाडसी निर्णय' : el === 'Air' ? 'संभाषण, धोरणात्मक सल्लागार, व्यापार व कल्पक तंत्रज्ञान' : 'लोकांशी आपुलकी, सेवाभाव, सर्जनशीलता व मार्गदर्शक वृत्ती'} ही वैशिष्ट्ये स्पष्टपणे उठून दिसतात.`,
  },
  11: {
    aboutEn: 'The D11 (Rudramsha) chart shows how you realize ambitious desires, gain income streams, benefit from social circles and mentor connections, and reap rewards for hard work.',
    aboutMr: 'D11 (रुद्रांश / एकादशांश) कुंडली महत्त्वाकांक्षांची पूर्तता, विविध मार्गानी होणारा आर्थिक लाभ आणि मित्र परिवाराचे सहकार्य दर्शवते.',
    keyHouses: [11, 2, 1, 10],
    primaryKarakas: ['Jupiter', 'Mercury', 'Rahu'],
    focusAreaNameEn: 'gains, ambition, and social networks',
    focusAreaNameMr: 'आर्थिक लाभ, इच्छापूर्ती आणि सामाजिक संपर्क',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Rudramsha suggests that material and social gains come naturally through ${el === 'Air' ? 'expansive social networks, intellectual collaborations, and modern platforms' : el === 'Fire' ? 'bold ventures, high aspirations, and confident pursuit of opportunities' : el === 'Earth' ? 'systematic investments, patient enterprise, and tangible commercial success' : 'supportive communities, humanitarian goals, and heartfelt connections'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `रुद्रांश कुंडलीत ${signMr} (${elMr}) लग्न दर्शवते की आर्थिक व सामाजिक लाभ तुम्हाला ${el === 'Air' ? 'विस्तृत जनसंपर्क, बौद्धिक देवाणघेवाण व आधुनिक माध्यमे' : el === 'Fire' ? 'धाडसी उपक्रम, उच्च ध्येय व संधींचा योग्य पाठपुरावा' : el === 'Earth' ? 'पद्धतशीर गुंतवणूक, व्यावसायिक शिस्त व दीर्घकालीन काम' : 'हितचिंतकांचे सहकार्य, समाजोपयोगी कार्य व सलोख्याचे संबंध'} याद्वारे अधिक सहज मिळतात.`,
  },
  12: {
    aboutEn: 'The D12 (Dwadashamsha) chart deals with parental heritage, relationships with mother and father, ancestral karma, and the generational strengths passed on to you.',
    aboutMr: 'D12 (द्वादशांश) कुंडली आई-वडिलांशी असलेले संबंध, पूर्वजांचे आशीर्वाद, कौटुंबिक परंपरा आणि आनुवंशिक संस्कार दर्शवते.',
    keyHouses: [9, 4, 1, 12],
    primaryKarakas: ['Sun', 'Moon', 'Jupiter'],
    focusAreaNameEn: 'parents, ancestral roots, and family heritage',
    focusAreaNameMr: 'आई-वडील, कौटुंबिक मुळे आणि पूर्वजांचे संस्कार',
    lagnaSignFocusEn: (sign, el) => `A ${sign} (${el}) Lagna in Dwadashamsha highlights ancestral roots anchored in ${el === 'Water' ? 'strong maternal caring, emotional heritage, and intuitive family bonds' : el === 'Earth' ? 'hard-working lineage, family values, perseverance, and ancestral land' : el === 'Fire' ? 'proud heritage, moral integrity, leadership legacy, and self-respect' : 'intellectual traditions, education-focused family roots, and broad perspectives'}.`,
    lagnaSignFocusMr: (signMr, elMr, el) => `द्वादशांश कुंडलीत ${signMr} (${elMr}) लग्न पूर्वजांकडून मिळालेल्या ${el === 'Water' ? 'मातृसुख, भावनिक संस्कार व कौटुंबिक जिव्हाळा' : el === 'Earth' ? 'कष्टकरी परंपरा, कौटुंबिक नीतिमत्ता व जमिनीशी असलेली नाळ' : el === 'Fire' ? 'स्वाभिमानी वारसा, सत्यनिष्ठा व सामाजिक सन्मान' : 'विद्येची परंपरा, उच्च शिक्षण व सुसंस्कृत विचारसरणी'} या वारशाचा विशेष प्रभाव दर्शवते.`,
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getElement(sign: Sign): string {
  const r = RASHIS.find(item => item.name === sign);
  return r?.element ?? 'Unknown';
}

function getElementMr(element: string): string {
  switch (element) {
    case 'Fire': return 'अग्नि तत्त्व';
    case 'Earth': return 'पृथ्वी तत्त्व';
    case 'Air': return 'वायु तत्त्व';
    case 'Water': return 'जल तत्त्व';
    default: return element;
  }
}

function isKendra(house: number): boolean {
  return [1, 4, 7, 10].includes(house);
}

function isTrikona(house: number): boolean {
  return [1, 5, 9].includes(house);
}

function isDusthana(house: number): boolean {
  return [6, 8, 12].includes(house);
}

function isBenefic(planet: Planet): boolean {
  return ['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(planet);
}

function getDignityLabel(dignity: Dignity, lang: Language): string {
  if (lang === 'mr') {
    return getTranslation('mr', `dignity.${dignity}`, dignity);
  }
  switch (dignity) {
    case 'Exalted': return 'Exalted (Peak strength)';
    case 'OwnSign': return 'In its Own Sign (Very strong)';
    case 'Moolatrikona': return 'In Moolatrikona (Harmonious strength)';
    case 'Friend':
    case 'GreatFriend': return 'In a Friendly Sign (Comfortable)';
    case 'Debilitated': return 'Debilitated (Requires conscious effort)';
    case 'Enemy':
    case 'GreatEnemy': return 'In an Unfriendly Sign (Under pressure)';
    default: return 'Neutral';
  }
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export function generateVargaInterpretation(
  divChart: DivisionalChart,
  lang: Language = 'en'
): VargaInterpretation {
  const isMr = lang === 'mr';
  const div = divChart.division;
  const cfg = VARGA_THEMES[div];
  const lagnaEl = getElement(divChart.lagnaSign);
  const lagnaElMr = getElementMr(lagnaEl);
  const lagnaSignMr = getTranslation('mr', `sign.${divChart.lagnaSign}`);

  const planetsList = Object.values(divChart.planets).filter(p => p.planet !== 'Ascendant');

  // Categorize planets
  const exaltedPlanets = planetsList.filter(p => p.dignity === 'Exalted');
  const ownSignPlanets = planetsList.filter(p => p.dignity === 'OwnSign' || p.dignity === 'Moolatrikona');
  const debilitatedPlanets = planetsList.filter(p => p.dignity === 'Debilitated');
  const kendraPlanets = planetsList.filter(p => isKendra(p.vargaHouse));
  const trikonaPlanets = planetsList.filter(p => isTrikona(p.vargaHouse) && p.vargaHouse !== 1);
  const dusthanaPlanets = planetsList.filter(p => isDusthana(p.vargaHouse));
  const vargottamaPlanets = planetsList.filter(p => p.natalSignIndex === p.vargaSignIndex);

  // Group conjunctions (houses with 2 or more planets)
  const conjunctions: { house: number; planets: DivisionalPlanet[] }[] = [];
  for (let h = 1; h <= 12; h++) {
    const occupants = planetsList.filter(p => p.vargaHouse === h);
    if (occupants.length >= 2) {
      conjunctions.push({ house: h, planets: occupants });
    }
  }

  // 1. WHAT STANDS OUT (2–4 key observations)
  const standout: VargaObservation[] = [];

  // Standout 1: Ascendant in this Varga
  standout.push({
    title: isMr
      ? `${divChart.code} लग्न: ${lagnaSignMr} रास`
      : `${divChart.code} Lagna in ${divChart.lagnaSign}`,
    explanation: isMr
      ? cfg.lagnaSignFocusMr(lagnaSignMr, lagnaElMr, lagnaEl)
      : cfg.lagnaSignFocusEn(divChart.lagnaSign, lagnaEl),
    why: isMr
      ? `या वर्ग कुंडलीत लग्न ${lagnaSignMr} राशीत (${divChart.lagnaDegreeFormatted}) येते, जे ${cfg.focusAreaNameMr} यासाठी दिशा ठरवणारे आहे.`
      : `The divisional Ascendant falls in the ${lagnaEl} sign of ${divChart.lagnaSign} (${divChart.lagnaDegreeFormatted}), setting the primary tone for ${cfg.focusAreaNameEn}.`,
    technicalDetail: isMr
      ? `लग्न: ${lagnaSignMr} (${lagnaElMr}), प्रथम भाव आरंभ: ${divChart.lagnaDegreeFormatted}.`
      : `Lagna in ${divChart.lagnaSign} (${lagnaEl}), House 1 cusp: ${divChart.lagnaDegreeFormatted}.`,
  });

  // Standout 2: High dignity planets (Exalted, Own Sign, or Vargottama)
  if (exaltedPlanets.length > 0) {
    const p = exaltedPlanets[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    const sMr = getTranslation('mr', `sign.${p.vargaSign}`);
    standout.push({
      title: isMr
        ? `${pMr} या कुंडलीत उच्च राशीत आहे`
        : `${p.planet} is Exalted in this chart`,
      explanation: isMr
        ? `${divChart.name} कुंडलीत ${pMr} उच्च स्थितीत असल्याने संबंधित जीवन क्षेत्रात आत्मविश्वास, यश आणि सकारात्मक परिणाम मिळण्याची दाट शक्यता असते.`
        : `Having ${p.planet} in its highest dignity in the ${divChart.name} chart brings significant clarity, natural confidence, and strong potential in its represented matters.`,
      why: isMr
        ? `${pMr} हा ग्रह ${sMr} राशीत भाव ${p.vargaHouse} मध्ये आपल्या सर्वोच्च उच्च स्थितीत विराजमान आहे.`
        : `${p.planet} occupies ${p.vargaSign} in House ${p.vargaHouse}, functioning with its highest classical dignity.`,
      technicalDetail: isMr
        ? `${pMr} उच्च (Exalted) - ${sMr} रास, भाव ${p.vargaHouse}.`
        : `${p.planet} Uchha (Exalted) in ${p.vargaSign}, Bhava ${p.vargaHouse}.`,
    });
  } else if (vargottamaPlanets.length > 0) {
    const p = vargottamaPlanets[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    const sMr = getTranslation('mr', `sign.${p.vargaSign}`);
    standout.push({
      title: isMr
        ? `${pMr} वर्गोत्तम आहे (अढळ बळ)`
        : `${p.planet} is Vargottama (Grounded Strength)`,
      explanation: isMr
        ? `${pMr} हा ग्रह जन्मकुंडली आणि या वर्ग कुंडलीत एकाच राशीत (${sMr}) असल्याने त्याचे फळ स्थिर, विश्वासार्ह व दृढ राहते.`
        : `${p.planet} occupies the same sign (${p.vargaSign}) in both the birth chart and this divisional chart, creating deep consistency and unwavering focus.`,
      why: isMr
        ? `हा ग्रह D1 आणि ${divChart.code} या दोन्हीत ${sMr} राशीत समान स्थानावर आहे.`
        : `The planet holds ${p.vargaSign} identically in D1 and ${divChart.code}, reinforcing its natal promises without conflicting tendencies.`,
      technicalDetail: isMr
        ? `${pMr} वर्गोत्तम (${sMr} रास).`
        : `${p.planet} is Vargottama in ${p.vargaSign}.`,
    });
  } else if (ownSignPlanets.length > 0) {
    const p = ownSignPlanets[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    const sMr = getTranslation('mr', `sign.${p.vargaSign}`);
    standout.push({
      title: isMr
        ? `${pMr} स्वतःच्या राशीत अनुकूल आहे`
        : `${p.planet} rests in its own domain`,
      explanation: isMr
        ? `${pMr} हा ग्रह या कुंडलीत स्वतःच्या स्वराशीत असल्याने त्याचे गुण कोणत्याही संघर्षाविना सहजतेने व्यक्त होतात.`
        : `${p.planet} sits comfortably in its own home sign in this chart, allowing its natural gifts to express themselves smoothly without friction.`,
      why: isMr
        ? `${pMr} हा ग्रह भाव ${p.vargaHouse} मध्ये ${sMr} या स्वतःच्या राशीत स्थित आहे.`
        : `${p.planet} occupies ${p.vargaSign} in House ${p.vargaHouse}, acting as its own house lord.`,
      technicalDetail: isMr
        ? `${pMr} स्वराशीत (Swakshetra) - ${sMr}, भाव ${p.vargaHouse}.`
        : `${p.planet} Swakshetra in ${p.vargaSign}, Bhava ${p.vargaHouse}.`,
    });
  }

  // Standout 3: Conjunctions in this Varga
  if (conjunctions.length > 0) {
    const conj = conjunctions[0];
    const namesEn = conj.planets.map(p => p.planet).join(' and ');
    const namesMr = conj.planets.map(p => getTranslation('mr', `planet.${p.planet}`)).join(' आणि ');
    standout.push({
      title: isMr
        ? `भाव ${conj.house} मध्ये ग्रहांचा एकत्रित प्रभाव`
        : `Combined focus in House ${conj.house}`,
      explanation: isMr
        ? `${namesMr} या ग्रहांची ${conj.house} व्या भावात युती असल्याने तुमचे प्रयत्न आणि कौशल्ये या क्षेत्रात केंद्रित होतात.`
        : `The joint placement of ${namesEn} in the ${conj.house}th house focuses your energy and brings multiple talents together in that area of life.`,
      why: isMr
        ? `${namesMr} हे ग्रह भाव ${conj.house} मध्ये एकत्र आले आहेत.`
        : `${namesEn} share the same divisional sign in House ${conj.house}, blending their individual influences.`,
      technicalDetail: isMr
        ? `युती: ${namesMr} (भाव ${conj.house}).`
        : `Yuti (Conjunction) of ${namesEn} in House ${conj.house} (${conj.planets[0].vargaSign}).`,
    });
  }

  // Standout 4: Key Theme House Occupants
  const primaryHouse = cfg.keyHouses[0];
  const primaryHousePlanets = planetsList.filter(p => p.vargaHouse === primaryHouse);
  if (primaryHousePlanets.length > 0 && standout.length < 4) {
    const p = primaryHousePlanets[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    standout.push({
      title: isMr
        ? `${pMr} महत्त्वाच्या ${primaryHouse} व्या भावात सक्रिय आहे`
        : `${p.planet} activates the central ${primaryHouse}th house`,
      explanation: isMr
        ? `${primaryHouse} वे भाव हे या विषयाचे प्रमुख स्थान असल्याने ${pMr} ची उपस्थिती या जीवन क्षेत्राला थेट वळण देते.`
        : `Because the ${primaryHouse}th house is the focal point of ${cfg.focusAreaNameEn}, having ${p.planet} here directly shapes how this area unfolds in your life.`,
      why: isMr
        ? `${pMr} हा ग्रह ${divChart.code} मधील ${primaryHouse} व्या भावात स्थित आहे.`
        : `${p.planet} is situated right in the ${primaryHouse}th house of ${divChart.code}.`,
      technicalDetail: isMr
        ? `${pMr} भाव ${primaryHouse} मध्ये स्थित.`
        : `${p.planet} positioned in Bhava ${primaryHouse} (${p.vargaSign}).`,
    });
  }

  // 2. POSITIVE INFLUENCES
  const positives: VargaObservation[] = [];

  // Trikona placement
  if (trikonaPlanets.length > 0) {
    const p = trikonaPlanets[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    positives.push({
      title: isMr
        ? `त्रिकोण भावातून ${pMr} चे शुभ सहकार्य`
        : `Favorable trinal support from ${p.planet}`,
      explanation: isMr
        ? `५ व्या किंवा ९ व्या त्रिकोण भावातील ग्रह स्वाभाविक सुलभता, नैतिक विवेक आणि भाग्याची साथ देतात.`
        : `Placements in the 5th or 9th house are considered naturally supportive (Lakshmi Sthanas), bringing ease, moral clarity, and intuitive guidance.`,
      why: isMr
        ? `${pMr} ग्रह त्रिकोण स्थानी (भाव ${p.vargaHouse}) स्थित आहे.`
        : `${p.planet} is situated in House ${p.vargaHouse}, a trinal house that encourages good fortune and ethical harmony.`,
      technicalDetail: isMr
        ? `${pMr} त्रिकोण भावात (भाव ${p.vargaHouse}).`
        : `${p.planet} in Trikona (House ${p.vargaHouse}), conferring natural auspiciousness.`,
    });
  }

  // Benefics in Kendras
  const beneficKendra = kendraPlanets.filter(p => isBenefic(p.planet));
  if (beneficKendra.length > 0) {
    const p = beneficKendra[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    positives.push({
      title: isMr
        ? `केंद्र भावात ${pMr} ची भक्कम साथ`
        : `Constructive energy from ${p.planet} in a cornerstone house`,
      explanation: isMr
        ? `१, ४, ७, १० या केंद्र भावांमधील शुभ ग्रह या क्षेत्राला आवश्यक स्थिरता, संतुलन आणि यश मिळवून देतात.`
        : `Benefic planets in pillar houses (1, 4, 7, 10) provide visible support, constructive balance, and stability in this area of your life.`,
      why: isMr
        ? `${pMr} हा शुभ ग्रह पायाभूत केंद्र भावात (भाव ${p.vargaHouse}) स्थित आहे.`
        : `${p.planet} anchors House ${p.vargaHouse}, one of the four foundational angles of the chart.`,
      technicalDetail: isMr
        ? `शुभ ग्रह ${pMr} केंद्र भावात (भाव ${p.vargaHouse}).`
        : `Benefic ${p.planet} in Kendra Bhava ${p.vargaHouse}.`,
    });
  }

  // Strong Karaka
  const strongKarakas = planetsList.filter(
    p => cfg.primaryKarakas.includes(p.planet) && 
    (p.dignity === 'Exalted' || p.dignity === 'OwnSign' || p.dignity === 'Friend' || p.dignity === 'GreatFriend')
  );
  if (strongKarakas.length > 0) {
    const k = strongKarakas[0];
    const kMr = getTranslation('mr', `planet.${k.planet}`);
    positives.push({
      title: isMr
        ? `कारक ग्रह ${kMr} ची अनुकूल स्थिती`
        : `Harmonious condition for ${k.planet}`,
      explanation: isMr
        ? `या क्षेत्राचा नैसर्गिक कारक ग्रह ${kMr} मजबूत असल्याने हे जीवन क्षेत्र व्यवस्थित व प्रगतीपथावर राहण्यास मदत होते.`
        : `As a traditional significator of ${cfg.focusAreaNameEn}, ${k.planet}'s healthy placement helps this life area run more smoothly and constructively.`,
      why: isMr
        ? `${kMr} ग्रह भाव ${k.vargaHouse} मध्ये अनुकूल स्थितीत (${getDignityLabel(k.dignity, 'mr')}) आहे.`
        : `${k.planet} sits in ${k.vargaSign} (House ${k.vargaHouse}) with favorable dignity (${getDignityLabel(k.dignity, 'en')}).`,
      technicalDetail: isMr
        ? `कारक ग्रह ${kMr} - ${k.dignity} स्थिती (भाव ${k.vargaHouse}).`
        : `Karaka ${k.planet} holds ${k.dignity} status in Bhava ${k.vargaHouse}.`,
    });
  }

  // Fallback positive if list is short
  if (positives.length === 0) {
    positives.push({
      title: isMr ? 'संतुलित ग्रह रचना' : 'Balanced foundational distribution',
      explanation: isMr
        ? 'ग्रह विविध भावांमध्ये संतुलितपणे पसरलेले असल्याने कोणत्याही एका स्थानावर जास्त ताण येत नाही.'
        : 'Planets are distributed evenly across the chart, avoiding excessive concentration of stress in any single house.',
      why: isMr
        ? 'ग्रहांची ऊर्जा विविध भावांमध्ये विभागली गेली आहे.'
        : 'Planetary energies balance each other across diverse signs and houses.',
      technicalDetail: isMr ? 'संतुलित ग्रह विभागणी.' : 'Even planetary distribution without extreme malefic clustering.',
    });
  }

  // 3. THINGS TO WATCH (1–3 constructive growth areas)
  const watchOuts: VargaObservation[] = [];

  if (debilitatedPlanets.length > 0) {
    const p = debilitatedPlanets[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    const sMr = getTranslation('mr', `sign.${p.vargaSign}`);
    watchOuts.push({
      title: isMr
        ? `${pMr} च्या बाबतीत संयम व सजगता आवश्यक`
        : `${p.planet} may need conscious patience and awareness`,
      explanation: isMr
        ? `नीच राशीतील ग्रहाचे गुण आपोआप मिळत नाहीत; त्यांना अनुभवातून, समजूतदारपणाने व सातत्यपूर्ण प्रयत्नांनी घडवावे लागते.`
        : `When a planet is in its sign of debilitation, its qualities don't express themselves automatically; they require conscious maturity, self-reflection, and steady practice to shine.`,
      why: isMr
        ? `${pMr} हा ग्रह ${sMr} (नीच रास) मध्ये भाव ${p.vargaHouse} मध्ये स्थित आहे.`
        : `${p.planet} is located in ${p.vargaSign} (Debilitated) in House ${p.vargaHouse}.`,
      technicalDetail: isMr
        ? `${pMr} नीच राशीत (Debilitated) - ${sMr}, भाव ${p.vargaHouse}.`
        : `${p.planet} Neecha (Debilitated) in ${p.vargaSign}, Bhava ${p.vargaHouse}.`,
    });
  }

  const dusthanaKarakas = dusthanaPlanets.filter(p => cfg.primaryKarakas.includes(p.planet));
  if (dusthanaKarakas.length > 0) {
    const p = dusthanaKarakas[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    watchOuts.push({
      title: isMr
        ? `भाव ${p.vargaHouse} मधील ${pMr} संयमी प्रयत्नांची अपेक्षा करतो`
        : `${p.planet} in House ${p.vargaHouse} asks for realistic expectations`,
      explanation: isMr
        ? `६, ८ किंवा १२ व्या भावात ग्रह असणे हे दर्शवते की येथे यश लगेच न मिळता अनुभव, संयम आणि शिकण्याच्या वृत्तीने मिळते.`
        : `Placements in the 6th, 8th, or 12th house suggest that progress in this domain comes after navigating challenges, requiring emotional detachment and steady effort.`,
      why: isMr
        ? `${pMr} ग्रह त्रिक भावात (भाव ${p.vargaHouse}) स्थित आहे.`
        : `${p.planet} occupies a Dusthana (House ${p.vargaHouse}), which traditionally teaches through persistence and learning from adjustments.`,
      technicalDetail: isMr
        ? `${pMr} त्रिक भावात (भाव ${p.vargaHouse}).`
        : `${p.planet} in Dusthana Bhava ${p.vargaHouse}.`,
    });
  }

  const retroPlanets = planetsList.filter(p => p.isRetrograde && p.planet !== 'Rahu' && p.planet !== 'Ketu');
  if (retroPlanets.length > 0 && watchOuts.length < 2) {
    const p = retroPlanets[0];
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    watchOuts.push({
      title: isMr
        ? `वक्री ${pMr} मुळे आत्मपरीक्षणाचा मार्ग हितकारक`
        : `Introspective approach with retrograde ${p.planet}`,
      explanation: isMr
        ? `वक्री ग्रह कोणताही निर्णय घाईत न घेता पूर्वअनुभवांतून शिकून आणि स्वतंत्रपणे विचार करून पुढे जाण्याचा सल्ला देतो.`
        : `A retrograde planet in this chart encourages reviewing past lessons, thinking independently, and avoiding rushing into impulsive decisions regarding this theme.`,
      why: isMr
        ? `${pMr} हा ग्रह भाव ${p.vargaHouse} मध्ये वक्री गतीने आहे.`
        : `${p.planet} is moving retrograde (Vakri) in House ${p.vargaHouse}.`,
      technicalDetail: isMr
        ? `${pMr} वक्री (Retrograde) - भाव ${p.vargaHouse}.`
        : `${p.planet} Vakri (Retrograde) in House ${p.vargaHouse} (${p.vargaSign}).`,
    });
  }

  // Fallback constructive note
  if (watchOuts.length === 0) {
    watchOuts.push({
      title: isMr ? 'जीवनातील बदलांच्या वेळी समतोल ठेवा' : 'Mindful balance during key transitions',
      explanation: isMr
        ? 'एकूण ग्रह रचना स्थिर असली तरी अचानक होणाऱ्या बदलांच्या वेळी अतिउत्साह किंवा घाई टाळून स्थिर विचारसरणी ठेवावी.'
        : 'While overall influences are steady, sudden shifts in lifestyle or routine can temporarily test your focus in this life area.',
      why: isMr
        ? 'कोणतीही वर्ग कुंडली अचानक निर्णयांपेक्षा सातत्यपूर्ण प्रयत्नांना अधिक अनुकूल असते.'
        : 'Every divisional chart benefits from steady habits rather than sudden overcorrections.',
      technicalDetail: isMr ? 'गोचर बदलांनुसार सामान्य सल्ला.' : 'General advisory based on planetary transit dynamics.',
    });
  }

  // 4. OVERALL TONE & TAKEAWAY
  let positiveScore = (exaltedPlanets.length * 2) + ownSignPlanets.length + (kendraPlanets.length) + (trikonaPlanets.length);
  let challengeScore = (debilitatedPlanets.length * 2) + dusthanaPlanets.length;

  let overallTone: VargaOverallTone = 'Mixed';
  let toneExplanation = '';

  if (positiveScore >= challengeScore + 2) {
    overallTone = 'Supportive';
    toneExplanation = isMr
      ? `या कुंडलीत बहुतांश ग्रह अनुकूल स्थितीत असून या क्षेत्रात स्वाभाविक आत्मविश्वास, अनुकूलता आणि सकारात्मक प्रगतीची उत्तम पायाभरणी दिसून येते.`
      : `This chart shows predominantly supportive alignments, indicating natural resilience, positive momentum, and encouraging foundations for ${cfg.focusAreaNameEn}.`;
  } else if (challengeScore >= positiveScore + 2) {
    overallTone = 'Challenging';
    toneExplanation = isMr
      ? `ही कुंडली विशेष समर्पण, संयम व आत्मविकासाची संधी दर्शवते, जिथे सातत्यपूर्ण प्रयत्नांनी आणि परिपक्वतेने मोठे यश प्राप्त होते.`
      : `This chart highlights areas that invite conscious dedication, patience, and personal growth, where tangible rewards come through sustained commitment.`;
  } else {
    overallTone = 'Mixed';
    toneExplanation = isMr
      ? `ही कुंडली नैसर्गिक ताकद आणि सातत्यपूर्ण परिश्रमांची गरज असलेल्या घटकांचा समतोल दर्शवते, जिथे चिकाटीने ठोस यश संपादन करता येते.`
      : `This chart reflects a balanced blend of natural assets alongside areas that benefit from thoughtful effort, offering solid room for steady development.`;
  }

  const takeaway = isMr
    ? `${divChart.name} (${divChart.code}) कुंडलीत तुमचे ${cfg.focusAreaNameMr} हे ${lagnaSignMr} लग्नाद्वारे मार्गदर्शित आहे. ${
        exaltedPlanets.length > 0 
          ? `उच्च राशीतील ${getTranslation('mr', `planet.${exaltedPlanets[0].planet}`)} ची शुभ साथ असल्याने` 
          : ownSignPlanets.length > 0 
          ? `स्वराशीतील ${getTranslation('mr', `planet.${ownSignPlanets[0].planet}`)} च्या भक्कम स्थितीमुळे` 
          : `ग्रहांच्या संतुलित स्थानांमुळे`
      } या क्षेत्रात घाई न करता योग्य नियोजन व सातत्य ठेवल्यास उत्तम प्रगती साध्य होते.`
    : `In the ${divChart.name} (${divChart.code}) chart, your ${cfg.focusAreaNameEn} is guided by a ${divChart.lagnaSign} Lagna. With ${
        exaltedPlanets.length > 0 
          ? `exalted ${exaltedPlanets[0].planet} giving key strengths` 
          : ownSignPlanets.length > 0 
          ? `strong placement of ${ownSignPlanets[0].planet}` 
          : `balanced planetary placements across your houses`
      }, this life area develops best when you balance your natural confidence with steady, practical habits.`;

  // 5. PLANET-BY-PLANET INSIGHTS (Key planets only)
  const importantPlanets = planetsList.filter(p => {
    return cfg.primaryKarakas.includes(p.planet) ||
      p.dignity === 'Exalted' ||
      p.dignity === 'OwnSign' ||
      p.dignity === 'Debilitated' ||
      cfg.keyHouses.includes(p.vargaHouse) ||
      p.natalSignIndex === p.vargaSignIndex;
  }).slice(0, 5);

  const planetInsights: VargaPlanetInsight[] = importantPlanets.map(p => {
    const isKaraka = cfg.primaryKarakas.includes(p.planet);
    const pMr = getTranslation('mr', `planet.${p.planet}`);
    const sMr = getTranslation('mr', `sign.${p.vargaSign}`);

    const role = isMr
      ? (isKaraka ? `या क्षेत्राचा मुख्य कारक ग्रह` : `भाव ${p.vargaHouse} चा प्रभावकर्ता ग्रह`)
      : (isKaraka ? `Key natural significator for ${cfg.focusAreaNameEn}` : `Influences House ${p.vargaHouse} themes in this chart`);

    let positive = '';
    let challenge = '';

    if (p.dignity === 'Exalted' || p.dignity === 'OwnSign' || p.dignity === 'Friend' || p.dignity === 'GreatFriend') {
      positive = isMr
        ? `भाव ${p.vargaHouse} आणि ${sMr} राशीच्या विषयांमध्ये आत्मविश्वास, स्पष्टता आणि अनुकूल फळे देतो.`
        : `Brings confidence, natural clarity, and supportive outcomes to ${p.vargaSign} themes in House ${p.vargaHouse}.`;
      challenge = isMr
        ? `अतिआत्मविश्वास किंवा निष्काळजीपणा टाळून मिळालेल्या संधींचा प्रत्यक्ष उपयोग करा.`
        : `Guard against complacency; make sure you actively apply its advantages.`;
    } else if (p.dignity === 'Debilitated') {
      positive = isMr
        ? `अनुभवातून शिकण्याची तीव्र ओढ, आंतरिक नम्रता आणि दीर्घकालीन कणखरता निर्माण करतो.`
        : `Builds profound humility, deep life experience, and long-term resilience as you learn through practice.`;
      challenge = isMr
        ? `कधीकधी आत्मविश्वासाचा अभाव किंवा योग्य दिशा मिळवण्यासाठी जास्त प्रयत्न करावे लागू शकतात.`
        : `May occasionally bring self-doubt or require extra effort to find the right expression.`;
    } else {
      positive = isMr
        ? `भाव ${p.vargaHouse} मध्ये व्यावहारिक, संतुलित आणि स्थिर कार्यशक्ती देतो.`
        : `Operates steadily, providing neutral and practical energy in House ${p.vargaHouse}.`;
      challenge = isMr
        ? `या ग्रहाच्या ऊर्जेचा संपूर्ण लाभ घेण्यासाठी जाणीवपूर्वक लक्ष केंद्रित करावे लागेल.`
        : `Needs deliberate focus to channel its full benefits.`;
    }

    const placementStr = isMr
      ? `भाव ${p.vargaHouse}, ${sMr} रास (${p.vargaDegreeFormatted})`
      : `House ${p.vargaHouse} in ${p.vargaSign} (${p.vargaDegreeFormatted})`;

    const techStr = isMr
      ? `${pMr} - ${sMr} रास · भाव ${p.vargaHouse} · ${getDignityLabel(p.dignity, 'mr')}${p.isRetrograde ? ' · वक्री' : ''}${p.isCombust ? ' · अस्त' : ''}`
      : `${p.planet} in ${p.vargaSign} · Bhava ${p.vargaHouse} · ${getDignityLabel(p.dignity, 'en')}${p.isRetrograde ? ' · Retrograde' : ''}${p.isCombust ? ' · Combust' : ''}`;

    return {
      planet: p.planet,
      placement: placementStr,
      role,
      positive,
      challenge,
      technical: techStr,
    };
  });

  return {
    division: div,
    code: divChart.code,
    name: isMr ? getTranslation('mr', `nav.varga`) : divChart.name,
    about: isMr ? cfg.aboutMr : cfg.aboutEn,
    overallTone,
    toneExplanation,
    takeaway,
    standout,
    positives,
    watchOuts,
    planetInsights,
  };
}
