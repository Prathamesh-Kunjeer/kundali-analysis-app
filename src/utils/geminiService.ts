import { FullKundaliAnalysis } from '../types/astrology';

/**
 * Built-in intelligent Vedic Jyotish knowledge synthesizer
 * Runs client-side when no API key is provided
 */
export function generateLocalAIResponse(query: string, kundali: FullKundaliAnalysis): string {
  const q = query.toLowerCase();
  const name = kundali.birthDetails.name;
  const asc = kundali.ascendant.rashi;
  const moon = kundali.planets.find(p => p.name === 'Moon')?.rashi || 'Taurus';
  const h10 = kundali.houses.find(h => h.houseNumber === 10);
  const h7 = kundali.houses.find(h => h.houseNumber === 7);
  const h2 = kundali.houses.find(h => h.houseNumber === 2);
  const runningDasha = `${kundali.dasha.currentMahadasha?.planet}-${kundali.dasha.currentAntardasha?.planet}`;

  if (q.includes('career') || q.includes('job') || q.includes('profession') || q.includes('business') || q.includes('10th')) {
    return `### 🌟 Vedic Career & Karma Analysis for ${name}

- **10th House (Karma Bhava)** falls in **${h10?.rashi}**, governed by **${h10?.rashiLord}**.
- **Occupying Grahas in 10th House**: ${h10?.planets.length ? h10.planets.map(p => `${p.name} (${p.dignity})`).join(', ') : 'None (Guided by lord ' + h10?.rashiLord + ')'}.
- **Career Path Insights**: ${kundali.predictions.career}
- **Current Dasha Influence**: Under your current **${runningDasha}** cycle, focus on leadership, technological skill upgrading, and structured execution.
- **Vedic Recommendation**: Chant the *${h10?.rashiLord} Beej Mantra* on its weekday and keep a clean, clutter-free workspace facing North or East.`;
  }

  if (q.includes('marriage') || q.includes('love') || q.includes('relationship') || q.includes('spouse') || q.includes('7th') || q.includes('manglik')) {
    return `### 💖 Marriage & Relationship Insights for ${name}

- **7th House (Kalatra Bhava)** is in **${h7?.rashi}**, ruled by **${h7?.rashiLord}**.
- **Manglik Status**: ${kundali.manglik.isCancelled ? 'Manglik Dosha is Neutralized / Cancelled.' : kundali.manglik.isManglik ? `Moderate Manglik (${kundali.manglik.level})` : 'Non-Manglik'}.
- **Partner Characteristics**: ${kundali.predictions.loveAndMarriage}
- **D9 Navamsha Alignment**: Navamsha Lagna is placed in **${kundali.divisionalCharts.D9.houses[0].rashi}**, highlighting deep mutual respect and shared cultural or ethical values.
- **Harmonizing Remedy**: Offer white flowers or light a ghee lamp for Goddess Lakshmi on Friday evenings.`;
  }

  if (q.includes('wealth') || q.includes('money') || q.includes('finance') || q.includes('investment') || q.includes('dhana')) {
    const dhanaYogas = kundali.yogas.filter(y => y.category === 'Dhana Yoga' || y.category === 'Mahapurusha Yoga');
    return `### 💰 Wealth, Assets & Dhana Yogas for ${name}

- **2nd House (Dhana Bhava)** in **${h2?.rashi}** (Lord: ${h2?.rashiLord}) and **11th House (Labha Bhava)** govern your compounding returns.
- **Active Dhana Yogas**: ${dhanaYogas.length ? dhanaYogas.map(y => `**${y.name}** (${y.strength})`).join(', ') : 'Solid stable asset growth supported by regular disciplined investments'}.
- **Wealth Forecast**: ${kundali.predictions.wealth}
- **Auspicious Direction for Assets**: North-East (Kuber / Ishanya corner of home).`;
  }

  if (q.includes('dasha') || q.includes('period') || q.includes('timing') || q.includes('future') || q.includes('transit')) {
    return `### ⏳ Vimshottari Dasha Timeline & Transit Shift

- **Currently Running**: **${kundali.dasha.currentMahadasha?.planet} Mahadasha** (Active until ${kundali.dasha.currentMahadasha?.endDate}) with **${kundali.dasha.currentAntardasha?.planet} Antardasha** and **${kundali.dasha.currentPratyantardasha?.planet} Pratyantardasha**.
- **Sade Sati Status**: ${kundali.sadeSati.isInSadeSati ? `Active in ${kundali.sadeSati.phase}` : 'Not currently in Sade Sati'}.
- **Cosmic Guidance**: This period encourages focused dedication. Align your actions with the karakatwas of ${kundali.dasha.currentMahadasha?.planet}.`;
  }

  if (q.includes('gemstone') || q.includes('remedy') || q.includes('stone') || q.includes('mantra') || q.includes('rudraksha')) {
    const gems = kundali.gemstones.map(g => `**${g.type}**: ${g.name} (${g.hindiName}) on ${g.finger} in ${g.metal}`).join('\n- ');
    return `### 💎 Prescribed Vedic Gemstones & Remedial Upays

- ${gems}
- **Recommended Rudraksha**: ${kundali.remedies.find(r => r.category === 'Rudraksha')?.title || '5-Mukhi Rudraksha'}
- **Daily Mantra**: "${kundali.gemstones[0]?.mantra || 'Om Namah Shivaya'}" (108 times at dawn).`;
  }

  // Default holistic reading
  return `### 🔮 Comprehensive Astrological Synthesis for ${name}

- **Lagna (Ascendant)**: **${asc}** (Lord: ${kundali.ascendant.rashiLord}) — Gives dynamic physical constitution and natural ambition.
- **Moon Sign (Rashi)**: **${moon}** — Governs emotional intuition and subconscious inclinations.
- **Running Dasha**: **${runningDasha}** Mahadasha / Antardasha.
- **Key Vedic Yogas Detected**: ${kundali.yogas.slice(0, 3).map(y => y.name).join(', ')}.
- **Summary**: Your chart showcases strong potential for enduring success when actions are grounded in discipline. Feel free to ask specific questions about Career, Marriage, Wealth, Dasha timing, or Gemstone remedies!`;
}

