/* ═══════════════════════════════════════════════
   SOCIALFLOW — DATA STORE + LOCALSTORAGE ENGINE
   ═══════════════════════════════════════════════ */

/* ─── DEFAULT SEED DATA ─── */
const DEFAULT_DB = {
  clients: [
    { id: 'goviral',  name: 'GoViral Host',     initials: 'GV', color: '#a78bfa', bg: 'rgba(124,92,252,0.22)', status: 'Active', platform: 'Instagram · LinkedIn',  retainer: 25000 },
    { id: 'brandx',   name: 'Brand X Digital',  initials: 'BX', color: '#34d399', bg: 'rgba(6,214,160,0.18)',  status: 'Active', platform: 'Instagram · TikTok',   retainer: 18000 },
    { id: 'fitlife',  name: 'FitLife Studio',   initials: 'FL', color: '#fbbf24', bg: 'rgba(255,209,102,0.18)', status: 'Draft',  platform: 'Instagram',            retainer: 12000 },
    { id: 'zomato',   name: 'Zomato India',     initials: 'ZI', color: '#f87171', bg: 'rgba(239,71,111,0.18)',  status: 'Active', platform: 'Instagram · Twitter', retainer: 40000 },
  ],

  posts: [
    {
      id: 1, client: 'goviral',
      date: '2026-04-01', day: '1', mon: 'APR', dow: 'WED',
      festival: "April Fool's Day",
      title: "April Fool's Hosting Jokes",
      hook: "Humor + relatability — real problems shown as jokes",
      objective: "Virality + Brand Recall",
      format: "Carousel", status: "Published", time: "9:00 AM",
      platforms: ["Instagram","LinkedIn"], approval: "Client Approved",
      assignedTo: "Ravi D.",
      copy: `1. Cover: "Happy April Fool's Day! Here are 5 hosting jokes… (except they're real 😬)"
2. Joke #1: "My website loads in 15 seconds... that's just a feature!"
3. Joke #2: "My host said 99% uptime... the other 1% is 87 hours downtime/year"
4. Joke #3: "SSL certificate? That's optional, right?"
5. Joke #4: "My hosting company replied to my support ticket… in 3 days 💀"
6. Reveal: GoViral — NVMe Speed · 99.9% Uptime · Free SSL · 24x7 Support · ₹49/mo`,
      caption: `Happy April Fool's Day! 🎭\n\nHere are some "jokes" about bad hosting...\n...except none of these are jokes. 😬\n\nGoViral Host Business Hosting starts at just ₹49/mo.\nNo jokes. Just blazing fast speed, 99.9% uptime & free SSL.\n\n🔗 Link in bio to get started.\n#AprilFoolsDay #WebHosting #BusinessHosting #GoViralHost #SmallBusiness #DigitalIndia`,
      driveLink: "https://drive.google.com/drive/folders/1zs46RhoR2X4whH_aKe3uXE9IPb8ZYaXV",
      reach: 4200, saves: 312, shares: 89, likes: 580
    },
    {
      id: 2, client: 'goviral',
      date: '2026-04-02', day: '2', mon: 'APR', dow: 'THU',
      festival: "Hanuman Jayanti",
      title: "Hanuman Jayanti — Strength of GoViral",
      hook: "Respectful cultural tie-in with hosting metaphors",
      objective: "Emotional Connect + Sales",
      format: "Carousel", status: "Published", time: "9:00 AM",
      platforms: ["Instagram"], approval: "Client Approved",
      assignedTo: "Ravi D.",
      copy: `1. Cover: Happy Hanuman Jayanti 🚩\n2. Strength: "He carried mountains. Your website needs a host that never breaks."\n3. Speed: "He crossed oceans in one leap. Your pages should load just as fast."\n4. Protection: "He guarded Ram ji. We guard your data 24x7."\n5. CTA: GoViral Business Hosting — Starting ₹49/mo.`,
      caption: `🚩 Jai Shri Ram! Happy Hanuman Jayanti! 🙏\n\nGoViral Business Hosting:\n💪 Strength — CloudLinux + Imunify360\n⚡ Speed — NVMe SSD, 20× faster\n🛡️ Protection — Free SSL, DDoS protection\n\nStarting at just ₹49/mo 👇\n#HanumanJayanti #JaiHanuman #BusinessHosting #GoViralHost`,
      driveLink: "https://drive.google.com/drive/folders/1S_taB7pBmhFhawifeJYidX0HElSCkMRm",
      reach: 5800, saves: 441, shares: 127, likes: 920
    },
    {
      id: 3, client: 'goviral',
      date: '2026-04-05', day: '5', mon: 'APR', dow: 'SAT',
      festival: "",
      title: "Website Down Nightmare — POV Reel",
      hook: "Pain-point storytelling reel — midnight site-down scenario",
      objective: "Reach + Sales Conversion",
      format: "Reel", status: "Pending", time: "9:00 AM",
      platforms: ["Instagram","LinkedIn"], approval: "Awaiting Approval",
      assignedTo: "Arjun M.",
      copy: `[0–3 sec — HOOK]\nText: "POV: It's midnight. You check your website sales. 😱"\n\n[4–8 sec — PROBLEM BUILD]\n"Your website is down. Your ad is still running."\n\n[9–16 sec — PAIN ESCALATION]\n- "₹10,000 wasted on ads" ❌\n- "Customers gone to competitor" ❌\n\n[17–25 sec — SOLUTION]\nGoViral Business Hosting — 99.9% uptime guarantee\n\n[26–35 sec — CTA]\n"Switch to GoViral Host today — link in bio!"`,
      caption: `Your website going down is a business emergency. 🚨\n\nGoViral Business Hosting:\n✅ 99.9% Uptime\n✅ NVMe Speed\n✅ 24x7 WhatsApp Support\n✅ Starting ₹49/mo\n\n#WebsiteDown #BusinessHosting #GoViralHost`,
      driveLink: "",
      reach: 0, saves: 0, shares: 0, likes: 0
    },
    {
      id: 4, client: 'goviral',
      date: '2026-04-04', day: '4', mon: 'APR', dow: 'SUN',
      festival: "",
      title: "5 Signs Your Hosting Is Killing Your Business",
      hook: "Checklist carousel — self-diagnosis educational tool, high save rate",
      objective: "Lead Generation + Sales",
      format: "Carousel", status: "Published", time: "9:00 AM",
      platforms: ["Instagram","LinkedIn"], approval: "Client Approved",
      assignedTo: "Ravi D.",
      copy: `1. Cover: "5 signs your hosting is KILLING your business 💀"\n2. Sign #1 — Slow Loading: "Your site takes more than 3 seconds to load."\n3. Sign #2 — Frequent Downtime: "Your site goes down more than once a month."\n4. Sign #3 — No SSL: "Your website shows 'Not Secure' in Chrome."\n5. Sign #4 — No Support: "When something breaks, you wait DAYS for a reply."\n6. Sign #5 — No Backup: "You've never taken a backup of your website."\n7. CTA: "GoViral Business Hosting fixes ALL of these. Starting ₹49/mo."`,
      caption: `Is your hosting quietly sabotaging your sales? 😬\n\nSave this post and check how many of these 5 signs apply to you.\n\n#WebHosting #BusinessHosting #GoViralHost #WebsiteSpeed`,
      driveLink: "https://drive.google.com/drive/folders/1abc123def456",
      reach: 6100, saves: 523, shares: 198, likes: 1240
    },
    {
      id: 5, client: 'goviral',
      date: '2026-04-07', day: '7', mon: 'APR', dow: 'TUE',
      festival: "World Health Day",
      title: "World Health Day — Fast Sites, Healthy Business",
      hook: "Festival tie-in — website health checkup metaphor",
      objective: "Brand Awareness + Engagement",
      format: "Carousel", status: "Published", time: "9:00 AM",
      platforms: ["Instagram"], approval: "Client Approved",
      assignedTo: "Ravi D.",
      copy: `1. Cover: "Happy World Health Day 💚 — Is your website HEALTHY?"\n2. Symptoms: "Slow load time, frequent downtime, no SSL = sick website"\n3. Diagnosis: "Your website needs a health checkup"\n4. Treatment: GoViral Business Hosting — the cure for slow, unreliable hosting`,
      caption: `Happy World Health Day! 💚\n\nJust like your body, your website needs regular checkups.\n\nIs your website healthy? Check: Speed · Uptime · Security · Backups\n\n#WorldHealthDay #WebHealth #GoViralHost`,
      driveLink: "",
      reach: 3900, saves: 287, shares: 94, likes: 670
    },
    {
      id: 6, client: 'goviral',
      date: '2026-04-09', day: '9', mon: 'APR', dow: 'THU',
      festival: "",
      title: "₹49 vs ₹5000 Hosting — Comparison Reel",
      hook: "Price war reel — expose premium hosting overpricing",
      objective: "Reach + Sales",
      format: "Reel", status: "Pending", time: "9:00 AM",
      platforms: ["Instagram","LinkedIn"], approval: "Pending Review",
      assignedTo: "Arjun M.",
      copy: `[HOOK] "You're paying ₹5,000/month for hosting. Here's what GoViral gives you for ₹49."\n\n[COMPARISON SLIDES]\nSpeed: Both NVMe SSD ✅\nSSL: Free at GoViral ✅ | ₹2,000/yr elsewhere ❌\nSupport: 24x7 WhatsApp ✅ | Ticket only ❌\nMigration: Free ✅ | Paid ❌\n\n[CTA] "Why pay more? Link in bio."`,
      caption: `You're overpaying for hosting. There. I said it. 😤\n\nGoViral Business Hosting at ₹49/mo includes everything.\n\nTry it with 30-day money-back guarantee. Zero risk.\n\n#WebHosting #BusinessHosting #GoViralHost #AffordableHosting`,
      driveLink: "",
      reach: 0, saves: 0, shares: 0, likes: 0
    },
    {
      id: 7, client: 'goviral',
      date: '2026-04-11', day: '11', mon: 'APR', dow: 'SAT',
      festival: "",
      title: "Real Clients, Real Results — Testimonials",
      hook: "Social proof carousel — before/after client reviews",
      objective: "Trust Building + Conversion",
      format: "Carousel", status: "Scheduled", time: "9:00 AM",
      platforms: ["Instagram"], approval: "Client Approved",
      assignedTo: "Ravi D.",
      copy: `1. Cover: "Real clients. Real results." ⭐⭐⭐⭐⭐\n2. Client #1: "5 websites, zero downtime complaints."\n3. Client #2: "They migrated all my data perfectly."\n4. Client #3: "2 years and counting — earned my trust."\n5. Data: Load time: 15s → 0.8s · Support: 3-day → Same day\n6. CTA: "Join hundreds of happy clients. Starting ₹49/mo"`,
      caption: `Don't just take our word for it. 🙌\n\nOur clients switched to GoViral Business Hosting — and they haven't looked back.\n\nFree migration. 30-day money back.\n\n#GoViralHost #BusinessHosting #ClientResults`,
      driveLink: "https://drive.google.com/drive/folders/1MNI3qiUKiyn4zv3UdLizMce84CO7tueU",
      reach: 0, saves: 0, shares: 0, likes: 0
    },
    {
      id: 8, client: 'brandx',
      date: '2026-04-03', day: '3', mon: 'APR', dow: 'FRI',
      festival: "",
      title: "Brand X — Q2 Launch Announcement",
      hook: "Big reveal carousel for Q2 product launch",
      objective: "Brand Awareness",
      format: "Carousel", status: "Published", time: "10:00 AM",
      platforms: ["Instagram","TikTok"], approval: "Client Approved",
      assignedTo: "Priya S.",
      copy: "Q2 launch announcement carousel — 5 slides detailing new product features.",
      caption: "Something big is coming this Q2! Stay tuned 🚀 #BrandX #NewLaunch",
      driveLink: "",
      reach: 3200, saves: 210, shares: 67, likes: 490
    },
    {
      id: 9, client: 'brandx',
      date: '2026-04-06', day: '6', mon: 'APR', dow: 'MON',
      festival: "",
      title: "Brand X — Behind the Scenes Reel",
      hook: "Team and culture reel — builds authenticity",
      objective: "Brand Awareness + Trust",
      format: "Reel", status: "Pending", time: "11:00 AM",
      platforms: ["Instagram"], approval: "Pending Review",
      assignedTo: "Arjun M.",
      copy: "Behind the scenes at Brand X HQ — team, culture, and process.",
      caption: "This is how we build at Brand X 💪 #BehindTheScenes #TeamWork",
      driveLink: "",
      reach: 0, saves: 0, shares: 0, likes: 0
    },
    {
      id: 10, client: 'fitlife',
      date: '2026-04-08', day: '8', mon: 'APR', dow: 'WED',
      festival: "",
      title: "FitLife — 30-Day Challenge Kickoff",
      hook: "Challenge launch post — drives engagement and sign-ups",
      objective: "Lead Generation",
      format: "Carousel", status: "Draft", time: "8:00 AM",
      platforms: ["Instagram"], approval: "Draft",
      assignedTo: "Priya S.",
      copy: "30-day fitness challenge carousel — day-by-day overview and benefits.",
      caption: "Ready to transform? Join our 30-day challenge! 💪 #FitLife #FitnessChallenge",
      driveLink: "",
      reach: 0, saves: 0, shares: 0, likes: 0
    },
  ],

  festivals: [
    { date: 'Apr 01', name: "April Fool's Day",  day: 1  },
    { date: 'Apr 02', name: "Hanuman Jayanti",   day: 2  },
    { date: 'Apr 07', name: "World Health Day",  day: 7  },
    { date: 'Apr 14', name: "Ambedkar Jayanti",  day: 14 },
    { date: 'Apr 22', name: "World Earth Day",   day: 22 },
    { date: 'Apr 23', name: "World Book Day",    day: 23 },
    { date: 'Apr 24', name: "World Lab Day",     day: 24 },
  ],

  team: [
    { id: 't1', name: 'Tejas Patil',  role: 'Agency Owner',      initials: 'TP', color: '#a78bfa', bg: 'rgba(124,92,252,0.22)', tasks: 3, status: 'Review & approve' },
    { id: 't2', name: 'Priya S.',     role: 'Content Writer',    initials: 'PS', color: '#34d399', bg: 'rgba(6,214,160,0.18)',  tasks: 5, status: 'Captions ready'  },
    { id: 't3', name: 'Ravi D.',      role: 'Graphic Designer',  initials: 'RD', color: '#fbbf24', bg: 'rgba(255,209,102,0.18)', tasks: 2, status: 'Designs pending' },
    { id: 't4', name: 'Meera K.',     role: 'Social Media Exec', initials: 'MK', color: '#f87171', bg: 'rgba(239,71,111,0.18)',  tasks: 4, status: 'Scheduling'      },
    { id: 't5', name: 'Arjun M.',     role: 'Video Editor',      initials: 'AM', color: '#c084fc', bg: 'rgba(192,132,252,0.22)', tasks: 1, status: 'Reels in edit'   },
    { id: 't6', name: 'Sneha R.',     role: 'SEO & Analytics',   initials: 'SR', color: '#38bdf8', bg: 'rgba(56,189,248,0.18)',  tasks: 1, status: 'Monthly report'  },
  ],

  tasks: [
    { id: 'tk1',  title: 'Upload Reel design for Apr 5',    who: 'Ravi D.',  due: 'Apr 4',  status: 'todo',       priority: 'high',   type: 'Reel',    client: 'goviral', notes: '' },
    { id: 'tk2',  title: 'Write captions for Apr 9 reel',  who: 'Priya S.', due: 'Apr 8',  status: 'todo',       priority: 'high',   type: 'Content', client: 'goviral', notes: '' },
    { id: 'tk3',  title: 'Schedule Apr 11 carousel',       who: 'Meera K.', due: 'Apr 10', status: 'todo',       priority: 'medium', type: 'Other',   client: 'goviral', notes: '' },
    { id: 'tk4',  title: 'FitLife 30-day challenge copy',  who: 'Priya S.', due: 'Apr 10', status: 'todo',       priority: 'medium', type: 'Content', client: 'fitlife', notes: '' },
    { id: 'tk5',  title: 'Apr 9 Reel scripting',           who: 'Priya S.', due: 'Apr 8',  status: 'inprogress', priority: 'high',   type: 'Reel',    client: 'goviral', notes: '' },
    { id: 'tk6',  title: 'Apr 11 carousel graphics',       who: 'Ravi D.',  due: 'Apr 10', status: 'inprogress', priority: 'medium', type: 'Poster',  client: 'goviral', notes: '' },
    { id: 'tk7',  title: 'Brand X BTS reel rough cut',     who: 'Arjun M.', due: 'Apr 9',  status: 'inprogress', priority: 'medium', type: 'Reel',    client: 'brandx',  notes: '' },
    { id: 'tk8',  title: 'Apr 4 carousel design uploaded', who: 'Ravi D.',  due: 'Done',   status: 'done',       priority: 'low',    type: 'Poster',  client: 'goviral', notes: '' },
    { id: 'tk9',  title: 'Apr 7 Health Day design done',   who: 'Ravi D.',  due: 'Done',   status: 'done',       priority: 'low',    type: 'Poster',  client: 'goviral', notes: '' },
    { id: 'tk10', title: 'Apr 1 & 2 posts published',      who: 'Meera K.', due: 'Done',   status: 'done',       priority: 'low',    type: 'Other',   client: 'goviral', notes: '' },
  ],

  notifications: [
    { id: 'n1', text: 'GoViral Host — Reel for Apr 9 needs design upload', time: '2 hours ago', read: false },
    { id: 'n2', text: 'Brand X — Client approved Apr carousel ✓',          time: '5 hours ago', read: false },
    { id: 'n3', text: '3 posts scheduled for tomorrow — reminders set',    time: 'Yesterday',   read: false },
    { id: 'n4', text: 'FitLife Studio — Monthly plan pending review',      time: '2 days ago',  read: true  },
    { id: 'n5', text: 'April analytics report ready to download',          time: '3 days ago',  read: true  },
  ],

  waMessages: [
    { type: 'received', text: '👋 Hi! Your April Week 1-2 content plan is ready for review.', time: 'Apr 1 · 9:00 AM' },
    { type: 'received', text: "🗓 Today's post: April Fool's Hosting Jokes — scheduled 9:00 AM ✓", time: 'Apr 1 · 8:30 AM' },
    { type: 'sent',     text: 'Approved! Looks great 👍', time: 'Apr 1 · 8:45 AM' },
    { type: 'received', text: '✅ Post published on Instagram. Reach so far: 4,200 · 312 saves', time: 'Apr 1 · 11:00 AM' },
    { type: 'received', text: '⏳ Reminder: Apr 5 Reel needs design file upload. Please share Drive link by Apr 4.', time: 'Apr 3 · 10:00 AM' },
    { type: 'sent',     text: "Ravi is working on it, will upload by tonight", time: 'Apr 3 · 10:15 AM' },
  ],
};

