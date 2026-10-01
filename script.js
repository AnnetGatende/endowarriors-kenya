const $ = s => document.querySelector(s); const $$ = s => [...document.querySelectorAll(s)];

const store = {
  get(k, d) {
    try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
  remove(k) { localStorage.removeItem(k); }
};

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + (type === 'success' ? 'bg-emerald-600' : 'bg-slate-900') + ' text-white px-4 py-3 rounded-xl shadow-xl text-sm font-bold';
  el.textContent = msg;
  $('#toastRoot').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function openModal(id) {
  $('#' + id).classList.remove('hide');
  document.body.classList.add('overflow-hidden');
  lucide.createIcons();
}

function closeModal(id) {
  $('#' + id).classList.add('hide');   if (!$$('.modal:not(.hide)').length) document.body.classList.remove('overflow-hidden');
}

function copyText(t) {
  navigator.clipboard?.writeText(t).then(() => toast('Copied to clipboard', 'success')).catch(() => toast('Copy unavailable — select and copy manually'));
}

/* Mobile Hamburger Toggle */
function toggleMobileMenu() {
  const menu = $('#mobileMenu');
  menu.classList.toggle('hidden');
  lucide.createIcons();
}

const lists = {
  locations: ['Pelvis / uterus', 'Right ovarian fossa', 'Left ovarian fossa', 'Lower back / sacrum', 'Sciatic nerve down thighs', 'Bowel / recto-vaginal', 'Bladder', 'Thoracic / shoulder diaphragm'],
  symptoms: ['Severe pelvic cramps', 'Endo Belly bloating', 'Chronic exhaustion', 'Nausea', 'Brain fog', 'Cold sweats'],
  triggers: ['Stress / workload', 'Dairy', 'Refined wheat / mandazi', 'Cold weather', 'Poor sleep', 'Ovulation / luteal phase'],
  reliefs: ['Hot water bottle', 'Electric heat pad', 'Warm ginger tea', 'Magnesium', 'Prescribed NSAID', 'Fetal side-lying']
};

function checkboxGroup(id, items) {
  $(id).innerHTML = items.map((x, i) => `<label class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-xs font-semibold"><input type="checkbox" class="check" value="${x}" data-group="${id.slice(1)}">${x}</label>`).join('');
}
Object.entries(lists).forEach(([k, v]) => checkboxGroup('#' + k, v));

$('#pain').addEventListener('input', e => updatePain(+e.target.value));

function updatePain(n) {
  $('#painValue').textContent = n + '/10';
  let t = n <= 3 ? 'Mild Discomfort' : n <= 6 ? 'Moderate Throbbing' : n <= 8 ? 'Severe Acute Pain' : 'Crisis / Hospital Level';
  let cls = n <= 3 ? 'bg-emerald-50 text-emerald-700' : n <= 6 ? 'bg-amber-50 text-amber-700' : n <= 8 ? 'bg-orange-50 text-orange-700' : 'bg-rose-50 text-rose-700';
  $('#painStatus').className = 'px-3 py-1.5 rounded-full text-xs font-bold ' + cls;
  $('#painStatus').textContent = t;
}

$('#painForm').addEventListener('submit', e => {   e.preventDefault();   const logs = store.get('endowarriors_painlogs', []);   const vals = k => $$(`[data-group="${k}"]:checked`).map(x => x.value);
  logs.unshift({
    date: new Date().toISOString(),
    pain: +$('#pain').value,
    flow: $('#flow').value,
    locations: vals('locations'),
    symptoms: vals('symptoms'),
    triggers: vals('triggers'),
    reliefs: vals('reliefs'),
    emotion: $('#emotion').value,
    note: $('#note').value.trim()
  });
  store.set('endowarriors_painlogs', logs.slice(0, 365));
  $('#note').value = '';   $$('input[type=checkbox]').forEach(x => x.checked = false);
  renderLogs();
  toast('Today’s entry saved privately on this device.', 'success');
});

function renderLogs() {
  const logs = store.get('endowarriors_painlogs', []);
  $('#daysLogged').textContent = logs.length;
  $('#avgPain').textContent = logs.length ? (logs.reduce((a, b) => a + b.pain, 0) / logs.length).toFixed(1) : '—';
  $('#recentLogs').innerHTML = logs.slice(0, 8).map(l => `<div class="border-b pb-3"><div class="flex justify-between"><b>${l.pain}/10</b><span class="text-[10px] text-slate-400">${new Date(l.date).toLocaleString()}</span></div><p class="text-xs text-slate-600 mt-1">${l.flow} · ${l.emotion}</p><p class="text-xs text-slate-500 mt-1">${l.locations.slice(0, 2).join(' · ') || 'No location selected'}</p>${l.note ? `<p class="text-xs mt-1 italic">“${escapeHtml(l.note)}”</p>` : ''}</div>`).join('') || '<p class="text-xs text-slate-500">Your first entry will appear here.</p>';
}

function escapeHtml(s) {
  return s.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

const doctors = [
  { name: 'Dr. Yamal Patel', county: 'Nairobi', spec: 'Excision / minimally invasive surgery', hospital: '3rd Park Hospital / Dr Yamal’s Clinic', verified: 'Public sources confirm OBGYN, laparoscopic/minimal-access surgery and a special interest in endometriosis/adenomyosis.', phone: '+254 728 111 181', site: 'https://dryamal.com/', insurance: ['Cash'], pvi: 'Verified Specialty Interest' },
  { name: 'Dr. Charles Muteshi', county: 'Nairobi', spec: 'Reproductive medicine', hospital: 'Aga Khan University Hospital Nairobi', verified: 'Aga Khan lists him as Consultant Obstetrician Gynaecologist and Fertility Specialist with endometriosis and IVF interests.', phone: '', site: 'https://hospitals.aku.edu/', insurance: ['Cash'], pvi: 'Institutional Consultant' },
  { name: 'Dr. Wanjiru Ndegwa', county: 'Nairobi', spec: 'Reproductive medicine', hospital: 'Nairobi', verified: 'Public practitioner directory information should be confirmed directly before booking.', phone: '', site: '', insurance: ['Cash'], pvi: 'Directory Listed' },
  { name: 'Sarah Nyambura, PT', county: 'Nairobi', spec: 'Pelvic physiotherapy', hospital: 'Nairobi Pelvic Physical Therapy Centre', verified: 'Directory entry supplied for prototype; clinic credentials and current availability should be independently confirmed.', phone: '', site: '', insurance: ['Cash'], pvi: 'Directory Listed' },
  { name: 'Dr. Menza Mwavita', county: 'Mombasa', spec: 'Obstetrics & gynaecology', hospital: 'Coast General / Premier Hospital', verified: 'Directory entry supplied for prototype; current endometriosis services should be independently confirmed.', phone: '', site: '', insurance: ['Cash'], pvi: 'Directory Listed' },
  { name: 'Dr. Peter Kibet', county: 'Uasin Gishu', spec: 'Obstetrics & gynaecology', hospital: 'Moi Teaching & Referral Hospital', verified: 'Directory entry supplied for prototype; current endometriosis services should be independently confirmed.', phone: '', site: '', insurance: ['Cash'], pvi: 'Directory Listed' },
  { name: 'Dr. Alice Kaaria', county: 'Nakuru', spec: 'Obstetrics & gynaecology', hospital: 'War Memorial Hospital / Nakuru Level 5', verified: 'Directory entry supplied for prototype; current endometriosis services should be independently confirmed.', phone: '', site: '', insurance: ['Cash'], pvi: 'Directory Listed' },
  { name: 'Dr. Shadrack Ojwang', county: 'Kisumu', spec: 'Obstetrics & gynaecology', hospital: 'Aga Khan Kisumu / Jaramogi Oginga Odinga TRH', verified: 'University of Nairobi lists Prof Shadrack B. Ojwang as a consultant obstetrician and gynaecologist.', phone: '', site: '', insurance: ['Cash'], pvi: 'Academic Consultant' }
];

function renderDoctors() {
  let q = $('#docSearch').value.toLowerCase(), c = $('#countyFilter').value, s = $('#specFilter').value, i = $('#insFilter').value;
  let ds = doctors.filter(d => (!q || (d.name + d.hospital + d.spec).toLowerCase().includes(q)) && (!c || d.county === c) && (!s || d.spec === s) && (!i || d.insurance.includes(i)));
  // SAMPLE portraits for prototype cards; replace with approved provider photos before launch.
  $('#doctorGrid').innerHTML = ds.map((d, index) => `<article class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-soft"><div class="provider-visual"><img class="provider-portrait" src="https://i.pravatar.cc/160?img=${index + 12}" alt="Sample portrait for ${escapeHtml(d.name)}"><span>${escapeHtml(d.spec)}</span></div><div class="p-5"><div class="flex justify-between gap-3"><div><h3 class="font-display text-2xl">${d.name}</h3><p class="text-xs text-slate-500 mt-1">${d.hospital} · ${d.county}</p></div><span class="h-fit text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700">${d.pvi}</span></div><p class="text-sm font-bold mt-4">${d.spec}</p><p class="text-xs text-slate-600 leading-5 mt-2">${d.verified}</p><div class="mt-4 text-xs"><span class="px-2 py-1 rounded-full bg-amber-50 text-amber-800">Credentials: verify directly</span></div><div class="flex gap-2 mt-5">${d.phone ? `<a href="tel:${d.phone.replace(/\s/g, '')}" class="flex-1 text-center bg-slate-900 text-white rounded-xl py-2 font-bold text-xs">Call Clinic</a>` : '<button onclick="toast(\'No verified public phone number in this prototype\')" class="flex-1 bg-slate-100 rounded-xl py-2 font-bold text-xs text-slate-700">Call Clinic</button>'}<button onclick="openReview(${doctors.indexOf(d)})" class="px-3 bg-amber-100 rounded-xl grid place-items-center text-amber-900" title="Review"><i data-lucide="message-square-plus" class="w-4 h-4"></i></button></div>${d.site ? `<a class="text-xs text-amber-700 font-bold inline-block mt-3" href="${d.site}" target="_blank" rel="noopener">View public source →</a>` : ''}</div></article>`).join('') || '<div class="md:col-span-2 xl:col-span-3 p-8 text-center bg-white rounded-3xl border">No matches. Try clearing a filter.</div>';
  lucide.createIcons();
}

['docSearch', 'countyFilter', 'specFilter', 'insFilter'].forEach(id => $('#' + id).addEventListener('input', renderDoctors));

function openReview(n) {
  $('#reviewDoctor').textContent = doctors[n]?.name || '';
  $('#reviewModal').dataset.doctor = n;
  openModal('reviewModal');
}

function submitReview() {
  let t = $('#reviewText').value.trim();
  if (!t) return toast('Write a short review first');
  const r = store.get('endowarriors_reviews', []);
  r.push({ doctor: doctors[+$('#reviewModal').dataset.doctor]?.name, text: t, date: new Date().toISOString() });
  store.set('endowarriors_reviews', r);
  $('#reviewText').value = '';
  closeModal('reviewModal');
  toast('Review saved locally. It is not published to a server in this prototype.', 'success');
}

const foods = [
  ['Managu', 'Indigenous greens', 'images/foods/managu.jpg', 'Managu is African nightshade (mnavu), a Kenyan indigenous leafy vegetable rich in micronutrients.', 'Wash well and cook the leaves thoroughly; traditional preparations commonly use onion and tomato.', 'African nightshade (managu) leaves with characteristic foliage and dark berries.'],
  ['Terere', 'Indigenous greens', 'images/foods/terere.jpg', 'Terere is the Kenyan name commonly used for amaranth greens, valued for iron and essential vitamins.', 'Steam or sauté briefly and pair with beans, eggs or fish if tolerated.', 'Fresh green amaranth leaves (terere), rinsed and ready to cook.'],
  ['Sukuma Wiki', 'Indigenous greens', 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=600&q=80', 'Sukuma wiki is the familiar Kenyan collard-green vegetable providing dietary fiber and minerals.', 'Slice the leaves and sauté with onion and tomato; serve with a protein or ugali.', 'Illustrative greens photo'],
  ['Kunde', 'Indigenous greens', 'https://images.pexels.com/photos/17495281/pexels-photo-17495281.jpeg?auto=compress&cs=tinysrgb&w=800', 'Kunde are cowpea leaves used as a traditional Kenyan leafy vegetable supporting balanced nutrition.', 'Wash thoroughly and cook until tender; pair with your preferred staple.', 'Fresh cowpea leaves (kunde), a traditional leafy green vegetable.'],
  ['Ngwaci', 'Tubers & clean carbs', 'https://images.pexels.com/photos/30893354/pexels-photo-30893354.jpeg?auto=compress&cs=tinysrgb&w=800', 'Ngwaci refers to sweet potatoes in Kenya, offering sustained complex carbohydrates and energy.', 'Boil, steam or roast and combine with greens and protein.', 'Sweet potato photo'],
  ['Nduma', 'Tubers & clean carbs', 'images/foods/nduma.jpg', 'Nduma are Kenyan arrowroots, providing digestible complex starches and dietary fiber.', 'Steam or boil until tender; serve with greens and fish or beans.', 'Fresh arrowroot tubers (nduma), showing their brown, textured skins.'],
  ['Arrowroots', 'Tubers & clean carbs', 'images/foods/arrowroots.jpg', 'Arrowroots (nduma) are Kenyan tubers providing digestible complex starches and dietary fiber.', 'Steam or boil until tender; serve with greens and fish or beans.', 'Fresh arrowroot tubers, showing their brown, textured skins.'],
  ['Hass Avocado', 'Fats & proteins', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80', 'Hass avocado is rich in healthy monounsaturated fats and essential nutrients.', 'Add to salads, toast or a balanced Kenyan meal.', 'Avocado photo'],
  ['Lake Victoria Tilapia', 'Fats & proteins', 'images/foods/tilapia.jpg', 'Tilapia is a lean protein source providing omega fatty acids and essential amino acids.', 'Grill or bake with ginger, lemon and greens; choose preparation according to your dietary needs.', 'Fresh whole tilapia fish with intact scales and fins.'],
  ['Chia / Flax', 'Fats & proteins', 'https://images.pexels.com/photos/27468397/pexels-photo-27468397.jpeg?auto=compress&cs=tinysrgb&w=800', 'Chia and flax seeds are small edible seeds used as fiber-rich additions to meals.', 'Add a small spoonful to porridge or yoghurt if tolerated and drink enough fluid.', 'Chia seed photo'],
  ['Tangawizi', 'Spices & tonics', 'https://images.pexels.com/photos/20234970/pexels-photo-20234970.jpeg?auto=compress&cs=tinysrgb&w=800', 'Tangawizi is fresh ginger root, valued for its aromatic warming properties and comfort beverages.', 'Slice into hot water or use in food for flavor; stop if it irritates your stomach.', 'Fresh ginger photo'],
  ['Manjano', 'Spices & tonics', 'https://images.pexels.com/photos/31346461/pexels-photo-31346461.jpeg?auto=compress&cs=tinysrgb&w=800', 'Manjano is fresh turmeric, a culinary spice known for its vibrant color.', 'Use in food for flavor; avoid high-dose supplements without clinical advice.', 'Fresh turmeric photo'],
  ['Papaya', 'Enzyme fruits', 'images/foods/papaya.jpg', 'Pawpaw (papaya) is widely grown in Kenya and offers refreshing fruit nutrition.', 'Eat ripe fresh fruit as a snack or alongside breakfast.', 'Ripe papaya fruit cut open to show its orange flesh and seeds.'],
  ['Pineapple', 'Enzyme fruits', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 'Pineapple is a tropical fruit containing natural enzymes and Vitamin C.', 'Serve fresh in a portion that feels comfortable for your stomach.', 'Pineapple photo']
];

let foodCat = 'All';

function renderFoods() {
  let q = $('#foodSearch').value.toLowerCase();
  let fs = foods.filter(f => (foodCat === 'All' || f[1] === foodCat) && f[0].toLowerCase().includes(q));
  $('#foodGrid').innerHTML = fs.map(f => `<article class="bg-white rounded-3xl overflow-hidden border shadow-soft"><div class="relative bg-slate-100 h-48"><img class="w-full h-full object-cover" loading="lazy" src="${f[2]}" alt="${escapeHtml(f[5])}"><span class="absolute bottom-2 left-2 bg-slate-950/80 text-white text-[10px] px-2 py-1 rounded-full">${f[5]}</span></div><div class="p-4"><span class="text-[10px] font-bold uppercase tracking-widest text-emerald-700">${f[1]}</span><h3 class="font-display text-xl mt-1">${f[0]}</h3><div class="mt-2 text-xs font-bold text-amber-700">Supportive nutrition · informational</div><p class="text-xs text-slate-600 leading-5 mt-2">${f[3]}</p><button onclick="openFood(${foods.indexOf(f)})" class="mt-4 text-xs font-bold text-slate-900">Preparation tips →</button></div></article>`).join('') || '<div class="md:col-span-2 xl:col-span-3 bg-white rounded-3xl border p-8 text-center text-sm text-slate-500">No food matches. Try another search.</div>';
  $('#foodCats').innerHTML = ['All', ...new Set(foods.map(f => f[1]))].map(c => `<button onclick="foodCat='${c}';renderFoods()" class="px-3 py-2 rounded-full text-xs font-bold ${foodCat === c ? 'bg-slate-900 text-white' : 'bg-white border text-slate-800'}">${c}</button>`).join('');
}

$('#foodSearch').addEventListener('input', renderFoods);

function openFood(i) {
  let f = foods[i];
  $('#foodModalImg').alt = f[5];
  $('#foodModalImg').src = f[2];
  $('#foodModalTitle').textContent = f[0];
  $('#foodModalText').textContent = f[3];
  $('#foodModalPrep').textContent = 'Preparation: ' + f[4];
  openModal('foodModal');
}

const campaigns = [
  ['Faith W.', 'Nairobi', 'Stage 4 bowel surgery', 'Demo record · verification required', 450000, 175000, 'Hospital not published'],
  ['Beatrice A.', 'Kisumu', 'Medication & pelvic physiotherapy', 'Demo record · verification required', 180000, 72000, 'Hospital not published'],
  ['Sharon M.', 'Nakuru', 'Thoracic endometriosis care', 'Demo record · verification required', 520000, 210000, 'Hospital not published']
];

function renderCampaigns() {
  $('#campaignGrid').innerHTML = campaigns.map((c, i) => {
    let p = Math.round(c[5] / c[4] * 100);
    return `<article class="bg-white rounded-3xl border p-5 shadow-soft"><span class="text-[10px] font-bold uppercase tracking-widest text-rose-700">DEMO / VERIFY</span><h3 class="font-display text-2xl mt-1">${c[0]}</h3><p class="text-xs text-slate-500">${c[1]} · ${c[2]}</p><p class="text-xs mt-3">${c[3]}</p><div class="h-3 bg-slate-100 rounded-full mt-4 overflow-hidden"><div class="h-full bg-amber-400" style="width:${p}%"></div></div><div class="flex justify-between text-xs mt-2"><b>KES ${c[5].toLocaleString()}</b><span>of KES ${c[4].toLocaleString()}</span></div><button onclick="openPayment(${i})" class="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm">Support via M-Pesa</button></article>`;
  }).join('');
}

function openPayment(i) {
  $('#payCampaign').textContent = campaigns[i][0];
  $('#payNumber').value = 'Not supplied — verify fundraiser';
  $('#payAccount').value = 'Not supplied — verify fundraiser';
  openModal('paymentModal');
}

const defaultPosts = [
  { title: 'Post-Excision Day 5: Shoulder gas pain management', cat: 'Surgery & Recovery', lang: 'Sheng / English', body: 'Surprised by how much the shoulder can complain after laparoscopy. Sharing my experience so the next warrior knows to ask the surgical team what is expected.', hug: 17, comments: ['Pole sana', 'Healing one day at a time.'], date: new Date().toISOString() },
  { title: 'How I approached my Kenyan employer', cat: 'Workplace Rights Kenya', lang: 'English', body: 'I kept the conversation focused on documentation, appointments and what support I needed rather than oversharing my diagnosis.', hug: 24, comments: ['This is helpful.'], date: new Date().toISOString() },
  { title: 'Dealing with relatives suggesting hot water', cat: 'Mental Wellbeing', lang: 'Swahili', body: 'Warm water can be comforting, but I also needed people to understand that comfort is not the same as treatment.', hug: 31, comments: [], date: new Date().toISOString() }
];

let posts = store.get('endowarriors_posts', defaultPosts);
let forumCat = 'All';

function renderForum() {
  let cats = ['All', 'Surgery & Recovery', 'Workplace Rights Kenya', 'Mental Wellbeing', 'Fertility & Healing', 'Doctor Reviews'];
  $('#forumCats').innerHTML = cats.map(c => `<button onclick="forumCat='${c}';renderForum()" class="px-3 py-2 rounded-full text-xs font-bold ${forumCat === c ? 'bg-slate-900 text-white' : 'bg-white border text-slate-800'}">${c}</button>`).join('');
  let ps = posts.filter(p => forumCat === 'All' || p.cat === forumCat);
  $('#posts').innerHTML = ps.map((p, i) => `<article class="bg-white rounded-3xl border p-5 shadow-soft"><div class="flex flex-wrap gap-2 text-[10px] font-bold"><span class="bg-amber-100 text-amber-900 px-2 py-1 rounded-full">${p.cat}</span><span class="bg-slate-100 text-slate-700 px-2 py-1 rounded-full">${p.lang}</span></div><h3 class="font-display text-2xl mt-3">${escapeHtml(p.title)}</h3><p class="text-sm text-slate-600 leading-6 mt-2">${escapeHtml(p.body)}</p><div class="flex gap-2 mt-4"><button onclick="hug(${posts.indexOf(p)})" class="px-3 py-2 rounded-xl bg-amber-50 font-bold text-sm text-amber-900 flex items-center gap-1.5">Solidarity Hug <span>${p.hug}</span></button><button onclick="toggleComments(${posts.indexOf(p)})" class="px-3 py-2 rounded-xl bg-slate-100 font-bold text-sm text-slate-800">Comments ${p.comments.length}</button></div><div id="comments-${posts.indexOf(p)}" class="hidden mt-4 bg-slate-50 rounded-2xl p-4"><div class="space-y-2">${p.comments.map(c => `<p class="text-xs bg-white rounded-xl p-2 border">${escapeHtml(c)}</p>`).join('')}</div><div class="flex gap-2 mt-3"><input id="comment-${posts.indexOf(p)}" class="field" placeholder="Add a kind comment"><button onclick="addComment(${posts.indexOf(p)})" class="px-3 bg-slate-900 text-white rounded-xl text-xs font-bold">Post</button></div></div></article>`).join('');
  lucide.createIcons();
}

// SAMPLE story content and portraits: replace only with experiences and photos shared with permission.
const communityStories = [
  {
    name: 'Natalie Githinji', photo: 'https://i.pravatar.cc/240?img=47',
    preview: 'I learned to write down my questions before an appointment and ask for support when I needed it.',
    story: 'I learned to write down my questions before an appointment and ask for support when I needed it. Keeping notes helped me explain what I was experiencing and remember what I wanted to ask. I am sharing this sample story to remind other warriors that their experience deserves to be heard. This placeholder will be replaced with Natalie’s approved story.'
  },
  {
    name: 'A Kenyan Warrior', photo: 'https://i.pravatar.cc/240?img=44',
    preview: 'Finding people who believed me made it easier to keep looking for care that felt right.',
    story: 'Finding people who believed me made it easier to keep looking for care that felt right. I began taking one step at a time, asking questions, and reaching out to people I trusted. This placeholder is here until a community member gives permission to share their own words and photo.'
  },
  {
    name: 'A Community Voice', photo: 'https://i.pravatar.cc/240?img=49',
    preview: 'Small steps, honest conversations, and patient support helped me feel less alone.',
    story: 'Small steps, honest conversations, and patient support helped me feel less alone. I learned that there was no single right way to navigate my experience, and that it was okay to seek support when I needed it. This placeholder will be replaced with a real story after permission is received.'
  }
];
let activeStory = 0;
let storyRotation;

function renderStories() {
  const track = $('#storiesTrack');
  if (!track) return;
  track.innerHTML = communityStories.map((story, index) => {
    const offset = (index - activeStory + communityStories.length) % communityStories.length;
    const position = offset === 0 ? 'is-center' : offset === 1 ? 'is-right' : 'is-left';
    const depth = offset === 0 ? '1' : '0.68';
    return `<button type="button" class="story-card ${position}" style="--story-depth:${depth}" onclick="openStory(${index})" aria-label="Read ${escapeHtml(story.name)}’s full story">
      <img class="story-card-photo" src="${story.photo}" alt="Sample placeholder portrait for ${escapeHtml(story.name)}">
      <span class="story-sample-label">Sample story · placeholder</span>
      <span class="story-card-name">${escapeHtml(story.name)}</span>
      <span class="story-card-preview">“${escapeHtml(story.preview)}”</span>
      <span class="story-read-more">Read full story</span>
    </button>`;
  }).join('');
  $('#storyDots').innerHTML = communityStories.map((story, index) => `<button type="button" class="story-dot ${index === activeStory ? 'is-active' : ''}" onclick="showStory(${index})" aria-label="Show ${escapeHtml(story.name)}’s story" aria-current="${index === activeStory ? 'true' : 'false'}"></button>`).join('');
}

function showStory(index) {
  activeStory = (index + communityStories.length) % communityStories.length;
  renderStories();
}

function moveStory(direction) {
  showStory(activeStory + direction);
}

function openStory(index) {
  const story = communityStories[index];
  $('#storyModalName').textContent = story.name;
  $('#storyModalPhoto').src = story.photo;
  $('#storyModalPhoto').alt = `Sample placeholder portrait for ${story.name}`;
  $('#storyModalBody').textContent = story.story;
  openModal('storyModal');
}

function startStoryRotation() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  clearInterval(storyRotation);
  storyRotation = setInterval(() => moveStory(1), 5000);
}

function initStories() {
  renderStories();
  startStoryRotation();
  const carousel = $('.stories-carousel');
  carousel?.addEventListener('mouseenter', () => clearInterval(storyRotation));
  carousel?.addEventListener('mouseleave', startStoryRotation);
  carousel?.addEventListener('focusin', () => clearInterval(storyRotation));
  carousel?.addEventListener('focusout', startStoryRotation);
}

function hug(i) {
  posts[i].hug++;
  store.set('endowarriors_posts', posts);
  renderForum();
}

function toggleComments(i) {
  $('#comments-' + i).classList.toggle('hidden');
}

function addComment(i) {
  let x = $('#comment-' + i).value.trim();
  if (!x) return;
  posts[i].comments.push(x);
  store.set('endowarriors_posts', posts);
  renderForum();
}

function addPost() {
  let title = $('#postTitle').value.trim(), body = $('#postBody').value.trim();
  if (!title || !body) return toast('Add a title and message');
  posts.unshift({ title, body, cat: $('#postCat').value, lang: $('#postLang').value, hug: 0, comments: [], date: new Date().toISOString() });
  store.set('endowarriors_posts', posts);
  $('#postTitle').value = '';
  $('#postBody').value = '';
  closeModal('discussionModal');
  renderForum();
  toast('Discussion added locally.', 'success');
}

let breathTimer = null, breathRunning = false, breathRemaining = 0;

function getBreathPattern() {
  return $('#breathMode').value === '478' ? [     ['Inhale through nose', 4, 'inhale'],     ['Soft hold', 7, 'hold'],     ['Long exhale', 8, 'exhale']   ] : $('#breathMode').value === 'box' ? [
    ['Inhale through nose', 4, 'inhale'],
    ['Soft hold', 4, 'hold'],
    ['Long exhale', 4, 'exhale'],
    ['Soft hold', 4, 'hold']
  ] : [
    ['Inhale through nose', 5, 'inhale'],
    ['Long exhale', 5, 'exhale']
  ];
}

function toggleBreathing() {
  if (breathRunning) {
    clearInterval(breathTimer);
    breathRunning = false;
    $('#breathStart').textContent = 'Resume';
    return;
  }
  breathRunning = true;
  $('#breathStart').textContent = 'Pause';
  if (!breathRemaining) breathRemaining = 0;
  runBreathCycle();
}

function runBreathCycle() {
  let pat = getBreathPattern(), step = 0;
  function next() {
    if (!breathRunning) return;
    let [label, secs, cls] = pat[step % pat.length];
    let left = secs;
    $('#breathPhase').textContent = label;
    $('#breathCount').textContent = left;
    $('#breathRing').className = 'breath-ring ' + cls;
    clearInterval(breathTimer);
    breathTimer = setInterval(() => {
      left--;
      $('#breathCount').textContent = Math.max(left, 0);
      if (left <= 0) {
        clearInterval(breathTimer);
        step++;
        next();
      }
    }, 1000);
  }
  next();
}

function resetBreathing() {
  clearInterval(breathTimer);
  breathRunning = false;
  $('#breathStart').textContent = 'Start';
  $('#breathCount').textContent = '—';
  $('#breathPhase').textContent = 'Ready';
  $('#breathRing').className = 'breath-ring';
}

let audioCtx = null, rainNodes = null, omNodes = null;

function ctx() {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function noiseBuffer(c) {
  let b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function toggleRain() {
  let c = ctx();
  if (rainNodes) {
    rainNodes.forEach(n => n.stop?.());
    rainNodes = null;
    $('#rainState').textContent = 'Off';
    return;
  }
  let src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  src.loop = true;
  let low = c.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 900;
  let gain = c.createGain();
  gain.gain.value = 0.08;
  src.connect(low).connect(gain).connect(c.destination);
  src.start();
  rainNodes = [src];
  $('#rainState').textContent = 'On';
}

function toggleOm() {
  let c = ctx();
  if (omNodes) {
    omNodes.forEach(n => n.stop?.());
    omNodes = null;
    $('#omState').textContent = 'Off';
    return;
  }
  let g = c.createGain();
  g.gain.value = 0.045;
  g.connect(c.destination);
  let a = c.createOscillator(), b = c.createOscillator(), f = c.createBiquadFilter();
  a.type = 'sine';
  b.type = 'sine';
  a.frequency.value = 136.1;
  b.frequency.value = 272.2;
  f.type = 'lowpass';
  f.frequency.value = 700;
  a.connect(f);
  b.connect(f);
  f.connect(g);
  a.start();
  b.start();
  omNodes = [a, b];
  $('#omState').textContent = 'On';
}

let ground = 1;
const groundData = [
  ['5 things you can see', 'Name five safe visual details: a light, a ceiling panel, a color, your clothing, the mirror.'],
  ['4 things you can touch', 'Notice four physical sensations: the table, blanket, clothing, fingertips.'],
  ['3 things you can hear', 'Name three sounds: your breath, the scanner rhythm, the radiographer’s voice.'],
  ['2 things you can sense', 'Notice two internal sensations without judging them: warmth, heartbeat, feet, jaw.'],
  ['1 loving truth', 'Say: “My pain is real. I can ask questions. I can pause and ask for help.”']
];

function renderGround() {
  let d = groundData[ground - 1];
  $('#groundStep').textContent = ground + ' / 5';
  $('#groundPrompt').textContent = d[0];
  $('#groundHint').textContent = d[1];
  $('#groundInput').value = '';
}

function groundNext() {
  ground = Math.min(5, ground + 1);
  renderGround();
}

function groundPrev() {
  ground = Math.max(1, ground - 1);
  renderGround();
}

function sosBreath() {
  let left = 19;
  $('#sosCount').textContent = '19s';
  let t = setInterval(() => {
    left--;
    $('#sosCount').textContent = left + 's';
    $('#sosBar').style.width = ((19 - left) / 19 * 100) + '%';
    if (left <= 0) {
      clearInterval(t);
      $('#sosCount').textContent = 'Done';       toast('Reset complete. Stay with your next comfortable breath.', 'success');     }   }, 1000); }  function goTab(id) {   $$('.tab-panel').forEach(x => x.classList.add('hidden'));
  $('#' + id).classList.remove('hidden');   $$('.tab-btn').forEach(x => x.classList.toggle('tab-active', x.dataset.tab === id));$$('.mobile-tab-btn').forEach(x => x.classList.toggle('tab-active', x.dataset.tab === id));$('#mobileMenu').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

$$('.tab-btn').forEach(b => b.addEventListener('click', () => goTab(b.dataset.tab)));$$
('.mobile-tab-btn').forEach(b => b.addEventListener('click', () => goTab(b.dataset.tab)));

let authMode = 'in';

function setAuth(mode) {
  authMode = mode;
  $('#signInBtn').className = mode === 'in' ? 'flex-1 py-2 rounded-lg bg-white font-bold text-sm' : 'flex-1 py-2 rounded-lg text-sm text-slate-600';
  $('#signUpBtn').className = mode === 'up' ? 'flex-1 py-2 rounded-lg bg-white font-bold text-sm' : 'flex-1 py-2 rounded-lg text-sm text-slate-600';
  $('#authName').classList.toggle('hidden', mode === 'in');
  $('#authName').required = mode === 'up';
  $('#authPassword').autocomplete = mode === 'in' ? 'current-password' : 'new-password';
  $('#authSubmit').textContent = mode === 'in' ? 'Sign In' : 'Create account';
}

function openAuth() {
  const session = store.get('endowarriors_session', null);
  const user = store.get('endowarriors_user', null);
  $('#authSignedOut').classList.toggle('hidden', !!session);
  $('#authSignedIn').classList.toggle('hidden', !session);
  if (session && user) {
    $('#authAccountName').textContent = user.name || 'Warrior';
    $('#authAccountContact').textContent = user.contact || '';
  } else {
    setAuth('in');
    $('#authContact').value = '';
    $('#authPassword').value = '';
    $('#authName').value = '';
  }
  openModal('authModal');
}

function saveAuth() {
  const contact = $('#authContact').value.trim().toLowerCase();
  const password = $('#authPassword').value;
  if (!contact || !password) return toast('Enter your phone/email and password first');
  let accounts = store.get('endowarriors_accounts', {});
  if (authMode === 'up') {
    const name = $('#authName').value.trim();
    if (!name) return toast('Enter your name to create the account');
    if (accounts[contact]) return toast('An account with that phone/email already exists. Sign in instead.');
    accounts[contact] = { name, password, status: 'Not set', county: 'Mombasa County' };
    store.set('endowarriors_accounts', accounts);
    store.set('endowarriors_user', { name, contact, status: 'Not set', county: 'Mombasa County' });
    store.set('endowarriors_session', { contact, at: new Date().toISOString() });
    renderUser();
    closeModal('authModal');
    toast('Account created and signed in.', 'success');
    return;
  }
  const account = accounts[contact];
  if (!account) return toast('No account found. Choose Sign Up first.');
  if (account.password !== password) return toast('Incorrect password. Try again.');
  store.set('endowarriors_user', { name: account.name, contact: contact, status: account.status || 'Not set', county: account.county || 'Mombasa County' });
  store.set('endowarriors_session', { contact, at: new Date().toISOString() });
  renderUser();
  closeModal('authModal');
  toast('Welcome back, ' + account.name + '.', 'success');
}

function demoProfile() {
  const contact = 'demo@endowarriors.local';
  let accounts = store.get('endowarriors_accounts', {});
  accounts[contact] = { name: 'Wanjiku', password: 'demo1234', status: 'Stage 4', county: 'Nairobi County' };
  store.set('endowarriors_accounts', accounts);
  store.set('endowarriors_user', { name: 'Wanjiku', contact, status: 'Stage 4', county: 'Nairobi County' });
  store.set('endowarriors_session', { contact, at: new Date().toISOString() });
  renderUser();
  closeModal('authModal');
  toast('Demo profile loaded and signed in.', 'success');
}

function signOut() {
  store.remove('endowarriors_session');
  $('#authSignedOut').classList.remove('hidden');
  $('#authSignedIn').classList.add('hidden');
  renderUser();
  closeModal('authModal');
  toast('You have been signed out.', 'success');
}

function renderUser() {
  let u = store.get('endowarriors_user', null), session = store.get('endowarriors_session', null);
  $('#headerSignIn').classList.toggle('hidden', !!session);
  $('#headerSignOut').classList.toggle('hidden', !session);
  if (!u || !session) {
    $('#profileName').textContent = 'Guest Warrior';
    $('#profileStatus').textContent = 'Status: Sign in to personalize';
    $('#profileCounty').textContent = 'County: Not linked';
    $('#greeting').textContent = 'Karibu, Warrior';
    $('#locationBadge').textContent = 'Kenya';
    return;
  }
  $('#profileName').textContent = u.name;
  $('#profileStatus').textContent = 'Status: ' + u.status;
  $('#profileCounty').textContent = 'County: ' + u.county;
  $('#greeting').textContent = 'Karibu, ' + u.name;
  $('#locationBadge').textContent = u.county;
}

function openReport() {
  let logs = store.get('endowarriors_painlogs', []), avg = logs.length ? (logs.reduce((a, b) => a + b.pain, 0) / logs.length).toFixed(1) : 'No data';
  let counts = {};
  logs.forEach(l => l.symptoms.forEach(s => counts[s] = (counts[s] || 0) + 1));
  let top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  $('#reportBody').innerHTML = `<div class="border-b pb-4"><p class="text-xs uppercase tracking-widest font-bold">EndoWarriors Kenya · Patient-generated summary</p><h1 class="font-display text-4xl mt-2">Doctor Visit Clinical Summary</h1><p class="text-sm text-slate-500 mt-1">Generated ${new Date().toLocaleString()}</p></div><div class="grid sm:grid-cols-3 gap-3 mt-5"><div class="bg-amber-50 p-4 rounded-2xl"><span class="text-xs">Average pain</span><b class="block font-display text-3xl">${avg}</b></div><div class="bg-slate-50 p-4 rounded-2xl"><span class="text-xs">Days logged</span><b class="block font-display text-3xl">${logs.length}</b></div><div class="bg-emerald-50 p-4 rounded-2xl"><span class="text-xs">Profile</span><b class="block text-lg">${escapeHtml(store.get('endowarriors_user', { name: 'Warrior' }).name)}</b></div></div><h2 class="font-bold mt-6">Most frequent symptoms</h2><ul class="list-disc ml-5 mt-2 text-sm">${top.map(x => `<li>${escapeHtml(x[0])} —${x[1]} logged day(s)</li>`).join('') || '<li>No symptom data yet.</li>'}</ul><h2 class="font-bold mt-6">Recent entries</h2><div class="mt-2 text-sm space-y-2">${logs.slice(0, 10).map(l => `<div class="border rounded-xl p-3"><b>${l.pain}/10</b> · ${new Date(l.date).toLocaleString()} ·${escapeHtml(l.emotion)}<br><span class="text-slate-600">${escapeHtml(l.locations.join(', '))}</span>${l.note ? `<br><i>${escapeHtml(l.note)}</i>` : ''}</div>`).join('') || 'No entries yet.'}</div><div class="mt-6 bg-amber-50 p-4 rounded-2xl text-sm"><b>Guideline context:</b> ESHRE’s 2022 endometriosis guideline provides evidence-based recommendations on diagnosis and treatment; normal imaging does not rule out endometriosis, and extensive bowel/bladder disease may warrant specialist multidisciplinary care. This report does not demand a particular operation.</div>`;
  openModal('reportModal');
}

function init() {
  renderLogs();
  renderDoctors();
  renderFoods();
  renderCampaigns();
  renderForum();
  initStories();
  renderGround();
  renderUser();
  setAuth('in');
  lucide.createIcons();
}

init();
