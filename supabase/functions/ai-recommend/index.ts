import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  type: "recommend" | "chat";
  preferences?: {
    interests: string[];
    duration: number;
    totalBudget: number;
    travelStyle: string;
    startingCity: string;
    startDate: string;
    endDate: string;
  };
  selectedDestinations?: string[];
  language?: string;
  message?: string;
  userName?: string;
}

const KARNATAKA_DESTINATIONS = [
  { name: "Hampi", category: "heritage", region: "north", duration: "2-3 days", desc: "UNESCO World Heritage ruins of the Vijayanagara Empire" },
  { name: "Mysuru Palace", category: "heritage", region: "south", duration: "1 day", desc: "Indo-Saracenic royal palace, spectacular when illuminated on Sundays" },
  { name: "Coorg", category: "hills", region: "south", duration: "2-3 days", desc: "Coffee plantations, misty hills, Abbey Falls and Tibetan settlements" },
  { name: "Chikkamagaluru", category: "hills", region: "south", duration: "2 days", desc: "Coffee land of Karnataka with Mullayanagiri, Karnataka's highest peak" },
  { name: "Gokarna", category: "beaches", region: "west", duration: "2-3 days", desc: "Pilgrim town with pristine beaches — Om Beach, Kudle Beach, Half Moon Beach" },
  { name: "Jog Falls", category: "waterfalls", region: "west", duration: "1 day", desc: "India's second-highest waterfall, spectacular during monsoon" },
  { name: "Murudeshwar", category: "beaches", region: "west", duration: "1 day", desc: "World's second-tallest Shiva statue by the Arabian Sea" },
  { name: "Badami Cave Temples", category: "heritage", region: "north", duration: "1 day", desc: "6th-century sandstone cave temples carved into red cliffs" },
  { name: "Pattadakal", category: "heritage", region: "north", duration: "1 day", desc: "UNESCO site with 7th-8th century Chalukya temple architecture" },
  { name: "Bandipur National Park", category: "wildlife", region: "south", duration: "1-2 days", desc: "Tiger reserve and wildlife sanctuary on the Nilgiri Biosphere" },
  { name: "Dandeli", category: "wildlife", region: "north", duration: "2 days", desc: "Wildlife sanctuary with white-water rafting on the Kali River" },
  { name: "Nandi Hills", category: "hills", region: "south", duration: "1 day", desc: "Hill fortress near Bengaluru, famous for sunrise views" },
  { name: "Belur & Halebidu", category: "heritage", region: "south", duration: "1-2 days", desc: "12th-century Hoysala temples with intricate soapstone carvings" },
  { name: "Kabini", category: "wildlife", region: "south", duration: "2 days", desc: "River backwaters with luxury wildlife resorts and safari" },
  { name: "Agumbe", category: "nature", region: "west", duration: "1-2 days", desc: "Rainforest sunset point, King Cobra habitat in the Western Ghats" },
  { name: "Shivanasamudra Falls", category: "waterfalls", region: "south", duration: "1 day", desc: "Twin waterfalls on the Kaveri River, day trip from Bengaluru" },
  { name: "Karwar", category: "beaches", region: "west", duration: "2 days", desc: "Coastal town with serene beaches and naval base" },
  { name: "Chitradurga Fort", category: "heritage", region: "central", duration: "1 day", desc: "Seven-tiered stone fort with massive boulders and hidden passages" },
  { name: "Gol Gumbaz", category: "heritage", region: "north", duration: "1 day", desc: "World's second-largest dome in Vijayapura, with whispering gallery" },
  { name: "Nagarhole National Park", category: "wildlife", region: "south", duration: "1-2 days", desc: "Rajiv Gandhi National Park with rich wildlife and safari" },
];

