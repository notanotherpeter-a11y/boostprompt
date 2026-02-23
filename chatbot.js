/**
 * BoostBot — AI Sales Chatbot for boostprompt.dev
 * Powered by Gemini 2.5 Flash (free tier)
 * 
 * Rate limits (free): 15 req/min, 1500 req/day
 * If exhausted, shows fallback message
 */

(function() {
  const GEMINI_KEY = 'AIzaSyDI6a-OMWRTXkVOpYHO6eO_ISxKgtklerw';
  const MODEL = 'gemini-2.5-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  
  // Rate limit tracking
  let requestCount = parseInt(localStorage.getItem('bb_req_count') || '0');
  let requestDay = localStorage.getItem('bb_req_day') || '';
  const today = new Date().toDateString();
  if (requestDay !== today) { requestCount = 0; requestDay = today; }
  const MAX_DAILY = 100; // Stay well under 1500 limit (shared key)

  const SYSTEM_PROMPT = `You are BoostBot, a friendly AI sales assistant for BoostPrompt (boostprompt.dev).

Your job: Help visitors find the right AI toolkit for their business. Be helpful, direct, and concise (under 100 words per reply).

Products you sell:
1. 50 AI Prompts for Small Business — $19 (BESTSELLER, great starter)
2. AI Starter Bundle — $39 (everything you need)
3. Freelancer Toolkit — $29 (proposals, outreach, rates)
4. AI Email Templates — $14 (cheapest, quick win)
5. AI Business Playbook — $39 (complete strategy guide)
6. Notion AI Workspace — $29 (for Notion users)
7. Business-in-a-Box — $49 (start a business from scratch)
8. AI Agent Templates — $34 (build AI agents)
9. Automation Stacks Guide — $44 (Zapier/Make workflows)
10. Local Business AI Playbook — $29 (NEW! For restaurants, dentists, plumbers — 130+ industry-specific prompts)

Rules:
- Always recommend starting with the $19 pack or $14 emails
- For local businesses, recommend the Local Business Playbook ($29)
- Be enthusiastic but not pushy
- If they ask about something we don't have, suggest the closest product
- Never make up features that don't exist
- Keep replies SHORT and actionable
- End with a question or CTA when possible`;

  // Create chat UI
  const style = document.createElement('style');
  style.textContent = `
    #bb-toggle{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#f5a623,#ff6b35);border:none;color:#fff;font-size:28px;cursor:pointer;box-shadow:0 4px 15px rgba(245,166,35,0.4);z-index:10000;transition:transform .2s}
    #bb-toggle:hover{transform:scale(1.1)}
    #bb-toggle.open{transform:rotate(45deg)}
    #bb-chat{position:fixed;bottom:90px;right:20px;width:360px;max-width:90vw;height:480px;max-height:70vh;background:#1a1a2e;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.5);z-index:10000;display:none;flex-direction:column;overflow:hidden;border:1px solid #2a2a4a}
    #bb-chat.open{display:flex}
    #bb-header{background:linear-gradient(135deg,#f5a623,#ff6b35);padding:14px 16px;color:#fff;font-weight:700;font-size:15px;display:flex;align-items:center;gap:8px}
    #bb-header span{font-size:20px}
    #bb-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
    .bb-msg{max-width:85%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5;word-wrap:break-word}
    .bb-bot{background:#2a2a4a;color:#e0e0e0;align-self:flex-start;border-bottom-left-radius:4px}
    .bb-user{background:#f5a623;color:#000;align-self:flex-end;border-bottom-right-radius:4px;font-weight:500}
    .bb-typing{color:#888;font-style:italic;font-size:13px;padding:4px 14px}
    #bb-input-wrap{display:flex;padding:10px;gap:8px;border-top:1px solid #2a2a4a;background:#16213e}
    #bb-input{flex:1;background:#1a1a2e;border:1px solid #2a2a4a;color:#e0e0e0;padding:10px 14px;border-radius:20px;font-size:14px;outline:none}
    #bb-input:focus{border-color:#f5a623}
    #bb-send{background:#f5a623;border:none;color:#000;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:16px;font-weight:700}
    #bb-send:hover{background:#ff6b35}
    @media(max-width:480px){#bb-chat{width:calc(100vw - 20px);right:10px;bottom:80px;height:60vh}}
  `;
  document.head.appendChild(style);

  const toggle = document.createElement('button');
  toggle.id = 'bb-toggle';
  toggle.innerHTML = '💬';
  toggle.title = 'Chat with BoostBot';
  document.body.appendChild(toggle);

  const chat = document.createElement('div');
  chat.id = 'bb-chat';
  chat.innerHTML = `
    <div id="bb-header"><span>🤖</span> BoostBot — AI Product Assistant</div>
    <div id="bb-msgs"></div>
    <div id="bb-input-wrap">
      <input id="bb-input" type="text" placeholder="Ask about our AI toolkits..." autocomplete="off">
      <button id="bb-send">→</button>
    </div>
  `;
  document.body.appendChild(chat);

  const msgs = document.getElementById('bb-msgs');
  const input = document.getElementById('bb-input');
  const sendBtn = document.getElementById('bb-send');
  let history = [];

  // Welcome message
  addMsg('bot', "Hey! 👋 I'm BoostBot. I help you find the perfect AI toolkit for your business. What kind of business do you run?");

  toggle.addEventListener('click', () => {
    const open = chat.classList.toggle('open');
    toggle.classList.toggle('open');
    toggle.innerHTML = open ? '✕' : '💬';
    if (open) input.focus();
  });

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  function addMsg(type, text) {
    const div = document.createElement('div');
    div.className = `bb-msg bb-${type}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'bb-typing';
    div.id = 'bb-typing';
    div.textContent = 'BoostBot is thinking...';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('bb-typing');
    if (el) el.remove();
  }

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    
    input.value = '';
    addMsg('user', text);
    
    // Rate limit check
    if (requestCount >= MAX_DAILY) {
      addMsg('bot', "I've reached my daily limit! 😅 Browse our products above or email us at hello@boostprompt.dev for help. I'll be back tomorrow!");
      return;
    }

    showTyping();
    
    history.push({ role: 'user', parts: [{ text }] });
    
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: history,
          generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
        })
      });
      
      const data = await resp.json();
      
      if (data.error) {
        if (data.error.code === 429) {
          hideTyping();
          addMsg('bot', "I'm taking a quick break (too many chats!). Browse our products above or come back in a minute! 😊");
          return;
        }
        throw new Error(data.error.message);
      }
      
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I had a brain glitch! Try asking again.";
      
      history.push({ role: 'model', parts: [{ text: reply }] });
      
      // Track usage
      requestCount++;
      localStorage.setItem('bb_req_count', requestCount.toString());
      localStorage.setItem('bb_req_day', today);
      
      hideTyping();
      addMsg('bot', reply);
      
    } catch (err) {
      hideTyping();
      addMsg('bot', "Oops, something went wrong. Check out our products above or try again in a moment!");
      console.error('BoostBot error:', err);
    }
  }
})();
