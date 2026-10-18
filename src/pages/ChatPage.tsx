import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { destinations, getDestinationBySlug } from '../data/destinations';
import './ChatPage.css';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// Demo AI responses based on keywords
function generateDemoResponse(query: string): string {
  const q = query.toLowerCase();
  
  // Check for destination-specific queries
  for (const dest of destinations) {
    if (q.includes(dest.name.toLowerCase()) || q.includes(dest.slug.replace(/-/g, ' '))) {
      return `**${dest.name}** — ${dest.shortDescription}\n\n📍 **Location:** ${dest.district}, ${dest.region} Karnataka\n🕐 **Hours:** ${dest.openingHours.open || 'Open all day'} – ${dest.openingHours.close || ''}\n💰 **Entry:** Indian Adult ₹${dest.entryFee.indianAdult ?? 'Free'} | Foreign Adult ₹${dest.entryFee.foreignAdult ?? 'Free'}\n⏱️ **Duration:** ${dest.recommendedDuration}\n🌤️ **Best Season:** ${dest.bestSeason}\n\n${dest.detailedHistory.substring(0, 300)}...\n\n⭐ **Special Attractions:** ${dest.specialAttractions.slice(0, 3).join(', ')}\n📍 **Nearby:** ${dest.nearbyAttractions.slice(0, 3).join(', ')}`;
    }
  }

  if (q.includes('history') || q.includes('hampi')) {
    const hampi = destinations.find(d => d.slug === 'hampi');
    return hampi ? `**Hampi** was the capital of the Vijayanagara Empire (1336–1565 CE), one of the richest and most powerful empires in medieval India. At its peak, it had over 500,000 residents and was described by foreign travellers as a "city of marvels."\n\n${hampi.detailedHistory}\n\n🏛️ It became a **UNESCO World Heritage Site in 1986**, covering 26 sq km of ruins.\n\n📍 **Location:** ${hampi.district}\n💰 **Entry:** Indian ₹${hampi.entryFee.indianAdult} | Foreign ₹${hampi.entryFee.foreignAdult}\n⏱️ **Recommended Duration:** ${hampi.recommendedDuration}` : 'Hampi is a UNESCO World Heritage Site in Karnataka.';
  }

  if (q.includes('budget') || q.includes('cost') || q.includes('cheap') || q.includes('affordable')) {
    return `💰 **Budget Travel in Karnataka** (Estimated per person per day):\n\n**Economy:** ₹1,500–2,500/day\n- 🛏️ Hostel/Budget hotel: ₹500–800\n- 🍽️ Meals: ₹300–500\n- 🚌 Local transport: ₹200–400\n- 🎫 Entry fees: ₹100–300\n\n**Mid-range:** ₹3,000–6,000/day\n- 🏨 Mid-range hotel: ₹1,500–3,000\n- 🍽️ Meals: ₹600–1,000\n- 🚗 Private transport: ₹800–1,500\n\n**Premium:** ₹8,000+/day\n- 🏰 Heritage resort: ₹5,000+\n- 🍽️ Fine dining: ₹1,500+\n\n🆓 **Free destinations:** Many temples, beaches, and nature spots have no entry fee!\n\nTip: Travel during Oct-Feb for best weather and deals.`;
  }

  if (q.includes('coorg') || q.includes('kodagu') || q.includes('madikeri')) {
    const coorg = destinations.find(d => d.slug.includes('coorg') || d.slug.includes('abbey'));
    return `🌿 **Coorg (Kodagu)** — The Scotland of India\n\nCoorg is a lush hill district in Western Ghats, famous for:\n- ☕ Coffee plantations\n- 🌊 Abbey Falls & Raja's Seat\n- 🐘 Dubare Elephant Camp\n- 🌺 Botanical gardens\n\n**Getting there from Bengaluru (260 km):**\n🚗 Car: 5-6 hours via Mysuru Road\n🚌 Bus: KSRTC buses, 6-7 hours, ₹400-800\n\n🌤️ **Best time:** Oct-March\n⏱️ **Ideal duration:** 2-3 days\n\nMust-try: Coorgi Pandi Curry, Akki Roti!`;
  }

  if (q.includes('3 day') || q.includes('three day') || q.includes('plan') || q.includes('itinerary')) {
    return `📋 **3-Day Karnataka Itinerary**\n\n**Day 1 — Mysuru**\n🌅 Morning: Mysuru Palace & Chamundi Hills\n🌞 Afternoon: St. Philomena's Church, Devaraja Market\n🌆 Evening: Brindavan Gardens light show\n💰 Est. cost: ₹2,500/person\n\n**Day 2 — Mysuru → Coorg**\n🌅 Morning: Drive to Coorg (3 hrs)\n🌞 Afternoon: Abbey Falls, Raja's Seat\n🌆 Evening: Coffee plantation walk\n💰 Est. cost: ₹3,000/person\n\n**Day 3 — Coorg → Bengaluru**\n🌅 Morning: Dubare Elephant Camp\n🌞 Afternoon: Tibetan Monastery, Namdroling\n🌆 Evening: Drive back to Bengaluru\n💰 Est. cost: ₹2,500/person\n\n**Total: ~₹8,000-10,000/person** (mid-range)\nIncludes: Transport, food, stays, entry fees`;
  }

  if (q.includes('transport') || q.includes('how to reach') || q.includes('how to get') || q.includes('travel')) {
    return `🚆 **Getting Around Karnataka:**\n\n**From Bengaluru:**\n🚆 Train: Well-connected to Mysuru (3h), Hubli (8h), Mangaluru (10h)\n🚌 KSRTC Bus: Extensive network, book at ksrtc.in\n✈️ Flights: Bengaluru airport connects to Hubli, Mangaluru, Belagavi\n🚗 Car rental: ₹10-15/km for sedans\n\n**Popular Routes:**\n• Bengaluru → Mysuru: 150 km, 3h by train/road\n• Bengaluru → Hampi: 340 km, 6-7h by road\n• Bengaluru → Coorg: 260 km, 5-6h by road\n• Bengaluru → Gokarna: 490 km, 8-9h by road\n\n💡 **Tip:** KSRTC Airavat buses are comfortable and affordable for overnight journeys.`;
  }

  if (q.includes('entry') || q.includes('fee') || q.includes('ticket') || q.includes('price')) {
    const popular = destinations.slice(0, 6);
    let response = '🎫 **Entry Fees for Popular Karnataka Destinations:**\n\n';
    popular.forEach(d => {
      response += `**${d.name}:** Indian ₹${d.entryFee.indianAdult ?? 'Free'} | Foreign ₹${d.entryFee.foreignAdult ?? 'Free'}\n`;
    });
    response += '\n💡 Many temples, beaches and nature spots are **free to visit!**\n⚠️ Fees may change. Please verify before your visit.';
    return response;
  }

  if (q.includes('beach') || q.includes('gokarna') || q.includes('coast')) {
    return `🏖️ **Karnataka's Best Beaches:**\n\n1. **Gokarna** — Om Beach, Kudle Beach, Half Moon Beach\n   🕐 Open all day | 💰 Free\n2. **Murudeshwara** — Giant Shiva statue + beach\n3. **Karwar** — Peaceful beaches, island trips\n4. **Malpe Beach** — St. Mary's Island nearby\n5. **Maravanthe** — Road between river and sea\n\n🌤️ Best time: Oct-March\n🏄 Activities: Surfing, snorkeling, island hopping\n\nGokarna is the most popular — quieter alternative to Goa with stunning cliff beaches!`;
  }

  return `🧭 Thank you for your question about Karnataka! Here's what I can help with:\n\n📍 **Destinations** — Ask about any place in Karnataka\n📜 **History** — Learn about heritage sites\n💰 **Costs** — Entry fees, budgets, expenses\n🚆 **Transport** — How to reach any destination\n📋 **Itinerary** — Get trip planning suggestions\n🏖️ **Categories** — Beaches, hills, waterfalls, wildlife\n\nTry asking:\n• "Tell me about Hampi"\n• "Plan a 3-day Karnataka trip"\n• "What are the best beaches in Karnataka?"\n• "How to reach Coorg from Bengaluru?"`;
}