/**
 * Calls the official Google Gemini API (if user provides their own key)
 */
export async function callGeminiAstrologer(
  apiKey: string,
  userMessage: string,
  kundali: FullKundaliAnalysis,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const systemContext = `You are "JyotishVeda AI", an expert, benevolent, and highly knowledgeable Vedic Astrologer (Jyotish Acharya) trained in classical Parashari, Jaimini, and Brihat Samhita principles.
The user's Janam Kundali details are as follows:
- Name: ${kundali.birthDetails.name}
- Date of Birth: ${kundali.birthDetails.dob} at ${kundali.birthDetails.tob}
- Place of Birth: ${kundali.birthDetails.cityName}, ${kundali.birthDetails.country} (Lat: ${kundali.birthDetails.latitude}, Lon: ${kundali.birthDetails.longitude})
- Lahiri Ayanamsha: ${kundali.formattedAyanamsa}
- Ascendant (Lagna): ${kundali.ascendant.rashi} (${kundali.ascendant.formattedDegree}) in Nakshatra ${kundali.ascendant.nakshatra} (Lord: ${kundali.ascendant.rashiLord})
- Moon Sign: ${kundali.planets.find(p => p.name === 'Moon')?.rashi} (${kundali.planets.find(p => p.name === 'Moon')?.nakshatra} Pada ${kundali.planets.find(p => p.name === 'Moon')?.pada})
- Sun Sign: ${kundali.planets.find(p => p.name === 'Sun')?.rashi} in House ${kundali.planets.find(p => p.name === 'Sun')?.house}
- Running Vimshottari Dasha: ${kundali.dasha.currentMahadasha?.planet} Mahadasha with ${kundali.dasha.currentAntardasha?.planet} Antardasha
- Manglik Status: ${kundali.manglik.isCancelled ? 'Neutralized / Cancelled' : kundali.manglik.isManglik ? kundali.manglik.level : 'Non-Manglik'}
- Sade Sati Status: ${kundali.sadeSati.phase}
- Active Yogas: ${kundali.yogas.map(y => y.name).join(', ')}
- Prescribed Gemstones: ${kundali.gemstones.map(g => `${g.type}: ${g.name} (${g.hindiName})`).join(', ')}

Please provide deeply respectful, nuanced, uplifting, and actionable Vedic astrological guidance using markdown formatting.`;

  const contents = [
    { role: 'user', parts: [{ text: `[System Context]\n${systemContext}` }] },
    { role: 'model', parts: [{ text: `Namaste. I have carefully reviewed ${kundali.birthDetails.name}'s Janam Kundali. How may I guide you today?` }] },
    ...chatHistory,
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || 'No response from Gemini API.';
}