/* ═══════════════════════════════════════════════
   LOCALSTORAGE ENGINE
   ─ All persistence goes through these functions
   ═══════════════════════════════════════════════ */
const LS_KEY = 'socialflow_db';

/** Load DB from localStorage, falling back to DEFAULT_DB */
function loadDB() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge to ensure new keys in DEFAULT_DB are present
      return Object.assign({}, DEFAULT_DB, parsed);
    }
  } catch (e) {
    console.warn('SocialFlow: Could not load saved data, using defaults.', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DB)); // deep clone
}

/** Save entire DB to localStorage */
function saveDB() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(DB));
  } catch (e) {
    console.warn('SocialFlow: Could not save data.', e);
  }
}

/** Export DB as downloadable JSON file */
function exportData() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `socialflow-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Import DB from JSON file */
function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      // Validate required keys
      if (!imported.clients || !imported.posts) {
        showToast('⚠', 'Invalid backup file — missing required data');
        return;
      }
      Object.assign(DB, imported);
      saveDB();
      renderClientList();
      renderView();
      showToast('✓', 'Data imported successfully!');
    } catch (err) {
      showToast('⚠', 'Failed to import — check file format');
    }
  };
  reader.readAsText(file);
}

/* ─── INITIALISE LIVE DB FROM STORAGE ─── */
const DB = loadDB();
