(()=>{
  'use strict';
  const form=document.querySelector('#shop-ai-form'), input=document.querySelector('#shop-ai-input'), messages=document.querySelector('#shop-ai-messages');
  if(!form||!input||!messages)return;
  const button=form.querySelector('button'), section=document.querySelector('#assistant'), title=document.querySelector('#shop-ai-title');
  const base='https://gershom92.github.io/9t-kitchenware/', whatsapp='https://wa.me/256784891092', catalog='https://take.app/gershommuwanguzi92';
  // Product labels and links from the audited shop pages. This is not a live inventory feed.
  const products=[
    {name:'Real Crest 6L Air Fryer',path:'real-crest-6l-air-fryer.html',re:/\b(air\s*fryers?|real\s*crest)\b/i,price:'The Real Crest 6L air fryer was listed at USh 145,000 on 25 November 2026; please confirm the current price.'},
    {name:'7-Piece Aluminium Saucepan Set',path:'7-piece-aluminium-saucepan-set.html',re:/\b(saucepans?|7[ -]?piece|seven[ -]?piece)\b/i},
    {name:'11-Piece Non-Stick Granite Cookware Set',path:'11-piece-non-stick-granite-cookware-set.html',re:/\b(granite|non[ -]?stick|11[ -]?piece)\b/i},
    {name:'Aluminium Cooking Pot Set',path:'aluminium-cooking-pot-set.html',re:/\b(aluminium|aluminum)\b.*\b(pots?|cookware)\b|\b(pots?)\b.*\b(aluminium|aluminum)\b/i},
    {name:'Green-Handled Cookware Set',path:'green-handled-cookware-set.html',re:/\bgreen[ -]?(handled?|pots?|cookware)\b/i},
    {name:'Seemann Cookware Set',path:'seemann-cookware-set.html',re:/\bseemann\b/i},
    {name:'Gold-Trim Glass Set with Decorative Stand',path:'gold-trim-glass-set-with-decorative-stand.html',re:/\b(gold|deer|decorative)\b.*\b(glass|glasses|stand)\b|\b(glass|glasses)\b.*\b(gold|deer)\b/i},
    {name:'Classic Red Wine Glass Set',path:'classic-red-wine-glass-set.html',re:/\b(wine\s*glasses?|red\s*wine)\b/i},
    {name:'Classic Champagne Flute Glass Set',path:'classic-champagne-flute-glass-set.html',re:/\b(champagne|flutes?)\b/i},
    {name:'Classic Whiskey Tumbler Glass',path:'classic-whiskey-tumbler-glass.html',re:/\b(whisk(?:ey|y)|tumblers?)\b/i},
    {name:'Heavy-Base Shot Glass Set',path:'heavy-base-shot-glass-set.html',re:/\b(shot\s*glasses?|shot\s*glass|shot\s*set)\b/i},
    {name:'Stainless Steel Double-Walled Ice Bucket Set',path:'stainless-steel-double-walled-ice-bucket-set.html',re:/\b(stainless|steel)\b.*\b(ice\s*bucket|bucket)\b/i},
    {name:'Clear Acrylic Wine & Ice Bucket Tub',path:'clear-acrylic-wine-ice-bucket-tub.html',re:/\b(acrylic|tub)\b.*\b(ice|wine|bucket)\b/i},
    {name:'Black Marble-Style Cutlery Set with Stand',path:'black-marble-style-cutlery-set-with-stand.html',re:/\b(cutlery|forks?|spoons?)\b/i},
    {name:'Multi-Functional Vegetable Chopper & Slicer Set',path:'vegetable-chopper-slicer.html',re:/\b(choppers?|slicers?)\b/i},
    {name:'Digital Food & Liquid Thermometer (TP300)',path:'digital-food-liquid-thermometer-tp300.html',re:/\b(thermometers?|tp300)\b/i},
    {name:'Commercial Blender',path:'commercial-blender.html',re:/\b(blenders?|blending)\b/i},
    {name:'Hoffmans Digital Electric Pressure Cooker',path:'hoffmans-digital-electric-pressure-cooker.html',re:/\b(pressure\s*cookers?|hoffmans?)\b/i}
  ];
  const link=(label,url)=>({label,url});
  function add(text,role,links){
    const div=document.createElement('div');div.className='shop-ai__message shop-ai__'+role;
    div.append(document.createTextNode(text));
    if(links&&links.length){const list=document.createElement('div');links.forEach((item,i)=>{if(i)list.append(document.createTextNode(' · '));const a=document.createElement('a');a.textContent=item.label;a.href=item.url;if(item.url.startsWith('https://wa.me/')||item.url.startsWith('https://take.app/')){a.target='_blank';a.rel='noopener noreferrer';}list.append(a);});div.append(list);}
    messages.append(div);messages.scrollTop=messages.scrollHeight;
  }
  function reply(raw){
    const q=raw.toLowerCase().replace(/\s+/g,' ').trim();
    if(/\b(password|passcode|otp|pin number|credit card|card number|cvv|bank account)\b/i.test(q))return {text:'For your safety, please do not share passwords, OTPs or payment details here. For an order, contact the shop on WhatsApp.',links:[link('WhatsApp',whatsapp)]};
    const parts=[], links=[];
    if(/\b(where|location|located|address|directions|find (?:the |your )?shop|visit|map)\b/.test(q)){parts.push('Find us at Nyumba Nkubwa, shop Lp129, basement level, Ben Kiwanuka Street, Kampala.');links.push(link('Map','https://maps.app.goo.gl/cMfgcpEnUDdg8Cww5'));}
    if(/\b(hours?|open(?:ing)?|clos(?:e|ing)|time)\b/.test(q)&&!/\b(delivery|deliver|arrival)\b/.test(q))parts.push('Open every day, 8:00am–6:59pm Uganda time.');
    if(/\b(deliver\w*|ship\w*|transport|dispatch)\b/.test(q)){parts.push('Delivery is available throughout Uganda, usually in about 2 days. Fees depend on the destination; please confirm the fee and timing. Around Kampala, cash on delivery is accepted; outside Kampala, mobile money is accepted.');links.push(link('Ask on WhatsApp',whatsapp));}
    if(/\b(return\w*|refund\w*|exchange\w*|faulty|damaged|broken)\b/.test(q)){parts.push('For direct purchases, faulty or damaged items may be exchanged within 7 days after delivery.');links.push(link('Ask on WhatsApp',whatsapp));}
    if(/\b(pay(?:ment)?|cash on delivery|mobile money)\b/.test(q)&&!/\b(deliver\w*|ship\w*|transport|dispatch)\b/.test(q)){parts.push('For direct deliveries around Kampala, cash on delivery is accepted; outside Kampala, mobile money is accepted. Please confirm the details with us.');links.push(link('Ask on WhatsApp',whatsapp));}
    const specific=products.filter(p=>p.re.test(q));
    let matches=specific;
    if(!matches.length&&/\b(glasses|glassware|drinking glass|glass sets?)\b/.test(q))matches=products.filter(p=>/glass/i.test(p.name)).slice(0,3);
    if(!matches.length&&/\b(pots?|cookware|saucepans?|pans?)\b/.test(q))matches=[products[1],products[3],products[2]];
    if(!matches.length&&/\b(ice bucket|ice buckets)\b/.test(q))matches=[products[10],products[11]];
    // Do not imply the listed 6L model matches a different requested capacity.
    const capacities=[...q.matchAll(/\b(\d+(?:\.\d+)?)\s*(?:l|lit(?:re|er)s?)\b/ig)].map(m=>Number(m[1]));
    if(matches.some(p=>p.path==='real-crest-6l-air-fryer.html')&&capacities.length&&!capacities.includes(6)){
      matches=matches.filter(p=>p.path!=='real-crest-6l-air-fryer.html');
      parts.push('Please ask us to confirm whether an air fryer in that size is available.');links.push(link('Ask on WhatsApp',whatsapp));
    }
    if(matches.length){
      matches=matches.slice(0,3);parts.push(matches.length===1?'Our website lists this item:':'Here are some items listed on our website:');
      matches.forEach(p=>links.push(link(p.name,base+p.path)));
      if(matches.length===1&&matches[0].price&&/\b(price|cost|how much|shillings?|ugx)\b/.test(q))parts.push(matches[0].price);
      parts.push('Please confirm availability, current price and details with the shop.');links.push(link('Ask on WhatsApp',whatsapp));
    }
    if(!parts.length){
      parts.push('What would you like help with? You can ask about glasses, saucepans, an air fryer, delivery or our location. For other items, please check the catalogue or ask us.');
      links.push(link('Browse catalogue',catalog),link('WhatsApp',whatsapp));
    }
    return {text:parts.join(' '),links:links.filter((v,i,a)=>a.findIndex(x=>x.url===v.url)===i)};
  }
  // The Worker is left unchanged. This transparent local guide avoids unsupported model claims.
  if(title)title.textContent='Shopping helper';
  const notice=section&&section.querySelector('.shop-ai__notice');
  if(notice)notice.textContent='This guide uses saved shop information, not AI or live stock. Confirm prices, availability and delivery before ordering. Please do not send payment details, passwords, OTPs or your home address here.';
  const greeting=messages.querySelector('.shop-ai__bot');if(greeting)greeting.textContent='Hi! I can help you find listed products and answer common shop questions.';
  messages.setAttribute('aria-label','Shopping helper conversation');if(button)button.textContent='Ask helper';
  const nav=document.querySelector('a[href="#assistant"]');if(nav)nav.textContent='Shopping helper';
  form.addEventListener('submit',event=>{event.preventDefault();const text=input.value.trim();if(!text)return;
    if(/\b(password|passcode|otp|pin number|credit card|card number|cvv|bank account)\b/i.test(text))add('Sensitive details not displayed.','user');else add(text,'user');
    input.value='';const result=reply(text);add(result.text,'bot',result.links);input.focus();
  });
})();
