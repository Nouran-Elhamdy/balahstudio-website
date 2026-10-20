(() => {
'use strict';
const $ = (id) => document.getElementById(id);
// A draft belongs to the specific index.html from which it was started.
// Public pages ALWAYS use the data embedded in index.html, not a visitor's old draft.
const STORAGE_KEY = 'balah-studio-draft-v3-source-aware';
const LEGACY_STORAGE_KEY = 'balah-studio-draft-v2-fullhero';
const editAllowed = new URLSearchParams(location.search).has('edit');
const initial = JSON.parse($('site-initial-data').textContent);
const sourceSignature = (() => {
 let h = 2166136261;
 for (const ch of JSON.stringify(initial)) {h ^= ch.charCodeAt(0);h = Math.imul(h, 16777619);}
 return (h >>> 0).toString(36);
})();
let state = structuredClone(initial);
if (editAllowed) {
 try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && saved.sourceSignature === sourceSignature && saved.state) state = saved.state;
 } catch (e) { console.warn('Could not load browser draft:', e); }
}
// Keep loaded backups compatible when new controls are added.
state.content = {...initial.content, ...state.content};
// Existing settings backups may have no uploaded pillar icons yet.
state.content.pillars=(Array.isArray(state.content.pillars)?state.content.pillars:initial.content.pillars).map((p,i)=>({...initial.content.pillars[i],...p,image:p.image??''}));
state.pillarIconSize=Math.min(120,Math.max(20,Number(state.pillarIconSize??initial.pillarIconSize??41)||41));
state.fonts = {...initial.fonts, ...state.fonts};
state.assets = {...initial.assets, ...state.assets};
// Per-game logo dimensions and offsets are independent and export with site data.
const defaultGameLogoStyle = {width:270,height:112,marginTop:13,marginRight:0,marginBottom:15,marginLeft:0};
const defaultScreenshotStyle = {width:440,height:280,marginTop:0,marginRight:0,marginBottom:0,marginLeft:0};
const withLogoLayout = (g) => ({...g,logo:g.logo ?? '',logoStyle:{...defaultGameLogoStyle,...(g.logoStyle||{})},screenshotStyle:{...defaultScreenshotStyle,...(g.screenshotStyle||{})}});
state.games = Array.isArray(state.games)?state.games.map(withLogoLayout):structuredClone(initial.games).map(withLogoLayout);
state.colors = {...initial.colors, ...state.colors};
state.typography = {...initial.typography, ...state.typography};
// Merge new CTA controls into older browser drafts and imported settings without erasing any existing changes.
const incomingHeroButtons = state.heroButtons || {};
state.heroButtons = {
 ...structuredClone(initial.heroButtons), ...incomingHeroButtons,
 primary:{...initial.heroButtons.primary,...(incomingHeroButtons.primary||{})},
 secondary:{...initial.heroButtons.secondary,...(incomingHeroButtons.secondary||{})}
};
state.heroFadeStart = Number.isFinite(Number(state.heroFadeStart)) ? Math.min(98,Math.max(55,Number(state.heroFadeStart))) : 82;
if (!Array.isArray(state.games) || !state.games.length) state.games = structuredClone(initial.games);
const icons = {
 gamepad:'<svg viewBox="0 0 24 24"><path d="M7 7h10a5 5 0 0 1 4.8 4l1 6a3 3 0 0 1-4.8 3L15 17H9l-3 3a3 3 0 0 1-4.8-3l1-6A5 5 0 0 1 7 7zm.5 3v5m-2.5-2.5h5" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="16.5" cy="12" r="1"/><circle cx="19" cy="14" r="1"/></svg>',
 sprout:'<svg viewBox="0 0 24 24"><path d="M12 21V9m0 6C6 15 4 11 3 8c6-.5 9 2 9 7zm0-8c0-4 3-6 7-7 0 4-1 7-7 7zm0 12c5-1 7-4 8-8-5 0-8 2-8 8z" stroke="currentColor" fill="none" stroke-width="1.8" stroke-linecap="round"/></svg>',
 moon:'<svg viewBox="0 0 24 24"><path d="M19.2 16.7A9 9 0 0 1 7.3 4.8 9.2 9.2 0 1 0 19.2 16.7z" fill="currentColor"/><path d="m18 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor"/></svg>',
 heart:'<svg viewBox="0 0 24 24"><path d="M12 21s-9-5.7-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.3-9 12-9 12z" fill="currentColor"/></svg>'
};
function saveDraft(){
 try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({sourceSignature, state}));
  const status=$('saveStatus');if(status)status.textContent='Browser draft saved. Export index.html to make your changes permanent.';
 } catch(e) {
  console.warn('Draft not stored:',e);
  const status=$('saveStatus');if(status)status.textContent='Browser storage may be full. Export index.html and back up your settings (JSON) now.';
 }
}
const setText = (id, text) => { const el = $(id); if(el) el.textContent = text ?? ''; };
const setImage = (id, src) => { const el = $(id); if(el && src) el.src = src; };
const getActiveGame = () => state.games[Math.max(0, Math.min(state.games.length - 1, Number(state.selectedGame)||0))];
const selectedTheme = () => state.theme === 'dark' ? 'dark' : 'light';
const hexMix = (a,b,t) => {
 const v=h=>h.replace('#',''); const A=v(a), B=v(b); if(A.length!==6 || B.length!==6) return a;
 const channel=i=>Math.round(parseInt(A.slice(i,i+2),16)*t+parseInt(B.slice(i,i+2),16)*(1-t)).toString(16).padStart(2,'0');
 return `#${channel(0)}${channel(2)}${channel(4)}`;
};
function render() {
 const root=document.documentElement, dark=selectedTheme()==='dark', game=getActiveGame();
 root.dataset.theme=dark?'dark':'light';
 root.style.setProperty('--body-font', `"${state.fonts.body}",sans-serif`);
 root.style.setProperty('--heading-font', `"${state.fonts.heading}",Georgia,serif`);
 root.style.setProperty('--body-size', `${state.typography.size}px`);
 root.style.setProperty('--text-line-height', `${state.typography.lineHeight}`);
 root.style.setProperty('--text-letter-spacing', `${state.typography.letterSpacing}px`);
 root.style.setProperty('--section-gap', `${state.spacing}px`);
 root.style.setProperty('--hero-fade-start', `${state.heroFadeStart}%`);
 const ctaControls=state.heroButtons;
 root.style.setProperty('--hero-cta-x', `${ctaControls.positionX}%`);
 root.style.setProperty('--hero-cta-y', `${ctaControls.positionY}%`);
 root.style.setProperty('--hero-cta-gap', `${ctaControls.gap}px`);
 for (const type of ['primary','secondary']) {
  const opt=ctaControls[type];
  const el=$(type==='primary'?'heroGamesButton':'heroAboutButton');
  el.style.width=`${opt.width}px`;
  el.style.height=`${opt.height}px`;
  el.style.backgroundColor=dark?opt.darkBg:opt.lightBg;
  el.style.color=dark?opt.darkText:opt.lightText;
  el.style.borderColor=dark?opt.darkBorder:opt.lightBorder;
  setText(type==='primary'?'heroGamesText':'heroAboutText',opt.text);
 }
 root.style.setProperty('--gold', state.colors.gold);
 root.style.setProperty('--paper', state.colors.lightBg);
 root.style.setProperty('--dark', state.colors.darkBg);
 root.style.setProperty('--page-bg', dark?state.colors.darkBg:state.colors.lightBg);
 root.style.setProperty('--panel', dark?state.colors.darkBg:state.colors.lightBg);
 const tint = dark?(game.tintDark||'#182541'):(game.tintLight||'#f6c6c8');
 root.style.setProperty('--game-tint', tint);
 root.style.setProperty('--game-tint-strength', `${Number(game.tintStrength??58)}%`);
 // Custom section backgrounds can be adjusted independently from the illustrations.
 document.querySelector('.hero').style.background=dark?`linear-gradient(120deg,${hexMix(state.colors.darkBg,'#11243a',.73)},${hexMix(state.colors.darkBg,'#1d2840',.83)})`:`linear-gradient(120deg,${hexMix(state.colors.lightBg,'#f6e7d0',.45)},${state.colors.lightBg})`;
 setImage('navLogo',state.assets[dark?'logoDark':'logoLight']);
 setImage('heroArtwork',state.assets[dark?'heroDark':'heroLight']);
 const m=state.assets[dark?'heroDarkMobile':'heroLightMobile'];
 const mobile=$('heroMobileSource');
 if(m){mobile.srcset=m;}else{mobile.removeAttribute('srcset');}
 $('heroArtwork').alt=dark?'BALAH Studio full-width dark hero banner':'BALAH Studio full-width light hero banner';
 setImage('storyArtwork',state.assets[dark?'storyDark':'storyLight']);
 setText('tagline',state.content.tagline);
 setText('intro',state.content.intro);
 setText('aboutEyebrow',state.content.aboutEyebrow);
 setText('aboutHeading',state.content.aboutHeading);
 setText('aboutBody',state.content.aboutBody);
 setText('contactHeading',state.content.contactHeading);
 setText('contactText',state.content.contactText);
 setText('copyrightYear',new Date().getFullYear());
 const email=(state.content.contactEmail||'').trim(), link=$('contactLink'), button=$('contactButton');
 const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 link.hidden=!validEmail;
 button.hidden=!validEmail;
 setText('contactButtonText',state.content.contactButton||'Send an email');
 if(validEmail){link.textContent=email;link.href=`mailto:${email}`;button.href=`mailto:${email}`;}
 else{link.textContent='';link.removeAttribute('href');button.removeAttribute('href');}
 const contactHint=$('contactEditorHint');
 if(contactHint)contactHint.hidden=validEmail||$('editor').hidden;
 root.style.setProperty('--pillar-icon-size',`${state.pillarIconSize}px`);
 for(let i=0;i<4;i++){
  const p=state.content.pillars[i]||initial.content.pillars[i];
  setText(`pillarTitle${i}`,p.title);setText(`pillarDesc${i}`,p.desc);
  const el=$(`pillarIcon${i}`);
  if(p.image){
   // Use DOM construction, not innerHTML, for uploaded data URLs.
   let img=el.querySelector('img');
   if(!img){img=document.createElement('img');img.alt='';img.setAttribute('aria-hidden','true');el.replaceChildren(img);}
   img.src=p.image;
  } else {el.innerHTML=icons[p.icon]||icons.heart;}
 }
 setText('featureTitle',game.title);
 const gameLogo=$('gameLogo'), titleHeading=$('featureTitle');
 if(game.logo){gameLogo.hidden=false;gameLogo.src=game.logo;gameLogo.alt=`${game.title} logo`;titleHeading.classList.add('sr-only');}
 else{gameLogo.hidden=true;gameLogo.removeAttribute('src');titleHeading.classList.remove('sr-only');}
 const logoLayout={...defaultGameLogoStyle,...(game.logoStyle||{})};
 // Fit inside the chosen box without stretching or cropping the actual uploaded logo.
 gameLogo.style.width=`${logoLayout.width}px`;
 gameLogo.style.height=`${logoLayout.height}px`;
 gameLogo.style.maxHeight='none';
 gameLogo.style.objectFit='contain';
 $('gameLogoSlot').style.margin=`${logoLayout.marginTop}px ${logoLayout.marginRight}px ${logoLayout.marginBottom}px ${logoLayout.marginLeft}px`;
 setText('gameKicker',game.kicker);
 setText('gameDescription',game.description);
 const cta=$('viewGame');cta.firstChild.textContent=(game.button||'Discover the game')+' ';
 setImage('gameImage',game.image);
 $('gameImage').alt = `${game.title} screenshot`;
 const screenshotLayout={...defaultScreenshotStyle,...(game.screenshotStyle||{})};
 const screenshot=$('gameImage'),artSlot=$('gameArtSlot');
 screenshot.style.width=`${screenshotLayout.width}px`;
 screenshot.style.height=`${screenshotLayout.height}px`;
 screenshot.style.margin=`${screenshotLayout.marginTop}px ${screenshotLayout.marginRight}px ${screenshotLayout.marginBottom}px ${screenshotLayout.marginLeft}px`;
 screenshot.style.objectFit='contain';
 artSlot.style.minHeight=`${Math.max(220,screenshotLayout.height+Math.max(0,screenshotLayout.marginTop)+Math.max(0,screenshotLayout.marginBottom))}px`;
 const dots=$('gameDots');dots.replaceChildren();
 state.games.forEach((g,i)=>{const dot=document.createElement('button');dot.className=(i===state.selectedGame?'active':'');dot.type='button';dot.title=`Show ${g.title}`;dot.setAttribute('aria-label',`Show game ${i+1}: ${g.title}`);dot.onclick=()=>{state.selectedGame=i;render();saveDraft()};dots.append(dot);});
 $('prevGame').disabled=state.games.length<2;$('nextGame').disabled=state.games.length<2;
 const toggle=$('themeToggle');toggle.setAttribute('aria-pressed',String(dark));toggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
 document.querySelector('meta[name="theme-color"]').content=dark?state.colors.darkBg:state.colors.lightBg;
}
$('themeToggle').addEventListener('click',()=>{state.theme=selectedTheme()==='dark'?'light':'dark';render();saveDraft();});
$('prevGame').addEventListener('click',()=>{state.selectedGame=(state.selectedGame+state.games.length-1)%state.games.length;render();saveDraft();});
$('nextGame').addEventListener('click',()=>{state.selectedGame=(state.selectedGame+1)%state.games.length;render();saveDraft();});
$('mobileMenuToggle').addEventListener('click',()=>{let nav=$('mainNav');nav.classList.toggle('expanded');$('mobileMenuToggle').setAttribute('aria-expanded',String(nav.classList.contains('expanded')));});
$('mainNav').addEventListener('click',(ev)=>{if(ev.target.closest('a')){$('mainNav').classList.remove('expanded');$('mobileMenuToggle').setAttribute('aria-expanded','false');}});
$('viewGame').addEventListener('click',()=>{let g=getActiveGame();setText('dialogTitle',g.title);setText('dialogKicker',g.kicker);setText('dialogDescription',g.description);setImage('dialogImage',g.image);$('gameDialog').showModal()});
$('closeDialog').addEventListener('click',()=>$('gameDialog').close());
$('gameDialog').addEventListener('click',(ev)=>{if(ev.target===$('gameDialog'))$('gameDialog').close();});
const esc=(v)=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function field(label,path,value,type='text',hint=''){
 const id=`edit-${path.replaceAll('.','-')}`;
 const input=type==='textarea'?`<textarea data-path="${path}" id="${id}" rows="3">${esc(value)}</textarea>`:
 type==='select'?`<select data-path="${path}" id="${id}">${value.options.map(o=>`<option value="${esc(o)}" ${o===value.current?'selected':''}>${esc(o)}</option>`).join('')}</select>`:
 `<input data-path="${path}" id="${id}" type="${type}" value="${esc(value)}" ${type==='range'?'min="0" max="100" step="1"':''} />`;
 return `<label class="edit-field" for="${id}"><span>${esc(label)}</span>${input}</label>${hint?`<p class="edit-hint">${esc(hint)}</p>`:''}`;
}
function colorField(label,path){return field(label,path,path.split('.').reduce((acc,key)=>acc?.[key],state),'color');}
function imageUpload(label,assetPath,imageSrc){return `<label class="edit-field editor-file"><span>${esc(label)}</span><input type="file" accept="image/*" data-upload="${esc(assetPath)}"/><div class="edit-hint" style="margin:6px 0 0">Current: ${esc((imageSrc||'').startsWith('data:')?'Uploaded image':(imageSrc||'').split('/').pop())}</div></label>`;}
const bodyFonts=['DM Sans','Manrope','Inter','Nunito Sans','Plus Jakarta Sans','Lato','Cairo'];
const headingFonts=['Cormorant Garamond','DM Serif Display','Libre Baskerville','Manrope','DM Sans','Nunito Sans','Cairo'];
let activeTab='content';
function editorPanel(tab=activeTab){activeTab=tab;document.querySelectorAll('.editor-tabs button').forEach(b=>b.classList.toggle('chosen',b.dataset.panel===tab));let html='';
 if(tab==='content'){
  const c=state.content;
  html+=`<div class="edit-group"><h4>Homepage hero</h4><div class="editor-note">The studio name, slogan and hero description are part of the full banner IMAGE. The two hero buttons are separate, clickable HTML elements, editable below and in Style → Hero buttons. Avoid including a navbar or buttons inside your uploaded hero image.</div>${field('First button text','heroButtons.primary.text',state.heroButtons.primary.text)}${field('Second button text','heroButtons.secondary.text',state.heroButtons.secondary.text)}<p class="edit-hint">The first button opens Games; the second opens About.</p></div>`;
  html+=`<div class="edit-group"><h4>About BALAH</h4>${field('Section label','content.aboutEyebrow',c.aboutEyebrow)}${field('Heading','content.aboutHeading',c.aboutHeading,'textarea')}${field('Description','content.aboutBody',c.aboutBody,'textarea')}</div>`;
  html+=`<div class="edit-group"><h4>Studio values · all editable</h4>`;
  c.pillars.forEach((p,i)=>{html+=field(`Value ${i+1} heading`,`content.pillars.${i}.title`,p.title)+field(`Value ${i+1} description`,`content.pillars.${i}.desc`,p.desc,'textarea')});
  html+=`</div><div class="edit-group"><h4>Contact</h4>${field('Contact heading','content.contactHeading',c.contactHeading)}${field('Contact description','content.contactText',c.contactText,'textarea')}${field('Contact button text','content.contactButton',c.contactButton||'Send an email')}${field('Email address','content.contactEmail',c.contactEmail||'','email','Leave blank for now. The public contact button appears after you add a valid address and publish the updated HTML.')}</div>`;
 }
 if(tab==='design'){
  html+=`<div class="edit-group"><h4>Live typography</h4>${field('Body font','fonts.body',{current:state.fonts.body,options:bodyFonts},'select')}${field('Heading font','fonts.heading',{current:state.fonts.heading,options:headingFonts},'select')}${field('Paragraph size (px)','typography.size',state.typography.size,'number')}${field('Line height','typography.lineHeight',state.typography.lineHeight,'number')}${field('Letter spacing (px)','typography.letterSpacing',state.typography.letterSpacing,'number')}</div>`;
  html+=`<div class="edit-group"><h4>Layout</h4>${field('Section spacing (px)','spacing',state.spacing,'number','Change space around feature, values, and story sections.')}${field('Hero fade start (%)','heroFadeStart',state.heroFadeStart,'range','Lower values fade the banner earlier; higher values keep more artwork visible.')}</div>`;
  const hb=state.heroButtons;
  html+=`<div class="edit-group"><h4>Hero buttons · live styling</h4><p class="edit-hint">These buttons sit over your uploaded hero picture. Change either button without regenerating the image.</p>${field('Horizontal position (%)','heroButtons.positionX',hb.positionX,'number')}${field('Vertical position (%)','heroButtons.positionY',hb.positionY,'number')}${field('Space between buttons (px)','heroButtons.gap',hb.gap,'number')}</div>`;
  for(const type of ['primary','secondary']){
   const opt=hb[type],pre='heroButtons.'+type+'.';
   html+=`<div class="edit-group"><h4>${type==='primary'?'Our Games':'About Us'} button</h4>${field('Label',pre+'text',opt.text)}${field('Width (px)',pre+'width',opt.width,'number')}${field('Height (px)',pre+'height',opt.height,'number')}${colorField('Light background',pre+'lightBg')}${colorField('Light text',pre+'lightText')}${colorField('Light border',pre+'lightBorder')}${colorField('Dark background',pre+'darkBg')}${colorField('Dark text',pre+'darkText')}${colorField('Dark border',pre+'darkBorder')}</div>`;
  }
  html+=`<div class="edit-group"><h4>About cards · icons</h4>${field('Global icon size (px)','pillarIconSize',state.pillarIconSize,'number','Changes all four card icons together, in light and dark modes. Upload custom icons in Images.')}</div>`;
  html+=`<div class="edit-group"><h4>Brand colors</h4>${colorField('Accent gold','colors.gold')}${colorField('Light mode cream','colors.lightBg')}${colorField('Dark mode navy','colors.darkBg')}</div>`;
  html+=`<div class="editor-actions"><button class="editor-btn" data-action="toggle-theme">Preview other mode ☼ / ☾</button></div>`;
 }
 if(tab==='games'){
  let g=getActiveGame();
  html+=`<div class="edit-group"><h4>Your games (${state.games.length})</h4><ul class="game-list">${state.games.map((item,i)=>`<li><button data-game-index="${i}" class="${i===state.selectedGame?'chosen':''}">${i+1}. ${esc(item.title)}</button></li>`).join('')}</ul><div class="editor-actions"><button class="editor-btn primary" data-action="add-game">+ Add another game</button><button class="editor-btn danger" data-action="remove-game" ${state.games.length===1?'disabled':''}>Remove selected</button></div></div>`;
  const root=`games.${state.selectedGame}`;
  html+=`<div class="edit-group"><h4>Selected game's content</h4>${field('Game title',root+'.title',g.title)}${field('Eyebrow / status',root+'.kicker',g.kicker)}${field('Description',root+'.description',g.description,'textarea')}${field('Button label',root+'.button',g.button||'Discover the game')}</div>`;
  html+=`<div class="edit-group"><h4>Game tint · theme-specific</h4>${field('Light mode tint',root+'.tintLight',g.tintLight||'#f6c6c8','color')}${field('Dark mode tint',root+'.tintDark',g.tintDark||'#182541','color')}${field('Tint strength',root+'.tintStrength',g.tintStrength??58,'range')}<p class="edit-hint">The tint changes the game card, not colors painted into uploaded artwork.</p><button class="editor-btn" data-action="toggle-theme">Preview other mode ☼ / ☾</button></div>`;
  const logoStyle={...defaultGameLogoStyle,...(g.logoStyle||{})},lroot=root+'.logoStyle.';
  html+=`<div class="edit-group"><h4>Game logo · image and layout</h4>${imageUpload('Game title logo (PNG / WebP recommended)',root+'.logo',g.logo)}<p class="edit-hint">The size and margins below update the preview immediately and are saved for this game only. Transparent PNG / WebP recommended.</p>${field('Logo width (px)',lroot+'width',logoStyle.width,'number')}${field('Logo height (px)',lroot+'height',logoStyle.height,'number')}${field('Top margin (px)',lroot+'marginTop',logoStyle.marginTop,'number')}${field('Right margin (px)',lroot+'marginRight',logoStyle.marginRight,'number')}${field('Bottom margin (px)',lroot+'marginBottom',logoStyle.marginBottom,'number')}${field('Left margin (px)',lroot+'marginLeft',logoStyle.marginLeft,'number')}<div class="editor-actions"><button class="editor-btn" data-action="reset-game-logo-layout">Reset logo size and margins</button><button class="editor-btn" data-action="clear-game-logo">Use text title instead</button></div><p class="edit-hint">The logo retains its natural proportions inside the width × height area (no stretching). The game title remains available for accessibility. Negative margins can shift the logo closer to other elements.</p></div>`;
  const shotStyle={...defaultScreenshotStyle,...(g.screenshotStyle||{})},sroot=root+'.screenshotStyle.';
  html+=`<div class="edit-group"><h4>Game showcase · one image</h4>${imageUpload('Featured game screenshot / graphic',root+'.image',g.image)}<p class="edit-hint">Only this single image will appear in the showcase. The old second screenshot and the floating heart, star and circle have been removed.</p>${field('Screenshot width (px)',sroot+'width',shotStyle.width,'number')}${field('Screenshot height (px)',sroot+'height',shotStyle.height,'number')}${field('Top margin (px)',sroot+'marginTop',shotStyle.marginTop,'number')}${field('Right margin (px)',sroot+'marginRight',shotStyle.marginRight,'number')}${field('Bottom margin (px)',sroot+'marginBottom',shotStyle.marginBottom,'number')}${field('Left margin (px)',sroot+'marginLeft',shotStyle.marginLeft,'number')}<button class="editor-btn" data-action="reset-game-screenshot-layout">Reset screenshot size and margins</button><p class="edit-hint">Your screenshot stays proportional (not stretched). On narrow phones, it scales down to fit its section.</p></div>`;
 }
 if(tab==='assets'){
  html+=`<div class="edit-group"><h4>Studio logo</h4>${imageUpload('Light-mode navbar logo','assets.logoLight',state.assets.logoLight)}${imageUpload('Dark-mode navbar logo','assets.logoDark',state.assets.logoDark)}</div>`;
  html+=`<div class="edit-group"><h4>Full-width hero images</h4>${imageUpload('Light-mode full hero banner','assets.heroLight',state.assets.heroLight)}${imageUpload('Dark-mode full hero banner','assets.heroDark',state.assets.heroDark)}${imageUpload('Optional light MOBILE banner','assets.heroLightMobile',state.assets.heroLightMobile)}${imageUpload('Optional dark MOBILE banner','assets.heroDarkMobile',state.assets.heroDarkMobile)}<p class="edit-hint">Upload a banner with the studio logo and slogan, but WITHOUT the top navigation bar or hero buttons (they are already overlaid as editable HTML). Recommended desktop ratio: about 2.1:1. Images are not cropped. You can upload a separate mobile banner.</p></div>`;
  html+=`<div class="edit-group"><h4>About / values card icons</h4><p class="edit-hint">Upload an individual icon for each of the four cards. One global size controls every icon in both modes. Leave an icon empty to keep its existing symbol.</p>${field('All four icons · size (px)','pillarIconSize',state.pillarIconSize,'number')}${state.content.pillars.map((p,i)=>imageUpload(`Icon ${i+1} — ${p.title}`,`content.pillars.${i}.image`,p.image)).join('')}<button class="editor-btn" data-action="reset-pillar-icons">Restore built-in card icons</button></div>`;
  html+=`<div class="edit-group"><h4>About-section scenery</h4>${imageUpload('Light-mode story image','assets.storyLight',state.assets.storyLight)}${imageUpload('Dark-mode story image','assets.storyDark',state.assets.storyDark)}</div>`;
  html+=`<div class="editor-note">The illustration crops come from your approved BALAH concept. These are images, not independently editable characters or buildings. Replace them here if you prepare cleaner individual art assets.</div>`;
 }
 if(tab==='export'){
  html+=`<div class="edit-group"><h4>Save images and changes permanently</h4><div class="editor-note"><strong>1.</strong> After your uploads are visible, click <strong>Download updated index.html</strong>. Uploaded images are embedded directly in that exported HTML file.<br><strong>2.</strong> Replace <strong>index.html</strong> in the extracted website folder (keep script.js, styles.css and assets beside it).<br><strong>3.</strong> Open the replaced index.html in a <strong>new private/incognito window</strong> without ?edit=1 to confirm the images appear. This avoids any old browser drafts.<br><strong>4.</strong> Re-upload the complete folder when publishing.<br><br><strong>Back up settings (JSON)</strong> too, especially before switching website ZIP versions. A browser draft by itself is not a published or permanent file.</div><div class="editor-actions"><button class="editor-btn primary" data-action="export-html">↓ Download updated index.html</button><button class="editor-btn" data-action="export-json">↓ Back up settings (JSON)</button><label class="editor-btn" style="cursor:pointer">↑ Import settings<input type="file" data-import="json" accept="application/json" hidden/></label><button class="editor-btn" data-action="recover-legacy">Recover previous-version browser draft</button></div></div>`;
  html+=`<div class="edit-group"><h4>Restore</h4><button class="editor-btn danger" data-action="reset">Reset to original design</button><p class="edit-hint" style="margin-top:8px">Removes your local changes. Export a backup first if you need one.</p></div><p id="saveStatus" class="edit-hint">Draft saved in this browser.</p>`;
 }
 $('editorBody').innerHTML=html;
}
function setPath(path,value){
 const keys=path.split('.');let obj=state;
 for(let i=0;i<keys.length-1;i++)obj=obj[keys[i]];
 const last=keys.at(-1);
 if(['spacing','size','letterSpacing','lineHeight','tintStrength','heroFadeStart','width','height','positionX','positionY','gap','marginTop','marginRight','marginBottom','marginLeft','pillarIconSize'].includes(last)) value=Number(value);
 if(path==='pillarIconSize')value=Math.min(120,Math.max(20,Number(value)||41));
 if (/^games\.\d+\.screenshotStyle\./.test(path)) {
  if(last==='width')value=Math.min(1100,Math.max(40,Number(value)||440));
  if(last==='height')value=Math.min(850,Math.max(30,Number(value)||280));
  if(last.startsWith('margin'))value=Math.min(250,Math.max(-200,Number(value)||0));
 } else if (/^games\.\d+\.logoStyle\./.test(path)) {
  if (last==='width')value=Math.min(500,Math.max(40,Number(value)||270));
  if (last==='height')value=Math.min(260,Math.max(25,Number(value)||112));
  if (last.startsWith('margin'))value=Math.min(200,Math.max(-100,Number(value)||0));
 } else {
  if (last==='width')value=Math.min(480,Math.max(65,Number(value)||150));
  if (last==='height')value=Math.min(120,Math.max(30,Number(value)||43));
 }
 if (last==='positionX')value=Math.min(85,Math.max(0,Number(value)||0));
 if (last==='positionY')value=Math.min(94,Math.max(15,Number(value)||78));
 if (last==='gap')value=Math.min(65,Math.max(0,Number(value)||0));
 obj[last]=value;
}
function imageToData(file,maxDimension=1600){return new Promise((resolve,reject)=>{
 const img=new Image(),url=URL.createObjectURL(file);
 img.onload=()=>{const longest=Math.max(img.width,img.height),scale=Math.min(1,maxDimension/longest);const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);const png=file.type==='image/png'||file.type==='image/webp'||file.type==='image/svg+xml';resolve(c.toDataURL(png?'image/png':'image/jpeg',png?undefined:.85))};
 img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Image failed to load'))};img.src=url;
 });}