export default function ChatPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle initial query from URL
  useEffect(() => {
    const q = searchParams.get('q');
    const dest = searchParams.get('dest');
    if (q) {
      handleSend(q);
    } else if (dest) {
      const d = getDestinationBySlug(dest);
      if (d) handleSend(`Tell me about ${d.name}`);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response with delay
    setTimeout(() => {
      const response = generateDemoResponse(msg);
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'ai', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const sampleQuestions = [
    t('ai.sampleQ1'),
    t('ai.sampleQ2'),
    t('ai.sampleQ3'),
    t('ai.sampleQ4'),
    t('ai.sampleQ5'),
  ];

  return (
    <div className="chat-page">
      <div className="chat-page__header">
        <div className="container">
          <h1>🧭 {t('ai.askSiriPayana')}</h1>
          <p className="chat-page__demo-badge">⚡ {t('ai.demoMode')}</p>
        </div>
      </div>

      <div className="chat-page__body">
        <div className="chat-page__messages">
          {messages.length === 0 && (
            <div className="chat-page__welcome">
              <div className="chat-page__welcome-icon">🧭</div>
              <h2>{t('ai.title')}</h2>
              <p>{t('ai.subtitle')}</p>
              <div className="chat-page__suggestions">
                {sampleQuestions.map((q, i) => (
                  <button key={i} className="chat-page__suggestion" onClick={() => handleSend(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <motion.div
              key={msg.id}
              className={`chat-msg ${msg.role === 'user' ? 'chat-msg--user' : 'chat-msg--ai'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {msg.role === 'ai' && <div className="chat-msg__avatar">🧭</div>}
              <div className="chat-msg__bubble">
                <div className="chat-msg__content" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
              </div>
            </motion.div>
          ))}

          <AnimatePresence>
            {isTyping && (
              <motion.div className="chat-msg chat-msg--ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="chat-msg__avatar">🧭</div>
                <div className="chat-msg__bubble chat-msg__typing">
                  <span></span><span></span><span></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-page__input-bar" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('ai.placeholder')}
            className="chat-page__input"
            aria-label={t('ai.placeholder')}
          />
          <button type="submit" className="chat-page__send-btn" disabled={!input.trim()}>
            {t('ai.send')} ↑
          </button>
        </form>
      </div>
    </div>
  );
}

// Simple markdown-like formatting
function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}