function scoreDestination(dest: typeof KARNATAKA_DESTINATIONS[0], prefs: NonNullable<RequestBody["preferences"]>): number {
  let score = 0;
  if (prefs.interests.includes(dest.category)) score += 10;
  if (prefs.interests.includes("mixed")) score += 5;
  if (prefs.travelStyle === "budget" && dest.duration.includes("1 day")) score += 2;
  if (prefs.duration <= 3 && dest.duration.includes("1 day")) score += 2;
  if (prefs.duration >= 5 && dest.duration.includes("2-3 days")) score += 3;
  return score;
}

function generateDemoRecommendations(prefs: NonNullable<RequestBody["preferences"]>): string {
  const scored = KARNATAKA_DESTINATIONS
    .map(d => ({ ...d, score: scoreDestination(d, prefs) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const lang = prefs.language || "en";
  const greeting = lang === "kn" ? "ನಮಸ್ಕಾರ" : lang === "ta" ? "வணக்கம்" : lang === "hi" ? "नमस्ते" : "Hello";

  let response = `${greeting}! Based on your preferences — ${prefs.interests.join(", ")}, ${prefs.duration} days, budget ₹${prefs.totalBudget.toLocaleString()}, ${prefs.travelStyle} style — here are my recommendations for Karnataka:\n\n`;

  scored.forEach((d, i) => {
    response += `${i + 1}. ${d.name} (${d.category}, ${d.region} Karnataka)\n   ${d.desc}\n   Recommended: ${d.duration}\n`;
    if (d.score >= 10) response +=   `   Why: Perfectly matches your interests\n`;
    response += "\n";
  });

  response += `\nThese ${scored.length} destinations fit well within a ${prefs.duration}-day trip from ${prefs.startingCity}. Would you like me to help plan a day-by-day itinerary or provide more details about any destination?`;

  return response;
}

function generateDemoChat(message: string, prefs: NonNullable<RequestBody["preferences"]>, userName?: string): string {
  const q = message.toLowerCase();
  const name = userName ? userName : "traveler";

  if (q.includes("hampi")) return `Hampi is a UNESCO World Heritage Site and the ruins of the Vijayanagara Empire (1336-1565 CE). I recommend 2-3 days. Key sights: Virupaksha Temple, Vittala Temple with stone chariot, Lotus Mahal, and Matanga Hill for sunset. Best season: October to February.`;
  if (q.includes("beach") || q.includes("gokarna")) return `For beaches, Gokarna is ideal — Om Beach, Kudle Beach, and Half Moon Beach offer a quieter alternative to Goa. Murudeshwar combines a beach visit with the world's second-tallest Shiva statue. Karwar is another serene option.`;
  if (q.includes("hill") || q.includes("coorg") || q.includes("chikmagalur") || q.includes("chikkamagaluru")) return `Coorg (Kodagu) offers coffee plantations, Abbey Falls, and Tibetan settlements at Bylakuppe. Chikkamagaluru has Mullayanagiri (Karnataka's highest peak) and Baba Budangiri. Both need 2-3 days.`;
  if (q.includes("waterfall") || q.includes("jog")) return `Jog Falls (Gersoppa) is India's second-highest waterfall at 253m, most spectacular July-October during monsoon. Shivanasamudra is a great day trip from Bengaluru. Abbey Falls in Coorg is beautiful year-round.`;
  if (q.includes("wildlife") || q.includes("safari") || q.includes("animal") || q.includes("tiger")) return `Bandipur and Nagarhole are top tiger reserves. Kabini offers excellent boat safaris. Dandeli has white-water rafting alongside wildlife. Best season for sightings: March-May (dry season).`;
  if (q.includes("budget") || q.includes("cheap") || q.includes("affordable")) return `For a budget trip from ${prefs.startingCity}: Hampi (₹1,500/day), Gokarna (₹1,800/day), or Nandi Hills (day trip, ₹500). Use trains and buses, stay in hostels or guesthouses.`;
  if (q.includes("temple") || q.includes("heritage")) return `Karnataka's temple heritage is extraordinary: Hampi (Vijayanagara), Pattadakal (Chalukya, UNESCO), Belur & Halebidu (Hoysala), Badami (cave temples), and Mysuru Palace. Allow at least 5-7 days for a comprehensive heritage circuit.`;
  if (q.includes("best time") || q.includes("season") || q.includes("when")) return `Best time to visit Karnataka: October to March for most destinations. Monsoon (June-September) is spectacular for waterfalls (Jog Falls, Shivanasamudra) and the Western Ghats (Coorg, Agumbe). Avoid April-May for heritage sites (very hot).`;
  if (q.includes("itinerary") || q.includes("plan") || q.includes("route")) return `For a ${prefs.duration}-day trip, I'd suggest focusing on one region: North Karnataka (Hampi-Badami-Pattadakal), South Karnataka (Mysuru-Coorg-Kabini), or Coastal Karnataka (Gokarna-Murudeshwar-Jog Falls). Would you like me to detail a specific route?`;
  return `Great question, ${name}! Karnataka offers heritage sites, hill stations, beaches, waterfalls, and wildlife. Based on your interest in ${prefs.interests.join(", ")}, I'd suggest exploring the relevant destinations on the recommendations page. Feel free to ask about specific places, seasons, or logistics!`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    // If no Gemini key is configured, return demo response
    if (!geminiKey) {
      if (body.type === "recommend" && body.preferences) {
        const demoText = generateDemoRecommendations(body.preferences);
        return new Response(
          JSON.stringify({ text: demoText, isDemo: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (body.type === "chat" && body.message && body.preferences) {
        const demoText = generateDemoChat(body.message, body.preferences, body.userName);
        return new Response(
          JSON.stringify({ text: demoText, isDemo: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ text: "Unable to process request in demo mode.", isDemo: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Real Gemini integration
    const lang = body.language || "en";
    const langName: Record<string, string> = {
      en: "English", kn: "Kannada", ta: "Tamil", ml: "Malayalam",
      hi: "Hindi", de: "German", it: "Italian", ja: "Japanese", ru: "Russian",
    };
    const responseLang = langName[lang] || "English";

    let prompt = "";
    if (body.type === "recommend" && body.preferences) {
      const prefs = body.preferences;
      prompt = `You are an expert Karnataka travel planner. A traveler wants to visit Karnataka with these preferences:
- Interests: ${prefs.interests.join(", ")}
- Duration: ${prefs.duration} days
- Budget: ₹${prefs.totalBudget.toLocaleString()} (total)
- Travel style: ${prefs.travelStyle}
- Starting from: ${prefs.startingCity}
- Dates: ${prefs.startDate} to ${prefs.endDate}

Recommend 6-8 destinations in Karnataka that best match these preferences. For each, explain why it fits and suggest how many days to allocate. Respond in ${responseLang}. Keep it concise and practical.`;
    } else if (body.type === "chat" && body.message) {
      const prefs = body.preferences;
      prompt = `You are an expert Karnataka travel assistant. The traveler's preferences: interests=${prefs?.interests.join(", ") || "general"}, duration=${prefs?.duration || "flexible"} days, budget=₹${prefs?.totalBudget.toLocaleString() || "flexible"}, style=${prefs?.travelStyle || "comfortable"}, starting from ${prefs?.startingCity || "Bengaluru"}.

The traveler asks: "${body.message}"

Respond helpfully and concisely in ${responseLang}. Do not fabricate prices, schedules, or availability. If you don't know something, say so.`;
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", errText);
      // Fall back to demo
      if (body.type === "recommend" && body.preferences) {
        return new Response(
          JSON.stringify({ text: generateDemoRecommendations(body.preferences), isDemo: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (body.type === "chat" && body.message && body.preferences) {
        return new Response(
          JSON.stringify({ text: generateDemoChat(body.message, body.preferences, body.userName), isDemo: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "I could not generate a response. Please try again.";

    return new Response(
      JSON.stringify({ text, isDemo: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ text: "Something went wrong. Please try again.", isDemo: true, error: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