$('editorBody').addEventListener('input',(ev)=>{
 const el=ev.target;if(el.dataset.path){setPath(el.dataset.path,el.value);render();saveDraft();}
});
$('editorBody').addEventListener('change',async(ev)=>{
 const el=ev.target;
 if(el.dataset.upload && el.files?.[0]){
  try{const url=await imageToData(el.files[0], el.dataset.upload.startsWith('assets.hero') ? 2400 : 1600);setPath(el.dataset.upload,url);render();saveDraft();editorPanel();}catch(e){alert('This image could not be loaded. Please try a JPG, PNG, or WebP file.');}
 }
 if(el.dataset.import && el.files?.[0]){
  try{const text=await el.files[0].text();const next=JSON.parse(text);if(!next.content||!Array.isArray(next.games))throw Error('Not a BALAH settings file');state={...structuredClone(initial),...next,assets:{...initial.assets,...next.assets},heroButtons:{...structuredClone(initial.heroButtons),...(next.heroButtons||{}),primary:{...initial.heroButtons.primary,...(next.heroButtons?.primary||{})},secondary:{...initial.heroButtons.secondary,...(next.heroButtons?.secondary||{})}}};state.games=next.games.map(withLogoLayout);state.content.pillars=(next.content.pillars||initial.content.pillars).map((p,i)=>({...initial.content.pillars[i],...p,image:p.image??''}));state.pillarIconSize=Math.min(120,Math.max(20,Number(next.pillarIconSize??41)||41));state.selectedGame=0;render();saveDraft();editorPanel('export');alert('Settings imported. Check both modes before publishing.');}catch(e){alert('Invalid settings file: '+e.message)}
 }
});
$('editorBody').addEventListener('click',(ev)=>{
 const g=ev.target.closest('[data-game-index]');if(g){state.selectedGame=Number(g.dataset.gameIndex);render();saveDraft();editorPanel('games');return;}
 const a=ev.target.closest('[data-action]');if(!a)return;
 switch(a.dataset.action){
  case 'toggle-theme':state.theme=selectedTheme()==='dark'?'light':'dark';render();saveDraft();break;
  case 'add-game':state.games.push({title:'New Project',logo:'',logoStyle:{...defaultGameLogoStyle},screenshotStyle:{...defaultScreenshotStyle},kicker:'IN DEVELOPMENT',description:'Add a description of your next project.',button:'Discover the game',image:'assets/game-main.webp',detailImage:'assets/game-detail.webp',tintLight:'#dfeadf',tintDark:'#17293b',tintStrength:55});state.selectedGame=state.games.length-1;render();saveDraft();editorPanel('games');break;
  case 'reset-game-screenshot-layout':getActiveGame().screenshotStyle={...defaultScreenshotStyle};render();saveDraft();editorPanel('games');break;
  case 'reset-pillar-icons':state.content.pillars.forEach(p=>p.image='');render();saveDraft();editorPanel('assets');break;
  case 'reset-game-logo-layout':getActiveGame().logoStyle={...defaultGameLogoStyle};render();saveDraft();editorPanel('games');break;
  case 'clear-game-logo':getActiveGame().logo='';render();saveDraft();editorPanel('games');break;
  case 'remove-game':if(state.games.length>1&&confirm('Remove the selected game from this website?')){state.games.splice(state.selectedGame,1);state.selectedGame=0;render();saveDraft();editorPanel('games');}break;
  case 'recover-legacy': {
    let oldDraft = null;
    try { oldDraft=JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY)); } catch(e) { console.warn(e); }
    if(!oldDraft?.assets || !oldDraft?.games || !oldDraft?.content){
      alert('No previous-version draft found in this browser. Open your previous website ZIP and use Save → Back up settings (JSON), then import that backup here.');
      break;
    }
    if(confirm('Recover your previous BALAH browser draft? This replaces the current unsaved edits in this editor. Export a JSON backup first if you want to keep them.')){
      state={...structuredClone(initial),...oldDraft,assets:{...initial.assets,...oldDraft.assets},heroButtons:{...structuredClone(initial.heroButtons),...(oldDraft.heroButtons||{}),primary:{...initial.heroButtons.primary,...(oldDraft.heroButtons?.primary||{})},secondary:{...initial.heroButtons.secondary,...(oldDraft.heroButtons?.secondary||{})}}};
      state.games=oldDraft.games.map(withLogoLayout);state.content.pillars=(oldDraft.content.pillars||initial.content.pillars).map((p,i)=>({...initial.content.pillars[i],...p,image:p.image??''}));state.pillarIconSize=Math.min(120,Math.max(20,Number(oldDraft.pillarIconSize??41)||41));
      render();saveDraft();editorPanel('export');
      alert('Old browser draft recovered. Review your images, then export your updated index.html and JSON backup.');
    }
    break;
  }
  case 'export-html':downloadHtml();break;
  case 'export-json':downloadFile('balah-settings-backup.json',JSON.stringify(state,null,2),'application/json');break;
  case 'reset':if(confirm('Reset all your local edits to the original version?')){localStorage.removeItem(STORAGE_KEY);state=structuredClone(initial);render();editorPanel(activeTab);}break;
 }
});
function downloadFile(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function downloadHtml(){
 const clone=document.documentElement.cloneNode(true);
 clone.classList.remove('editor-active');
 clone.querySelector('body').classList.remove('has-editor');
 clone.querySelector('#editor').setAttribute('hidden','');
 clone.querySelector('#openEditor').setAttribute('hidden','');
 clone.querySelector('#gameDialog').removeAttribute('open');
 clone.querySelector('#mainNav').classList.remove('expanded');
 // Prevent accidentally storing copies of uploaded image data in markup AND JSON.
 ['navLogo','heroArtwork','storyArtwork','gameLogo','gameImage','dialogImage'].forEach(id=>{
  const img=clone.querySelector('#'+id);if(img && img.getAttribute('src')?.startsWith('data:'))img.setAttribute('src',id==='gameLogo'?'assets/game-logo-placeholder.png':'assets/brand-icon.webp');
 });
 clone.querySelectorAll('.pillar-icon img').forEach(img=>{if(img.getAttribute('src')?.startsWith('data:'))img.removeAttribute('src');});
 const mobileSrc=clone.querySelector('#heroMobileSource');
 if(mobileSrc && mobileSrc.getAttribute('srcset')?.startsWith('data:')) mobileSrc.removeAttribute('srcset');
 const data=clone.querySelector('#site-initial-data');
 data.textContent=JSON.stringify(state).replace(/</g,'\\u003c');
 downloadFile('index.html','<!doctype html>\n'+clone.outerHTML,'text/html;charset=utf-8');
 const uploads=[...Object.values(state.assets||{}),...state.games.flatMap(g=>[g.logo,g.image]),...state.content.pillars.map(p=>p.image)].filter(v=>typeof v==='string' && v.startsWith('data:image/')).length;
 const status=$('saveStatus');if(status)status.textContent=`Export downloaded, with ${uploads} uploaded image${uploads===1?'':'s'} embedded. Replace index.html and verify by opening it in a private window.`;
}
function setEditorVisible(show){
 $('editor').hidden=!show;document.body.classList.toggle('has-editor',show);$('openEditor').hidden=show;
 const contactHint=$('contactEditorHint');
 if(contactHint)contactHint.hidden=!show || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((state.content.contactEmail||'').trim());
 if(show)editorPanel(activeTab);
}
if(editAllowed){$('openEditor').hidden=false;setEditorVisible(true);}
$('openEditor').addEventListener('click',()=>setEditorVisible(true));
$('closeEditor').addEventListener('click',()=>setEditorVisible(false));
document.querySelectorAll('.editor-tabs button').forEach(b=>b.addEventListener('click',()=>editorPanel(b.dataset.panel)));
render();
})();
