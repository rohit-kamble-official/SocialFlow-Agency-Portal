/* ═══════════════════════════════════════════════
   SOCIALFLOW — APP ENGINE v2.0
   Upgrades: Login, LocalStorage, Task Manager,
   Quick Actions, Auto-Status, Export/Import
   ═══════════════════════════════════════════════ */

/* ─── USERS (Simple Login — No Backend) ─── */
const USERS = [
  { id: 'tejas', name: 'Tejas Sakore',  role: 'Agency Owner',   initials: 'TP', color: '#a78bfa' },
  { id: 'rohit', name: 'Rohit Kamble', role: 'Content Manager',initials: 'RS', color: '#34d399' },
  { id: 'ravi',  name: 'Ravi D.',      role: 'Graphic Designer',initials: 'RD', color: '#fbbf24' },
  { id: 'arjun', name: 'Arjun M.',     role: 'Video Editor',   initials: 'AM', color: '#c084fc' },
];
const SHARED_PASSWORD = 'socialflow2026';
const LS_USER_KEY = 'socialflow_user';

/* ─── APP STATE ─── */
let state = {
  view: 'dashboard',
  client: 'goviral',
  sidebarCollapsed: false,
  expandedPost: null,
  filterStatus: 'all',
  toastTimer: null,
  searchOpen: false,
  taskFilter: { who: 'all', status: 'all', type: 'all' },
  currentUser: null,
};
let editingClientId = null;


const POST_STATUSES = [
  'Published',
  'Scheduled',
  'Approved',
  'Not Approved',
  'Not Started',
  'NA',
  'Copy Approved',
  'Copy Not Approved'
];


/* ═══════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme immediately before anything renders
  initTheme();

  // Auto-mark past posts as Published
  autoMarkPublished();

  // Check login
  const savedUser = localStorage.getItem(LS_USER_KEY);
  if (savedUser) {
    try {
      state.currentUser = JSON.parse(savedUser);
      bootApp();
    } catch (e) {
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
});

/* ─── AUTO-STATUS: past date posts → Published ─── */
function autoMarkPublished() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let changed = false;
  DB.posts.forEach(p => {
    const postDate = new Date(p.date);
    postDate.setHours(0, 0, 0, 0);
    if (postDate < today && p.status !== 'Published' && p.status !== 'Draft') {
      p.status = 'Published';
      changed = true;
    }
  });
  if (changed) saveDB();
}

/* ═══════════════════════════════════════════════
   LOGIN SYSTEM
   ═══════════════════════════════════════════════ */
function showLoginScreen() {
  document.getElementById('app').style.display = 'none';
  let loginEl = document.getElementById('login-screen');
  if (!loginEl) {
    loginEl = document.createElement('div');
    loginEl.id = 'login-screen';
    document.body.appendChild(loginEl);
  }
  loginEl.innerHTML = `
  <div class="login-bg">
    <div class="login-card">
      <div class="login-logo">
        <div class="logo-icon" style="width:48px;height:48px;font-size:18px;border-radius:14px">ZC</div>
        <div>
          <div class="logo-text" style="font-size:22px">SOCIALFLOW</div>
          <div class="logo-sub" style="font-size:11px">Agency Portal — Zonovva Creative</div>
        </div>
      </div>
      <div class="login-title">Welcome back 👋</div>
      <div class="login-sub">Sign in to continue to your agency dashboard</div>

      <div class="form-group" style="margin-bottom:14px">
        <label class="form-label">Select User</label>
        <select class="form-select" id="login-user" style="font-size:14px;padding:10px 14px">
          ${USERS.map(u => `<option value="${u.id}">${u.name} — ${u.role}</option>`).join('')}
        </select>
      </div>

      <div class="form-group" style="margin-bottom:20px">
        <label class="form-label">Password</label>
        <input type="password" class="form-input" id="login-pass" placeholder="Enter agency password"
          style="font-size:14px;padding:10px 14px"
          onkeydown="if(event.key==='Enter')doLogin()">
      </div>

      <button class="btn btn-primary btn-full" style="padding:12px;font-size:14px" onclick="doLogin()">
        Sign In →
      </button>

      <div id="login-error" style="color:var(--a5);font-size:12px;margin-top:10px;text-align:center;display:none">
        ⚠ Incorrect password. Please try again.
      </div>

      <div style="margin-top:20px;text-align:center;color:var(--text3);font-size:11px">
        Single shared password for all team members
      </div>
    </div>
  </div>`;
  loginEl.style.display = 'flex';
  setTimeout(() => document.getElementById('login-pass')?.focus(), 100);
}

function doLogin() {
  const userId = document.getElementById('login-user')?.value;
  const pass = document.getElementById('login-pass')?.value;
  if (pass !== SHARED_PASSWORD) {
    const err = document.getElementById('login-error');
    if (err) { err.style.display = 'block'; }
    document.getElementById('login-pass').value = '';
    return;
  }
  const user = USERS.find(u => u.id === userId);
  if (!user) return;
  state.currentUser = user;
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  bootApp();
}

function doLogout() {
  localStorage.removeItem(LS_USER_KEY);
  state.currentUser = null;
  document.getElementById('app').style.display = 'none';
  closePanel();
  showLoginScreen();
}

function bootApp() {
  updateUserUI();
  renderClientList();
  renderNotifList();
  setView('dashboard', document.querySelector('.nav-item.active'));
  updateBadges();

  // Add task manager nav item if not present
  ensureTaskManagerNav();

  // Click outside closes panels
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.float-panel') && !e.target.closest('.icon-btn') && !e.target.closest('.avatar-btn')) {
      closePanel();
    }
    if (!e.target.closest('.search-input') && !e.target.closest('.search-overlay')) {
      hideSearch();
    }
  });
}

/** Update topbar and profile panel with logged-in user info */
function updateUserUI() {
  const u = state.currentUser;
  if (!u) return;
  // Avatar button
  const avatarBtn = document.querySelector('.avatar-btn');
  if (avatarBtn) avatarBtn.textContent = u.initials;
  // Profile panel
  const pName = document.querySelector('.profile-name');
  const pRole = document.querySelector('.profile-role');
  const pAvatar = document.querySelector('.profile-avatar');
  if (pName) pName.textContent = u.name;
  if (pRole) pRole.textContent = u.role + ' · SocialFlow';
  if (pAvatar) { pAvatar.textContent = u.initials; pAvatar.style.background = u.color + '33'; pAvatar.style.color = u.color; }
}

// /** Inject Task Manager nav item if not already in DOM */
// function ensureTaskManagerNav() {
//   if (!document.querySelector('[data-view="taskmanager"]')) {
//     const workspaceNav = document.querySelectorAll('.nav-section')[1];
//     if (workspaceNav) {
//       const item = document.createElement('div');
//       item.className = 'nav-item';
//       item.dataset.view = 'taskmanager';
//       item.onclick = () => setView('taskmanager', item);
//       item.innerHTML = '<span class="nav-icon">✅</span><span class="nav-text">Task Manager</span><span class="nav-badge nav-text" id="task-badge" style="background:rgba(168,85,247,0.3);color:#a855f7"></span>';
//       workspaceNav.insertBefore(item, workspaceNav.children[1]);
//     }
//   }
// }

/* ══════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════ */
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    const isOpen = sb.classList.toggle('mobile-open');
    // manage backdrop
    let backdrop = document.getElementById('sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      backdrop.className = 'sidebar-backdrop';
      backdrop.onclick = () => closeSidebarMobile();
      document.body.appendChild(backdrop);
    }
    backdrop.classList.toggle('visible', isOpen);
  } else {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    sb.classList.toggle('collapsed', state.sidebarCollapsed);
    const collapseBtn = document.getElementById('collapseBtn');
    if (collapseBtn) collapseBtn.title = state.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
  }
}

function closeSidebarMobile() {
  const sb = document.getElementById('sidebar');
  sb.classList.remove('mobile-open');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.classList.remove('visible');
}

function renderClientList() {
  const el = document.getElementById('client-list');

  el.innerHTML = DB.clients.map(c => `
    <div class="client-item ${c.id === state.client ? 'selected' : ''}" onclick="selectClient('${c.id}')">

      <div class="client-avatar" style="background:${c.bg};color:${c.color}">
        ${c.initials}
      </div>

      <div class="client-info">
        <div class="client-name">${c.name}</div>
        <div class="client-meta">${DB.posts.filter(p => p.client === c.id).length} posts</div>
      </div>

      <!-- EDIT BUTTON -->
      <button onclick="event.stopPropagation(); openEditClient('${c.id}')" 
        style="background:none;border:none;color:var(--text3);cursor:pointer;">✏</button>

      <div class="client-dot ${c.status === 'Draft' ? 'yellow' : c.status === 'Paused' ? 'red' : ''}"></div>
    </div>
  `).join('');
}

function selectClient(id) {
  state.client = id;
  state.expandedPost = null;
  renderClientList();
  const c = DB.clients.find(x => x.id === id);
  document.getElementById('page-sub').textContent = (c ? c.name + ' · ' : '') + 'April 2026';
  renderView();
}

/* ══════════════════════════════════════════════════
   VIEW ROUTER
══════════════════════════════════════════════════ */
function setView(view, el) {
  state.view = view;
  state.expandedPost = null;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = el || document.querySelector(`[data-view="${view}"]`);
  if (target) target.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', calendar: 'Content Calendar',
    planner: 'Post Planner', approvals: 'Approvals',
    analytics: 'Analytics', report: 'Monthly Report',
    team: 'Team & Tasks', taskmanager: 'Task Manager',
    docs: 'Documents', whatsapp: 'WhatsApp Bot',
    clientportal: 'Client Portal', settings: 'Settings'
  };
  document.getElementById('page-title').textContent = titles[view] || view;
  const c = DB.clients.find(x => x.id === state.client);
  document.getElementById('page-sub').textContent = (c ? c.name + ' · ' : '') + 'April 2026';
  renderView();
  closePanel();
  // Close sidebar on mobile after nav selection
  if (window.innerWidth <= 768) closeSidebarMobile();
  const ca = document.getElementById('content-area');
  if (ca) ca.scrollTop = 0;
}

function renderView() {
  const el = document.getElementById('content-inner');
  const views = {
    dashboard:    renderDashboard,
    calendar:     renderCalendar,
    planner:      renderPlanner,
    approvals:    renderApprovals,
    analytics:    renderAnalytics,
    report:       renderReport,
    team:         renderTeam,
    taskmanager:  renderTaskManager,
    docs:         renderDocs,
    whatsapp:     renderWhatsApp,
    clientportal: renderClientPortal,
    settings:     renderSettings,
  };
  el.innerHTML = (views[state.view] || renderDashboard)();
}

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
function clientPosts(id) {
  return DB.posts.filter(p => p.client === (id || state.client));
}

function chip(label, cls) {
  return `<span class="chip ${cls}">${label}</span>`;
}

function statusChip(s) {
  const map = { Published:'chip-green', Pending:'chip-yellow', Scheduled:'chip-blue', Draft:'chip-gray', Approved:'chip-green' };
  return chip(s, map[s] || 'chip-gray');
}

function formatChip(f) {
  const map = { Carousel:'chip-purple', Reel:'chip-red', Story:'chip-orange', Static:'chip-blue' };
  return chip(f, map[f] || 'chip-gray');
}

function approvalChip(a) {
  if (!a) return '';
  const map = { 'Client Approved':'chip-green', 'Approved':'chip-green', 'Awaiting Approval':'chip-yellow', 'Pending Review':'chip-yellow', 'Draft':'chip-gray' };
  return chip(a, map[a] || 'chip-gray');
}

function fmtNum(n) {
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toString();
}

function getFestivalMap() {
  const m = {};
  DB.festivals.forEach(f => m[f.day] = f.name);
  return m;
}

function taskStatusColor(s) {
  const map = { Pending:'var(--a4)', 'In Progress':'var(--a6)', Completed:'var(--a3)', Sent:'var(--accent2)' };
  return map[s] || 'var(--text3)';
}

/* ══════════════════════════════════════════════════
   POST CARD RENDERER
══════════════════════════════════════════════════ */
function renderPostCard(p, opts = {}) {
  const isExpanded = state.expandedPost === p.id;
  const hasDrive = !!p.driveLink;
  const hasReach = p.reach > 0;

  // Quick-action team buttons
  const quickActions = `
  <div class="status-box">

    <div style="font-size:10px;color:var(--text3);margin-bottom:6px;font-weight:600">
      🚦 STATUS
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:6px">

      ${[
        'Published',
        'Scheduled',
        'Approved',
        'Not Approved',
        'Not Started',
        'NA',
        'Copy Approved',
        'Copy Not Approved'
      ].map(s => `
        <button 
          class="status-btn ${p.status === s ? 'active' : ''}" 
          onclick="event.stopPropagation(); updatePostStatus(${p.id}, '${s}')">
          ${s}
        </button>
      `).join('')}

    </div>

  </div>`;

  return `
  <div class="post-card" id="pc-${p.id}">
    <div class="post-header" onclick="togglePost(${p.id})">
      <div class="post-date-box">
        <div class="post-day">${p.day}</div>
        <div class="post-mon">${p.mon}</div>
      </div>
      <div class="post-meta">
        <div class="post-chips">
          ${statusChip(p.status)}
          ${formatChip(p.format)}
          ${p.festival ? chip('🎉 ' + p.festival, 'chip-orange') : ''}
          ${chip('⏰ ' + p.time, 'chip-gray')}
          ${hasReach ? chip('👁 ' + fmtNum(p.reach) + ' reach', 'chip-blue') : ''}
        </div>
        <div class="post-title">${p.title}</div>
        <div class="post-hook">${p.hook}</div>
        <div class="post-actions-inline">
          ${p.platforms.map(pl => chip(pl, 'chip-gray')).join('')}
          ${approvalChip(p.approval)}
        </div>
      </div>
      <div class="post-chevron ${isExpanded ? 'open' : ''}" id="chev-${p.id}">⌄</div>
    </div>

    <div class="post-expand ${isExpanded ? 'open' : ''}" id="exp-${p.id}">
      <div class="expand-inner">
       

        <div class="expand-grid">
          <div class="expand-block">
            <div class="expand-block-label">📋 Post Copy / Script</div>
            <div class="expand-block-text">${p.copy}</div>
          </div>
          <div class="expand-block">
            <div class="expand-block-label">💬 Caption & Hashtags</div>
            <div class="expand-block-text caption-box">${p.caption}</div>
          </div>
        </div>

        ${hasReach ? `
        <div class="perf-mini" style="margin-bottom:12px">
          <div class="perf-mini-item"><div class="perf-mini-val" style="color:var(--accent2)">${fmtNum(p.reach)}</div><div class="perf-mini-lbl">Reach</div></div>
          <div class="perf-mini-item"><div class="perf-mini-val" style="color:var(--a3)">${p.saves}</div><div class="perf-mini-lbl">Saves</div></div>
          <div class="perf-mini-item"><div class="perf-mini-val" style="color:var(--a6)">${p.shares}</div><div class="perf-mini-lbl">Shares</div></div>
        </div>` : ''}

        ${quickActions}

        <div class="post-btn-row">
          ${hasDrive ? `<a class="btn" href="${p.driveLink}" target="_blank">📁 Design Files</a>` : `<button class="btn" onclick="showToast('📁','Drive link saved!')">+ Upload Design</button>`}
          ${p.status !== 'Published' ? `<button class="btn btn-success" onclick="markStatus(${p.id},'Published')">✓ Mark Published</button>` : ''}
          ${p.status === 'Published' ? `<button class="btn btn-warning" onclick="duplicatePost(${p.id})">Duplicate</button>` : ''}
          <button class="btn" onclick="openModal('editPost',${p.id})">✏ Edit</button>
          <button class="btn" onclick="copyCaption(${p.id})">Copy Caption</button>
          <button class="btn btn-danger" style="margin-left:auto" onclick="deletePost(${p.id})">Delete</button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ─── QUICK ASSIGN: creates a task from a post card ─── */
function quickAssign(postId, teamMemberId, taskType) {
  const post = DB.posts.find(x => x.id === postId);
  const member = DB.team.find(x => x.id === teamMemberId);
  if (!post || !member) return;

  const newTask = {
    id: 'tk' + Date.now(),
    title: `${taskType} for "${post.title}"`,
    who: member.name,
    due: `Apr ${post.day}`,
    status: 'Pending',
    priority: 'high',
    type: taskType,
    client: post.client,
    notes: `Auto-created from post: ${post.title}`,
    postId: postId,
  };
  DB.tasks.unshift(newTask);
  saveDB();
  updateTaskBadge();
  showToast('⚡', `${taskType} assigned to ${member.name}!`);
}

function togglePost(id) {
  const wasOpen = state.expandedPost === id;
  state.expandedPost = wasOpen ? null : id;
  document.querySelectorAll('.post-expand').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.post-chevron').forEach(el => { el.classList.remove('open'); el.textContent = '⌄'; });
  if (!wasOpen) {
    const exp = document.getElementById('exp-' + id);
    const chev = document.getElementById('chev-' + id);
    if (exp) exp.classList.add('open');
    if (chev) { chev.classList.add('open'); chev.textContent = '⌃'; }
  }
}

function markStatus(id, status) {
  const p = DB.posts.find(x => x.id === id);
  if (p) { p.status = status; }
  saveDB();
  showToast('✓', 'Post marked as ' + status + '!');
  renderView();
  updateBadges();
}

function deletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return;
  const idx = DB.posts.findIndex(x => x.id === id);
  if (idx > -1) DB.posts.splice(idx, 1);
  saveDB();
  showToast('🗑', 'Post deleted');
  renderView();
}

function duplicatePost(id) {
  const p = DB.posts.find(x => x.id === id);
  if (!p) return;
  const clone = Object.assign({}, p, {
    id: Date.now(),
    status: 'Draft',
    approval: 'Draft',
    reach: 0, saves: 0, shares: 0, likes: 0,
    title: p.title + ' (Copy)',
  });
  DB.posts.push(clone);
  saveDB();
  showToast('📋', 'Post duplicated as Draft!');
  renderView();
}

function copyCaption(id) {
  const p = DB.posts.find(x => x.id === id);
  if (p && navigator.clipboard) {
    navigator.clipboard.writeText(p.caption).then(() => showToast('📋', 'Caption copied to clipboard!'));
  } else {
    showToast('📋', 'Caption copied!');
  }
}

function deleteClientFromModal() {
  if (!editingClientId) return;

  if (!confirm("Delete this client?")) return;

  DB.clients = DB.clients.filter(c => c.id !== editingClientId);

  editingClientId = null;
  saveDB();
  closeModal();
  renderClientList();

  showToast('🗑','Client deleted');
}

function sendForApproval(id) {
  showToast('📲', 'Approval request sent via WhatsApp!');
}

function updateBadges() {
  const pend = DB.posts.filter(p => p.status === 'Pending').length;
  const approv = DB.posts.filter(p => p.approval === 'Awaiting Approval' || p.approval === 'Pending Review').length;
  const pb = document.getElementById('planner-badge');
  const ab = document.getElementById('approval-badge');
  if (pb) pb.textContent = pend;
  if (ab) ab.textContent = approv;
  updateTaskBadge();
}

function updateTaskBadge() {
  const tb = document.getElementById('task-badge');
  const open = DB.tasks.filter(t => t.status !== 'done' && t.status !== 'Completed').length;
  if (tb) tb.textContent = open || '';
}

/* ══════════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════════ */
function renderDashboard() {
  const cp = clientPosts();
  const pub = cp.filter(p => p.status === 'Published').length;
  const pend = cp.filter(p => p.status === 'Pending').length;
  const sched = cp.filter(p => p.status === 'Scheduled').length;
  const totalReach = cp.reduce((a, p) => a + p.reach, 0);
  const totalSaves = cp.reduce((a, p) => a + p.saves, 0);
  const cl = DB.clients.find(x => x.id === state.client);

  const filteredPosts = state.filterStatus === 'all' ? cp :
    cp.filter(p => p.status.toLowerCase() === state.filterStatus);

  return `
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Posts</div>
      <div class="stat-value" style="color:var(--accent2)">${cp.length}</div>
      <div class="stat-delta">April Monthly Performance</div>
      <div class="stat-bar"><div class="stat-bar-fill" style="width:${cp.length * 10}%;background:var(--accent)"></div></div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Published</div>
      <div class="stat-value" style="color:var(--a3)">${pub}</div>
      <div class="stat-delta" style="color:var(--a3)">↑ ${cp.length ? Math.round(pub/cp.length*100) : 0}% complete</div>
      <div class="stat-bar"><div class="stat-bar-fill" style="width:${cp.length ? pub/cp.length*100 : 0}%;background:var(--a3)"></div></div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Scheduled</div>
      <div class="stat-value" style="color:var(--a6)">${sched}</div>
      <div class="stat-delta">Auto-posting on</div>
      <div class="stat-bar"><div class="stat-bar-fill" style="width:${cp.length ? sched/cp.length*100 : 0}%;background:var(--a6)"></div></div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Pending</div>
      <div class="stat-value" style="color:var(--a4)">${pend}</div>
      <div class="stat-delta" style="color:var(--a4)">Needs attention</div>
      <div class="stat-bar"><div class="stat-bar-fill" style="width:${cp.length ? pend/cp.length*100 : 0}%;background:var(--a4)"></div></div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Total Reach</div>
      <div class="stat-value" style="color:var(--a7)">${fmtNum(totalReach)}</div>
      <div class="stat-delta" style="color:var(--a3)">↑ 18% vs last month</div>
      <div class="stat-bar"><div class="stat-bar-fill" style="width:70%;background:var(--a7)"></div></div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 270px;gap:16px">

    <!-- LEFT SIDE -->
    <div>
      <div class="section-header">
        <div class="section-title">Content Plan — ${cl ? cl.name : ''}</div>
        <div style="display:flex;gap:5px">
          ${['all','published','pending','scheduled'].map(f =>
            `<span class="chip ${state.filterStatus===f?'chip-purple':'chip-gray'}" style="cursor:pointer" onclick="setFilter('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</span>`
          ).join('')}
        </div>
      </div>

      <div class="posts-list">
        ${filteredPosts.length 
          ? filteredPosts.map(p => renderPostCard(p)).join('') 
          : '<div class="empty-state"><div class="empty-state-icon">🎉</div>No posts match this filter</div>'}
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div>

      <!-- FESTIVALS -->
      <div class="card" style="margin-bottom:10px;padding:14px">
        <div class="stat-label" style="margin-bottom:10px">🗓 April Festivals</div>
        ${DB.festivals.map(f => `
        <div class="info-row">
          <span style="display:flex;align-items:center;gap:7px">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--a4);display:inline-block;"></span>
            <span style="color:var(--text3);font-size:10px;width:44px;">${f.date}</span>
            <span style="font-size:11px">${f.name}</span>
          </span>
        </div>`).join('')}
      </div>

      <!-- 🔥 MONTHLY REPORT -->
      <div class="card" style="padding:14px;margin-bottom:10px">
        <div class="stat-label" style="margin-bottom:10px">📊 Monthly Report</div>

        ${[
          ['Total Posts', cp.length, 'var(--accent2)'],
          ['Published', pub, 'var(--a3)'],
          ['Reels', cp.filter(p=>p.format==='Reel').length, 'var(--a5)'],
          ['Carousels', cp.filter(p=>p.format==='Carousel').length, 'var(--accent2)'],
          ['Total Reach', fmtNum(totalReach), 'var(--a7)'],
          ['Total Saves', totalSaves, 'var(--a3)'],
          ['Total Shares', cp.reduce((a,p)=>a+p.shares,0), 'var(--a6)']
        ].map(([l,v,c]) => `
          <div class="info-row">
            <span class="info-row-label">${l}</span>
            <span style="color:${c};font-weight:600">${v}</span>
          </div>
        `).join('')}

      </div>

      <button class="btn btn-primary btn-full" onclick="openModal('addPost')" style="margin-bottom:7px">
        + Add Post
      </button>

      <button class="btn btn-full" onclick="setView('calendar')" style="margin-bottom:10px">
        View Calendar →
      </button>

      ${renderInsightsWidget()}
    </div>
  </div>`;
}

function setFilter(f) {
  state.filterStatus = f;
  renderView();
}

/* ══════════════════════════════════════════════════
   CALENDAR
══════════════════════════════════════════════════ */
function renderCalendar() {
  const cp = clientPosts();
  const postMap = {};
  cp.forEach(p => {
    const d = new Date(p.date).getDate();
    if (!postMap[d]) postMap[d] = [];
    postMap[d].push(p);
  });
  const festMap = getFestivalMap();
  const fmtCls = { Carousel:'cal-ev-carousel', Reel:'cal-ev-reel', Story:'cal-ev-story', Static:'cal-ev-static' };

  let cells = ['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d =>
    `<div class="cal-day-header">${d}</div>`
  ).join('');

  for (let i = 0; i < 3; i++) cells += `<div class="cal-day empty"></div>`;

  for (let d = 1; d <= 30; d++) {
    const ps = postMap[d] || [];
    const fest = festMap[d] || '';
    const dayOfWeek = (d + 2) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = d === 14;

    cells += `<div class="cal-day${isToday?' today':''}${ps.length?' has-post':''}${isWeekend?' weekend':''}">
      <div class="cal-day-num${isToday?' today-num':''}">${d}</div>
      ${ps.map(p => `<div class="cal-event ${fmtCls[p.format]||'cal-ev-static'}" onclick="openModal('viewPost',${p.id})" title="${p.title}">${p.format[0]}·${p.title.slice(0,12)}</div>`).join('')}
      ${fest ? `<div class="cal-festival">✨${fest.slice(0,14)}</div>` : ''}
    </div>`;
  }

  return `
  <div class="cal-nav">
    <button class="btn" onclick="showToast('◀','March 2026')">← Mar</button>
    <div class="cal-month-label">April 2026</div>
    <button class="btn" onclick="showToast('▶','May 2026')">May →</button>
    <button class="btn btn-primary" style="margin-left:auto" onclick="openModal('addPost')">+ Add Post</button>
    <button class="btn" onclick="showToast('📅','Calendar exported!')">Export PDF</button>
  </div>

  <div class="cal-grid">${cells}</div>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
    <div class="cal-legend">
      <div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(124,92,252,0.5)"></div>Carousel</div>
      <div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(239,71,111,0.5)"></div>Reel</div>
      <div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(255,209,102,0.5)"></div>Story</div>
      <div class="cal-legend-item"><div class="cal-legend-dot" style="background:rgba(6,214,160,0.5)"></div>Published</div>
    </div>
  </div>

  <div class="section-header"><div class="section-title">All Posts This Period</div></div>
  <div class="posts-list">${cp.map(p => renderPostCard(p)).join('')}</div>`;
}

/* ══════════════════════════════════════════════════
   PLANNER
══════════════════════════════════════════════════ */
function renderPlanner() {
  const cp = clientPosts();
  const pending = cp.filter(p => p.status === 'Pending' || p.status === 'Draft');

  return `
  <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Posts that need action — add copy, upload designs, get client approval.</div>

  <div class="approval-flow">
    ${[
      ['✏','Write Copy','Content writer adds hook, copy & caption'],
      ['🎨','Design','Designer uploads Canva / Drive link'],
      ['✓','Review','Agency owner reviews before sending'],
      ['📲','Approve','Client approves via portal or WhatsApp'],
    ].map(([ic,t,s]) => `
    <div class="af-step">
      <div class="af-icon">${ic}</div>
      <div class="af-title">${t}</div>
      <div class="af-sub">${s}</div>
    </div>`).join('')}
  </div>

  <div class="tab-bar">
    <div class="tab active">All Pending (${pending.length})</div>
    <div class="tab" onclick="showToast('🎨','Filter: Needs Design')">Needs Design</div>
    <div class="tab" onclick="showToast('✏','Filter: Needs Copy')">Needs Copy</div>
    <div class="tab" onclick="showToast('⏳','Filter: Needs Approval')">Needs Approval</div>
  </div>

  <div class="posts-list">
    ${pending.length ? pending.map(p => renderPostCard(p)).join('') :
      '<div class="empty-state"><div class="empty-state-icon">🎉</div>All posts are up to date!</div>'}
  </div>`;
}

/* ══════════════════════════════════════════════════
   APPROVALS
══════════════════════════════════════════════════ */
function renderApprovals() {
  const allPosts = DB.posts.filter(p => p.client === state.client);
  const pending = allPosts.filter(p => p.approval === 'Awaiting Approval' || p.approval === 'Pending Review');
  const approved = allPosts.filter(p => p.approval === 'Client Approved');

  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div>
      <div class="section-header">
        <div class="section-title">Pending Approval</div>
        <span class="chip chip-yellow">${pending.length}</span>
      </div>
      <div class="posts-list">
        ${pending.map(p => `
        <div class="post-card">
          <div class="post-header" style="cursor:default">
            <div class="post-date-box"><div class="post-day">${p.day}</div><div class="post-mon">${p.mon}</div></div>
            <div class="post-meta">
              <div class="post-chips">${chip('⏳ Awaiting Approval','chip-yellow')} ${formatChip(p.format)}</div>
              <div class="post-title">${p.title}</div>
              <div class="post-hook">${p.hook}</div>
            </div>
          </div>
          <div style="padding:8px 14px 12px;display:flex;gap:7px;flex-wrap:wrap">
            <button class="btn btn-success btn-sm" onclick="approvePost(${p.id})">✓ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="showToast('↩','Changes requested — team notified')">✗ Request Changes</button>
            <button class="btn btn-sm" onclick="showToast('📲','Sent to client WhatsApp!')">Send to Client</button>
            <button class="btn btn-sm" onclick="openModal('viewPost',${p.id})">Preview</button>
          </div>
        </div>`).join('') || '<div class="empty-state"><div class="empty-state-icon">✓</div>No posts pending approval</div>'}
      </div>
    </div>
    <div>
      <div class="section-header">
        <div class="section-title">Client Approved</div>
        <span class="chip chip-green">${approved.length}</span>
      </div>
      <div class="posts-list">
        ${approved.map(p => `
        <div class="post-card">
          <div class="post-header" style="cursor:default">
            <div class="post-date-box"><div class="post-day" style="color:var(--a3)">${p.day}</div><div class="post-mon">${p.mon}</div></div>
            <div class="post-meta">
              <div class="post-chips">${chip('✓ Client Approved','chip-green')} ${formatChip(p.format)} ${statusChip(p.status)}</div>
              <div class="post-title">${p.title}</div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function approvePost(id) {
  const p = DB.posts.find(x => x.id === id);
  if (p) { p.approval = 'Client Approved'; p.status = 'Scheduled'; }
  saveDB();
  showToast('✓', 'Post approved and scheduled!');
  updateBadges();
  renderView();
}

/* ══════════════════════════════════════════════════
   ANALYTICS
══════════════════════════════════════════════════ */
function renderAnalytics() {
  const cp = clientPosts().filter(p => p.reach > 0);
  const all = clientPosts();
  const totalReach = cp.reduce((a,p) => a+p.reach, 0);
  const totalSaves = cp.reduce((a,p) => a+p.saves, 0);
  const totalShares = cp.reduce((a,p) => a+p.shares, 0);
  const eng = totalReach > 0 ? ((totalSaves+totalShares)/totalReach*100).toFixed(1) : '0.0';
  const maxReach = Math.max(...cp.map(p => p.reach), 1);

  const weekBars = [
    {w:'W1',v:65,c:'var(--accent)'},{w:'W2',v:85,c:'var(--accent)'},
    {w:'W3',v:40,c:'var(--bg5)'},{w:'W4',v:20,c:'var(--bg5)'}
  ];
  const maxBar = Math.max(...weekBars.map(b=>b.v));

  return `
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">
    ${[
      ['Total Reach',fmtNum(totalReach),'var(--accent2)','↑ 18%'],
      ['Total Saves',totalSaves,'var(--a3)','↑ 23%'],
      ['Total Shares',totalShares,'var(--a6)','↑ 12%'],
      ['Avg Engagement',eng+'%','var(--a7)','↑ 2.1%'],
    ].map(([l,v,c,d]) => `
    <div class="stat-card">
      <div class="stat-label">${l}</div>
      <div class="stat-value" style="color:${c}">${v}</div>
      <div class="stat-delta" style="color:var(--a3)">${d} vs last week</div>
    </div>`).join('')}
  </div>

  <div class="analytics-top">
    <div class="ana-card">
      <div class="ana-title">Posts Published</div>
      <div class="ana-sub">By week — April 2026</div>
      <div class="bar-chart-row">
        ${weekBars.map(b => `
        <div class="bar-col">
          <div class="bar-fill-item" style="height:${b.v/maxBar*50}px;background:${b.c}" title="${b.w}: ${b.v}%"></div>
          <div style="font-size:8px;color:var(--text3);margin-top:4px">${b.w}</div>
        </div>`).join('')}
      </div>
    </div>

    <div class="ana-card">
      <div class="ana-title">Content Mix</div>
      <div class="ana-sub">Format breakdown</div>
      <svg width="80" height="80" viewBox="0 0 80 80" style="display:block;margin:0 auto 10px">
        <circle cx="40" cy="40" r="28" fill="none" stroke="var(--accent)" stroke-width="13" stroke-dasharray="106 70" stroke-dashoffset="-4" transform="rotate(-90 40 40)"/>
        <circle cx="40" cy="40" r="28" fill="none" stroke="var(--a5)" stroke-width="13" stroke-dasharray="70 106" stroke-dashoffset="-110" transform="rotate(-90 40 40)"/>
        <text x="40" y="44" text-anchor="middle" fill="var(--text)" font-size="11" font-family="Syne,sans-serif" font-weight="700">71%</text>
      </svg>
      <div style="display:flex;gap:12px;justify-content:center;font-size:10px">
        <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:2px;background:var(--accent);display:inline-block"></span>Carousel</span>
        <span style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:2px;background:var(--a5);display:inline-block"></span>Reel</span>
      </div>
    </div>

    <div class="ana-card" style="grid-column:span 2">
      <div class="ana-title">Platform Performance</div>
      <div class="ana-sub">Estimated reach by platform</div>
      <div class="platform-grid">
        ${[['Instagram','12.8K','var(--a5)'],['LinkedIn','4.7K','var(--a6)'],['TikTok','—','var(--text3)'],['Twitter/X','—','var(--text3)']].map(([n,v,c]) => `
        <div class="platform-card">
          <div class="platform-name">${n}</div>
          <div class="platform-val" style="color:${c}">${v}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="ana-card">
    <div class="ana-title" style="margin-bottom:4px">Post Performance Ranking</div>
    <div class="ana-sub">Published posts only — sorted by reach</div>
    ${cp.sort((a,b) => b.reach-a.reach).map(p => `
    <div class="perf-list-row">
      <span class="perf-list-name">${p.title}</span>
      <div class="perf-bar-track"><div class="perf-bar-fill" style="width:${p.reach/maxReach*100}%;background:var(--accent)"></div></div>
      <span class="perf-list-val">${fmtNum(p.reach)}</span>
      ${chip('💾 '+p.saves, 'chip-green')}
    </div>`).join('')}
  </div>`;
}

/* ══════════════════════════════════════════════════
   MONTHLY REPORT
══════════════════════════════════════════════════ */
function renderReport() {
  const cp = clientPosts();
  const pub = cp.filter(p => p.reach > 0);
  const totalReach = pub.reduce((a,p) => a+p.reach, 0);
  const totalSaves = pub.reduce((a,p) => a+p.saves, 0);
  const totalShares = pub.reduce((a,p) => a+p.shares, 0);
  const eng = totalReach > 0 ? ((totalSaves+totalShares)/totalReach*100).toFixed(1) : '0.0';
  const cl = DB.clients.find(x => x.id === state.client);

  return `
  <div class="client-portal-banner">
    📊 Monthly Performance Report — ${cl?.name} · April 2026
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="btn btn-success btn-sm" onclick="showToast('📥','Report downloaded as PDF!')">Download PDF</button>
      <button class="btn btn-sm" onclick="showToast('📧','Report emailed to client!')">Email to Client</button>
    </div>
  </div>

  <div class="report-section">
    <div class="report-title">📈 Executive Summary</div>
    <div class="report-metrics">
      ${[
        [fmtNum(totalReach),'Total Reach','var(--accent2)'],
        [totalSaves,'Total Saves','var(--a3)'],
        [totalShares,'Total Shares','var(--a6)'],
        [eng+'%','Avg Engagement','var(--a7)'],
      ].map(([v,l,c]) => `<div class="report-metric"><div class="report-metric-val" style="color:${c}">${v}</div><div class="report-metric-lbl">${l}</div></div>`).join('')}
    </div>
    <div class="report-body">
      April Week 1–2 was a strong period with ${cp.length} posts. Festival content significantly outperformed baseline by 22–38%. The "5 Signs" educational carousel achieved the highest saves (523) — proving that value-led content drives saves and shares more than promotional posts.
    </div>
  </div>

  <div class="report-section">
    <div class="report-title">🏆 Top Performing Posts</div>
    ${pub.sort((a,b) => b.reach-a.reach).slice(0,3).map((p,i) => `
    <div class="perf-list-row">
      <span style="font-family:Syne,sans-serif;font-size:18px;font-weight:800;color:${['var(--a4)','var(--text2)','var(--a7)'][i]};width:22px">${i+1}</span>
      <div style="flex:1">
        <div style="font-weight:600;font-size:12px">${p.title}</div>
        <div style="font-size:10px;color:var(--text3)">${p.format} · ${p.dow} Apr ${p.day}</div>
      </div>
      <div style="text-align:right">
        <div style="color:var(--accent2);font-weight:600;font-size:12px">${fmtNum(p.reach)} reach</div>
        <div style="font-size:10px;color:var(--text3)">${p.saves} saves · ${p.shares} shares</div>
      </div>
    </div>`).join('')}
  </div>

  <div class="report-section">
    <div class="report-title">💡 Recommendations for May</div>
    ${[
      ['Increase Reel Frequency','Target 3 Reels/week — they drive 2× more reach than carousels.','var(--a5)'],
      ['Festival Content Pipeline',"May: Labour Day, Mother's Day, Buddha Purnima — plan at least 2 weeks ahead.",'var(--a4)'],
      ['Client Testimonials Push','Collect 2 new reviews in May. Testimonial posts drive highest trust conversions.','var(--a3)'],
      ['LinkedIn Strategy','Add LinkedIn-native document posts and polls. Untapped B2B reach.','var(--a6)'],
    ].map(([t,s,c]) => `
    <div class="recommendation-item">
      <div class="rec-bar" style="background:${c}"></div>
      <div><div class="rec-title">${t}</div><div class="rec-sub">${s}</div></div>
    </div>`).join('')}
  </div>`;
}

/* ══════════════════════════════════════════════════
   TEAM
══════════════════════════════════════════════════ */
function renderTeam() {
  const todo = DB.tasks.filter(t => t.status === 'todo');
  const inprog = DB.tasks.filter(t => t.status === 'inprogress');
  const done = DB.tasks.filter(t => t.status === 'done');

  return `
  <div class="team-grid">
    ${DB.team.map(t => `
    <div class="team-card">
      <div class="team-avatar" style="background:${t.bg};color:${t.color}">${t.initials}</div>
      <div class="team-name">${t.name}</div>
      <div class="team-role">${t.role}</div>
      ${chip(t.tasks + ' tasks · ' + t.status, 'chip-purple')}
    </div>`).join('')}
  </div>

  <div class="section-header" style="margin-bottom:13px">
    <div class="section-title">Task Board</div>
    <button class="btn btn-primary btn-sm" onclick="openModal('addTask')">+ Add Task</button>
  </div>

  <div class="task-board">
    <div class="task-col">
      <div class="task-col-header">To Do ${chip(todo.length,'chip-yellow')}</div>
      <div class="task-col-body">
        ${todo.map(t => `
        <div class="task-item" onclick="moveTask('${t.id}','inprogress')">
          <div class="task-item-title">${t.title}</div>
          <div class="task-item-meta">
            <span>${t.who}</span>
            <span style="margin-left:auto;color:var(--a5)">Due ${t.due}</span>
            ${chip(t.priority,'chip-red')}
          </div>
        </div>`).join('')}
        <button class="btn btn-full btn-sm" onclick="openModal('addTask')">+ Add Task</button>
      </div>
    </div>
    <div class="task-col">
      <div class="task-col-header">In Progress ${chip(inprog.length,'chip-blue')}</div>
      <div class="task-col-body">
        ${inprog.map(t => `
        <div class="task-item" onclick="moveTask('${t.id}','done')">
          <div class="task-item-title">${t.title}</div>
          <div class="task-item-meta">
            <span>${t.who}</span>
            <span style="margin-left:auto;color:var(--a4)">Due ${t.due}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div class="task-col">
      <div class="task-col-header">Done ${chip(done.length,'chip-green')}</div>
      <div class="task-col-body">
        ${done.map(t => `
        <div class="task-item" style="opacity:0.55">
          <div class="task-item-title" style="text-decoration:line-through">${t.title}</div>
          <div class="task-item-meta"><span style="color:var(--a3)">✓ ${t.who}</span></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function moveTask(id, newStatus) {
  const t = DB.tasks.find(x => x.id === id);
  if (t) { t.status = newStatus; saveDB(); showToast('✓', 'Task moved to ' + newStatus + '!'); renderView(); }
}

/* ══════════════════════════════════════════════════
   TASK MANAGER (NEW FULL-FEATURED VIEW)
══════════════════════════════════════════════════ */
function renderTaskManager() {
  const { who, status, type } = state.taskFilter;

  let filtered = [...DB.tasks];
  if (who !== 'all')    filtered = filtered.filter(t => t.who === who);
  if (status !== 'all') filtered = filtered.filter(t => t.status === status);
  if (type !== 'all')   filtered = filtered.filter(t => t.type === type);

  // Group by status for the board view
  const groups = {
    Pending:     filtered.filter(t => t.status === 'Pending' || t.status === 'todo'),
    'In Progress': filtered.filter(t => t.status === 'inprogress' || t.status === 'In Progress'),
    Completed:   filtered.filter(t => t.status === 'done' || t.status === 'Completed'),
    Sent:        filtered.filter(t => t.status === 'Sent'),
  };

  const whoOptions = ['all', ...new Set(DB.tasks.map(t => t.who))];
  const typeOptions = ['all', 'Reel', 'Poster', 'Content', 'Other'];
  const statusOptions = ['all', 'Pending', 'todo', 'inprogress', 'done', 'Sent'];

  // Summary stats
  const totalOpen = DB.tasks.filter(t => !['done','Completed'].includes(t.status)).length;
  const totalDone = DB.tasks.filter(t => ['done','Completed'].includes(t.status)).length;

  return `
  <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
    <div class="stat-card">
      <div class="stat-label">Total Tasks</div>
      <div class="stat-value" style="color:var(--accent2)">${DB.tasks.length}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Open</div>
      <div class="stat-value" style="color:var(--a4)">${totalOpen}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Completed</div>
      <div class="stat-value" style="color:var(--a3)">${totalDone}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Completion Rate</div>
      <div class="stat-value" style="color:var(--a6)">${DB.tasks.length ? Math.round(totalDone/DB.tasks.length*100) : 0}%</div>
    </div>
  </div>

  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
    <div class="section-title">Task Manager</div>
    <button class="btn btn-primary btn-sm" onclick="openModal('addFullTask')">+ New Task</button>

    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <span style="font-size:11px;color:var(--text3)">Filter:</span>
      <select class="form-select" style="width:130px;font-size:11px;padding:5px 10px" onchange="setTaskFilter('who',this.value)">
        ${whoOptions.map(w => `<option value="${w}" ${who===w?'selected':''}>${w === 'all' ? 'All Members' : w}</option>`).join('')}
      </select>
      <select class="form-select" style="width:110px;font-size:11px;padding:5px 10px" onchange="setTaskFilter('type',this.value)">
        ${typeOptions.map(t => `<option value="${t}" ${type===t?'selected':''}>${t === 'all' ? 'All Types' : t}</option>`).join('')}
      </select>
      <select class="form-select" style="width:120px;font-size:11px;padding:5px 10px" onchange="setTaskFilter('status',this.value)">
        ${statusOptions.map(s => `<option value="${s}" ${status===s?'selected':''}>${s === 'all' ? 'All Statuses' : s}</option>`).join('')}
      </select>
    </div>
  </div>

  ${filtered.length === 0 ? `
  <div class="empty-state">
    <div class="empty-state-icon">✅</div>
    No tasks match the current filters.
    <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="openModal('addFullTask')">+ Create First Task</button>
  </div>` : `
  <div class="task-cards-grid">
    ${filtered.map(t => renderTaskCard(t)).join('')}
  </div>`}`;
}

function renderTaskCard(t) {
  const priorityColor = { high:'var(--a5)', medium:'var(--a4)', low:'var(--a3)' };
  const statusLabel = { todo:'Pending', inprogress:'In Progress', done:'Completed', Pending:'Pending', 'In Progress':'In Progress', Completed:'Completed', Sent:'Sent' };
  const statusColor = { todo:'var(--a4)', inprogress:'var(--a6)', done:'var(--a3)', Pending:'var(--a4)', 'In Progress':'var(--a6)', Completed:'var(--a3)', Sent:'var(--accent2)' };
  const cl = DB.clients.find(x => x.id === t.client);

  return `
  <div class="task-card-full ${['done','Completed'].includes(t.status) ? 'task-done' : ''}">
    <div class="task-card-top">
      <span class="chip chip-gray" style="font-size:10px">${t.type || 'Other'}</span>
      ${cl ? `<span class="chip" style="background:${cl.bg};color:${cl.color};font-size:9px">${cl.initials}</span>` : ''}
      <span style="margin-left:auto;width:8px;height:8px;border-radius:50%;background:${priorityColor[t.priority]||'var(--text3)'};display:inline-block;flex-shrink:0" title="${t.priority} priority"></span>
    </div>
    <div class="task-card-title ${['done','Completed'].includes(t.status) ? 'line-through' : ''}">${t.title}</div>
    ${t.notes ? `<div style="font-size:10px;color:var(--text3);margin-top:4px;line-height:1.5">${t.notes}</div>` : ''}
    <div class="task-card-meta">
      <div class="team-avatar" style="width:22px;height:22px;font-size:8px;border-radius:6px;background:rgba(168,85,247,0.2);color:var(--accent2)">${(t.who||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
      <span style="font-size:11px">${t.who}</span>
      <span style="margin-left:auto;font-size:10px;color:var(--text3)">📅 ${t.due}</span>
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:10px">
      <span style="font-size:11px;font-weight:600;color:${statusColor[t.status]||'var(--text3)'}">● ${statusLabel[t.status]||t.status}</span>
      <div style="margin-left:auto;display:flex;gap:4px">
        ${t.status !== 'done' && t.status !== 'Completed' ? `
        <button class="btn btn-sm" style="padding:3px 8px;font-size:10px" onclick="cycleTaskStatus('${t.id}')">→ Next</button>` : ''}
        <button class="btn btn-sm" style="padding:3px 8px;font-size:10px" onclick="openModal('editTask','${t.id}')">✏</button>
        <button class="btn btn-danger btn-sm" style="padding:3px 8px;font-size:10px" onclick="deleteTask('${t.id}')">🗑</button>
      </div>
    </div>
  </div>`;
}

function cycleTaskStatus(id) {
  const t = DB.tasks.find(x => x.id === id);
  if (!t) return;
  const cycle = { todo:'inprogress', Pending:'inprogress', inprogress:'done', 'In Progress':'done' };
  t.status = cycle[t.status] || 'done';
  saveDB();
  updateTaskBadge();
  showToast('✓', 'Task status updated!');
  renderView();
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  const idx = DB.tasks.findIndex(x => x.id === id);
  if (idx > -1) DB.tasks.splice(idx, 1);
  saveDB();
  showToast('🗑', 'Task deleted');
  renderView();
}

function setTaskFilter(key, val) {
  state.taskFilter[key] = val;
  renderView();
}

/* ══════════════════════════════════════════════════
   DOCUMENTS
══════════════════════════════════════════════════ */
function renderDocs() {
  const cp = clientPosts();

  return `
  <div class="upload-zone" onclick="showToast('📁','Opening file picker...')">
    <div class="upload-zone-icon">☁</div>
    <div class="upload-zone-text">Drop files or click to upload</div>
    <div class="upload-zone-sub">Images, videos, PDFs, Canva exports · Max 100MB per file</div>
  </div>

  <div class="section-header"><div class="section-title">Design Files by Post</div></div>
  <div class="docs-grid">
    ${cp.map(p => `
    <div class="doc-card" onclick="${p.driveLink ? "window.open('"+p.driveLink+"','_blank')" : "showToast('📁','No design file linked yet')"}">
      <div class="doc-icon">${p.driveLink ? '📁' : '📭'}</div>
      <div class="doc-name" style="${!p.driveLink ? 'color:var(--text3)' : ''}">${p.title.length > 28 ? p.title.slice(0,28)+'...' : p.title}</div>
      <div class="doc-meta">${p.driveLink ? '✓ Drive folder linked' : 'No file linked'}</div>
      <div class="doc-meta" style="margin-top:3px">${p.format} · Apr ${p.day}</div>
      <div style="margin-top:10px">
        ${p.driveLink ?
          `<a href="${p.driveLink}" target="_blank" class="btn btn-success btn-sm btn-full" style="text-decoration:none">Open Drive →</a>` :
          `<button class="btn btn-sm btn-full" onclick="event.stopPropagation();showToast('📁','Upload dialog opened!')">+ Link Drive</button>`
        }
      </div>
    </div>`).join('')}
  </div>

  <div class="section-header"><div class="section-title">Brand Assets</div></div>
  <div class="docs-grid">
    ${[
      ['Brand Kit','Logo, colors, fonts, guidelines','📦'],
      ['Templates','Canva & Photoshop templates','🎨'],
      ['Photo Bank','Approved product & team images','🖼'],
      ['Videos','Raw footage & edited reels','🎬'],
      ['Brand Guidelines',"Voice, tone, dos & don'ts",'📋'],
      ['Monthly Reports','All PDF reports archive','📊'],
    ].map(([n,s,ic]) => `
    <div class="doc-card" onclick="showToast('📁','Opening ${n}...')">
      <div class="doc-icon">${ic}</div>
      <div class="doc-name">${n}</div>
      <div class="doc-meta">${s}</div>
    </div>`).join('')}
  </div>`;
}

/* ══════════════════════════════════════════════════
   WHATSAPP BOT
══════════════════════════════════════════════════ */
function renderWhatsApp() {
  return `
  <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Automated WhatsApp reminders and client approvals connected to your agency number.</div>

  <div class="wa-layout">
    <div class="wa-phone-card">
      <div class="wa-phone-header">
        <div class="team-avatar" style="width:30px;height:30px;font-size:10px;background:rgba(6,214,160,.2);color:var(--a3);border-radius:50%">GV</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:600">GoViral Host</div>
          <div style="font-size:9px;color:var(--a3)">● Online · Client</div>
        </div>
        ${chip('Connected','chip-green')}
      </div>
      <div class="wa-chat" id="wa-chat">
        ${DB.waMessages.map(m => `
        <div class="wa-bubble ${m.type}">${m.text}</div>
        <div class="wa-time">${m.time}</div>`).join('')}
      </div>
      <div class="wa-input-row">
        <input type="text" class="wa-input" id="wa-input" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendWaMsg()">
        <button class="btn btn-primary btn-sm" onclick="sendWaMsg()">Send</button>
      </div>
    </div>

    <div>
      <div class="wa-schedules" style="margin-bottom:12px">
        <div class="section-header">
          <div class="section-title">Scheduled Messages</div>
          <button class="btn btn-primary btn-sm" onclick="showToast('✓','Message scheduled!')">+ Schedule</button>
        </div>
        ${[
          ['8:30 AM','Post reminder: "Website Down Nightmare Reel"','Apr 5'],
          ['9:00 AM','Auto-post notification to client','Apr 5'],
          ['11:00 AM','Performance update after 2 hours live','Apr 5'],
          ['8:30 AM','Post reminder: "Comparison Reel"','Apr 9'],
          ['3:00 PM','Weekly report sent to client','Apr 12'],
        ].map(([t,m,d]) => `
        <div class="wa-sched-row">
          <span class="wa-sched-time">${t}</span>
          <span style="flex:1;font-size:11px;color:var(--text2)">${m}</span>
          <span style="font-size:9px;color:var(--text3);margin-left:8px;flex-shrink:0">${d}</span>
          <button class="btn btn-danger btn-sm" style="margin-left:6px" onclick="showToast('🗑','Message removed')">✗</button>
        </div>`).join('')}
      </div>

      <div class="wa-schedules">
        <div class="section-title" style="margin-bottom:13px">Auto-Trigger Rules</div>
        ${[
          ['Post Published','Send reach stats after 2 hours',true],
          ['Post Pending > 48h','Remind team about pending design',true],
          ['Client Approval Request','Auto-send post preview link',true],
          ['Weekly Summary','Every Sunday at 6 PM',false],
          ['Monthly Report','First Monday of each month',true],
        ].map(([t,s,on]) => `
        <div class="setting-row">
          <div><div class="setting-label">${t}</div><div class="setting-sublabel">${s}</div></div>
          <div class="toggle ${on ? 'on' : ''}" onclick="this.classList.toggle('on');showToast('⚙','Setting updated!')"></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function sendWaMsg() {
  const inp = document.getElementById('wa-input');
  const msg = inp.value.trim();
  if (!msg) return;
  const chat = document.getElementById('wa-chat');
  const now = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  chat.innerHTML += `<div class="wa-bubble sent">${msg}</div><div class="wa-time">Now · You</div>`;
  inp.value = '';
  chat.scrollTop = chat.scrollHeight;
  setTimeout(() => {
    chat.innerHTML += `<div class="wa-bubble received">Got it! I'll update the team 👍</div><div class="wa-time">Just now · Bot</div>`;
    chat.scrollTop = chat.scrollHeight;
  }, 900);
}

/* ══════════════════════════════════════════════════
   CLIENT PORTAL
══════════════════════════════════════════════════ */
function renderClientPortal() {
  const cl = DB.clients.find(x => x.id === state.client);
  const cp = clientPosts();
  const pub = cp.filter(p => p.status === 'Published').length;

  return `
  <div class="client-portal-banner">
    👁 This is exactly what your client sees when they open their portal link. Read-only view.
  </div>

  <div class="card">
    <div style="background:linear-gradient(135deg,var(--bg3),var(--bg4));padding:22px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px">
      <div class="client-avatar" style="background:${cl?.bg};color:${cl?.color};width:46px;height:46px;font-size:14px;border-radius:12px">${cl?.initials}</div>
      <div>
        <div style="font-family:Syne,sans-serif;font-size:18px;font-weight:700">${cl?.name}</div>
        <div style="font-size:11px;color:var(--text3)">Content Plan · April 2026</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;color:var(--text3)">Managed by</div>
        <div style="font-size:13px;font-weight:600">SocialFlow Agency</div>
      </div>
    </div>

    <div class="card-body">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px">
        ${[
          ['Total Posts',cp.length,'var(--accent2)'],
          ['Published',pub,'var(--a3)'],
          ['This Week',3,'var(--a6)'],
        ].map(([l,v,c]) => `<div class="stat-card" style="text-align:center"><div class="stat-value" style="color:${c}">${v}</div><div class="stat-label" style="text-align:center">${l}</div></div>`).join('')}
      </div>

      <div class="section-title" style="margin-bottom:12px">Your Posts This Month</div>
      <div class="posts-list">
        ${cp.map(p => `
        <div class="post-card" style="margin-bottom:8px">
          <div class="post-header" style="cursor:default">
            <div class="post-date-box">
              <div class="post-day" style="color:${p.status==='Published'?'var(--a3)':'var(--accent2)'}">${p.day}</div>
              <div class="post-mon">${p.mon}</div>
            </div>
            <div class="post-meta">
              <div class="post-chips">${statusChip(p.status)} ${formatChip(p.format)} ${p.festival?chip('🎉 '+p.festival,'chip-orange'):''}</div>
              <div class="post-title">${p.title}</div>
              ${p.reach>0 ? `<div style="font-size:10px;color:var(--text3);margin-top:3px">👁 ${fmtNum(p.reach)} reach · 💾 ${p.saves} saves · ↗ ${p.shares} shares</div>` : ''}
            </div>
            ${p.approval==='Awaiting Approval' ? `<button class="btn btn-success btn-sm" onclick="approvePost(${p.id})">Approve ✓</button>` : ''}
          </div>
        </div>`).join('')}
      </div>

      <div style="text-align:center;padding:16px 0 6px;color:var(--text3);font-size:11px">
        Questions? Message us on WhatsApp ·
        <a href="#" style="color:var(--accent2)" onclick="showToast('📲','Opening WhatsApp...')">+91 98765 43210</a>
      </div>
    </div>
  </div>

  <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
    <button class="btn btn-primary" onclick="showToast('🔗','Client portal link copied!')">📋 Copy Client Link</button>
    <button class="btn" onclick="showToast('📧','Portal link emailed to client!')">Email to Client</button>
    <button class="btn" onclick="showToast('📲','Link sent via WhatsApp!')">WhatsApp to Client</button>
    <button class="btn btn-success" style="margin-left:auto" onclick="showToast('🔒','Password set for client portal')">🔒 Set Password</button>
  </div>`;
}

/* ══════════════════════════════════════════════════
   SETTINGS (with Export/Import)
══════════════════════════════════════════════════ */
function renderSettings() {
  return `
  <div class="settings-grid">
    <div class="settings-card">
      <div class="settings-title">🔔 Notifications</div>
      ${[
        ['Post published','Get notified when post goes live',true],
        ['Approval required','Alert when client approval needed',true],
        ['Performance update','2hr reach stats after publishing',true],
        ['Weekly summary','Every Sunday evening',false],
        ['Task assigned','When a task is assigned to you',true],
        ['New client added','Agency-wide notification',false],
      ].map(([l,s,on]) => `
      <div class="setting-row">
        <div><div class="setting-label">${l}</div><div class="setting-sublabel">${s}</div></div>
        <div class="toggle ${on ? 'on' : ''}" onclick="this.classList.toggle('on');showToast('⚙','Saved!')"></div>
      </div>`).join('')}
    </div>

    <div class="settings-card">
      <div class="settings-title">🤖 WhatsApp Bot</div>
      ${[
        ['Auto post reminders','Send 30min before posting time',true],
        ['Client approval auto-send','Auto-send approval request',true],
        ['Performance reports','Weekly analytics via WhatsApp',false],
        ['Team notifications','Notify team when task pending',true],
        ['Festival reminders','Alert 3 days before festival',true],
      ].map(([l,s,on]) => `
      <div class="setting-row">
        <div><div class="setting-label">${l}</div><div class="setting-sublabel">${s}</div></div>
        <div class="toggle ${on ? 'on' : ''}" onclick="this.classList.toggle('on');showToast('⚙','Saved!')"></div>
      </div>`).join('')}
    </div>

    <div class="settings-card">
      <div class="settings-title">🎨 Agency Branding</div>
      <div class="setting-row"><div class="setting-label">Agency Name</div><input class="form-input" value="SocialFlow Agency" style="width:150px;font-size:11px"></div>
      <div class="setting-row"><div class="setting-label">Owner Name</div><input class="form-input" value="${state.currentUser?.name || 'Tejas Patil'}" style="width:150px;font-size:11px"></div>
      <div class="setting-row"><div class="setting-label">WhatsApp Number</div><input class="form-input" value="+91 98765 43210" style="width:150px;font-size:11px"></div>
      <div class="setting-row"><div class="setting-label">Default Post Time</div><input class="form-input" type="time" value="09:00" style="width:100px;font-size:11px"></div>
      <div class="setting-row" style="border:none;padding-top:12px">
        <button class="btn btn-primary btn-full" onclick="showToast('✓','Branding settings saved!')">Save Changes</button>
      </div>
    </div>

    <!-- DATA MANAGEMENT — Export / Import -->
    <div class="settings-card">
      <div class="settings-title">💾 Data Management</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:14px;line-height:1.6">
        All data is stored locally in your browser. Export regularly as a backup. Import to restore on another device.
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Export All Data</div>
          <div class="setting-sublabel">Download full backup as JSON — posts, tasks, clients</div>
        </div>
        <button class="btn btn-success btn-sm" onclick="exportData()">⬇ Export JSON</button>
      </div>

      <div class="setting-row">
        <div>
          <div class="setting-label">Import Data</div>
          <div class="setting-sublabel">Restore from a previous JSON backup file</div>
        </div>
        <label class="btn btn-sm" style="cursor:pointer">
          ⬆ Import JSON
          <input type="file" accept=".json" style="display:none" onchange="importData(this.files[0])">
        </label>
      </div>

      <div class="setting-row" style="border:none;padding-top:12px">
        <div>
          <div class="setting-label" style="color:var(--a5)">Reset All Data</div>
          <div class="setting-sublabel">Delete everything and restore defaults</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="resetData()">🗑 Reset</button>
      </div>
    </div>

    <div class="settings-card">
      <div class="settings-title">🔗 Integrations</div>
      ${[
        ['Google Drive','Sync design files automatically','✓ Connected','btn-success'],
        ['Canva','Direct design link import','Connect →',''],
        ['Meta Business Suite','Schedule & publish to Instagram','Connect →',''],
        ['LinkedIn Pages','Auto-publish to company page','Connect →',''],
        ['Zapier','Automate workflows','Connect →',''],
        ['Slack','Team task notifications','Connect →',''],
      ].map(([n,s,label,cls]) => `
      <div class="setting-row">
        <div><div class="setting-label">${n}</div><div class="setting-sublabel">${s}</div></div>
        <button class="btn ${cls} btn-sm" onclick="showToast('🔗','Connecting to ${n}...')">${label}</button>
      </div>`).join('')}
    </div>

    <!-- ACCOUNT / LOGOUT -->
    <div class="settings-card">
      <div class="settings-title">👤 Account</div>
      <div class="setting-row">
        <div>
          <div class="setting-label">Logged in as</div>
          <div class="setting-sublabel">${state.currentUser?.name} · ${state.currentUser?.role}</div>
        </div>
        <div class="team-avatar" style="width:34px;height:34px;font-size:11px;background:${state.currentUser?.color+'33'||'rgba(168,85,247,0.2)'};color:${state.currentUser?.color||'var(--accent2)'}">
          ${state.currentUser?.initials || 'TP'}
        </div>
      </div>
      <div class="setting-row">
        <div><div class="setting-label">Change User</div><div class="setting-sublabel">Switch to a different team member</div></div>
        <button class="btn btn-sm" onclick="doLogout()">Switch User</button>
      </div>
      <div class="setting-row" style="border:none;padding-top:12px">
        <button class="btn btn-danger btn-full" onclick="doLogout()">🚪 Sign Out</button>
      </div>
    </div>
  </div>`;
}

function resetData() {
  if (!confirm('This will delete ALL data and restore defaults. Are you sure?')) return;
  localStorage.removeItem(LS_KEY);
  location.reload();
}

/* ══════════════════════════════════════════════════
   SEARCH
══════════════════════════════════════════════════ */
function handleSearch(q) {
  const overlay = document.getElementById('searchOverlay');
  const results = document.getElementById('searchResults');
  if (!q.trim()) { overlay.style.display = 'none'; return; }
  overlay.style.display = 'block';
  const matches = DB.posts.filter(p =>
    p.title.toLowerCase().includes(q.toLowerCase()) ||
    p.hook.toLowerCase().includes(q.toLowerCase()) ||
    p.caption.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 6);
  const clientMatches = DB.clients.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase())
  );
  const taskMatches = DB.tasks.filter(t =>
    t.title.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 3);
  results.innerHTML = [
    ...clientMatches.map(c => `
    <div class="search-result-item" onclick="selectClient('${c.id}');hideSearch()">
      <div class="client-avatar" style="background:${c.bg};color:${c.color};width:28px;height:28px;font-size:9px;border-radius:7px">${c.initials}</div>
      <div><div class="search-result-title">${c.name}</div><div class="search-result-sub">Client</div></div>
    </div>`),
    ...matches.map(p => {
      const cl = DB.clients.find(x => x.id === p.client);
      return `<div class="search-result-item" onclick="selectClient('${p.client}');setView('dashboard');hideSearch()">
        <span style="font-size:18px">${p.format==='Reel'?'🎬':'📊'}</span>
        <div><div class="search-result-title">${p.title}</div><div class="search-result-sub">${cl?.name} · Apr ${p.day} · ${p.format}</div></div>
      </div>`;
    }),
    ...taskMatches.map(t => `
    <div class="search-result-item" onclick="setView('taskmanager');hideSearch()">
      <span style="font-size:18px">✅</span>
      <div><div class="search-result-title">${t.title}</div><div class="search-result-sub">Task · ${t.who} · ${t.status}</div></div>
    </div>`),
    matches.length === 0 && clientMatches.length === 0 && taskMatches.length === 0 ? '<div style="padding:16px 20px;color:var(--text3);font-size:12px">No results found</div>' : ''
  ].join('');
}

function hideSearch() {
  document.getElementById('searchOverlay').style.display = 'none';
  document.getElementById('searchInput').value = '';
}

/* ══════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════ */
function renderNotifList() {
  const el = document.getElementById('notif-list');
  el.innerHTML = DB.notifications.map(n => `
  <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
    <div class="notif-item-dot ${n.read ? 'read' : ''}"></div>
    <div>
      <div class="notif-item-text">${n.text}</div>
      <div class="notif-item-time">${n.time}</div>
    </div>
  </div>`).join('') + `
  <div style="padding:10px 14px;text-align:center">
    <button class="btn btn-full btn-sm">View all notifications</button>
  </div>`;

  const hasUnread = DB.notifications.some(n => !n.read);
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = hasUnread ? 'block' : 'none';
}

function markNotifRead(id) {
  const n = DB.notifications.find(x => x.id === id);
  if (n) n.read = true;
  renderNotifList();
}

function markAllRead() {
  DB.notifications.forEach(n => n.read = true);
  renderNotifList();
  closePanel();
  showToast('✓', 'All notifications marked as read');
}

/* ══════════════════════════════════════════════════
   PANELS
══════════════════════════════════════════════════ */
function togglePanel(which) {
  const notif = document.getElementById('notif-panel');
  const profile = document.getElementById('profile-panel');
  if (which === 'notif') {
    const isOpen = notif.classList.contains('visible');
    notif.classList.toggle('visible', !isOpen);
    profile.classList.remove('visible');
  } else {
    const isOpen = profile.classList.contains('visible');
    profile.classList.toggle('visible', !isOpen);
    notif.classList.remove('visible');
  }
}

function closePanel() {
  document.getElementById('notif-panel')?.classList.remove('visible');
  document.getElementById('profile-panel')?.classList.remove('visible');
}

/* ══════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════ */
function openModal(type, id) {
  const box = document.getElementById('modal-box');
  const overlay = document.getElementById('modal-overlay');

  if (type === 'addPost')      box.innerHTML = buildAddPostModal();
  else if (type === 'editPost') box.innerHTML = buildEditPostModal(id);
  else if (type === 'viewPost') box.innerHTML = buildViewPostModal(id);
  else if (type === 'addClient') box.innerHTML = buildAddClientModal();
  else if (type === 'addTask')  box.innerHTML = buildAddTaskModal();
  else if (type === 'addFullTask') box.innerHTML = buildAddFullTaskModal();
  else if (type === 'editTask') box.innerHTML = buildEditTaskModal(id);

  overlay.classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

/* ─── ADD POST MODAL ─── */
function buildAddPostModal() {
  return `
  <div class="modal-title">Add New Post</div>
  <div class="modal-subtitle">Fill in content details — your team will be notified automatically</div>

  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Client</label>
      <select class="form-select" id="f-client">
        ${DB.clients.map(c => `<option value="${c.id}" ${c.id===state.client?'selected':''}>${c.name}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Format</label>
      <select class="form-select" id="f-format">
        ${['Carousel','Reel','Story','Static Post' ,'Ads','Video'].map(f => `<option>${f}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="form-row form-row-cols c3">
    <div class="form-group">
      <label class="form-label">Date</label>
      <input type="date" class="form-input" id="f-date" value="2026-04-14">
    </div>
    <div class="form-group">
      <label class="form-label">Posting Time</label>
      <input type="time" class="form-input" id="f-time" value="09:00">
    </div>
    <div class="form-group">
      <label class="form-label">Festival / Occasion</label>
      <input type="text" class="form-input" id="f-festival" placeholder="Optional">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Post Title / Topic</label>
      <input type="text" class="form-input" id="f-title" placeholder="e.g. World Earth Day Carousel">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Hook / Main Idea</label>
      <input type="text" class="form-input" id="f-hook" placeholder="Main hook or creative angle">
    </div>
  </div>

  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Objective</label>
      <select class="form-select" id="f-objective">
        ${['Brand Awareness','Lead Generation','Reach + Sales','Trust Building','Virality','Emotional Connect','Objection Handling'].map(o => `<option>${o}</option>`).join('')}
      </select>
    </div>
   <div class="form-group">
  <label class="form-label">Assign To</label>
  <input type="text" class="form-input" id="f-assignto" placeholder="Enter team member name (e.g. Rohit)">
</div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Post Copy / Script</label>
      <textarea class="form-textarea" id="f-copy" style="min-height:100px" placeholder="Slide-by-slide copy or reel script..."></textarea>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Caption & Hashtags</label>
      <textarea class="form-textarea" id="f-caption" placeholder="Caption with emojis and hashtags..."></textarea>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Design / Drive Link</label>
      <input type="url" class="form-input" id="f-drive" placeholder="https://drive.google.com/...">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Platforms</label>
      <div class="platform-checks">
        ${['Instagram','Facebook','YouTube','Linkedin','Threads','Twitter/X' ,'Pinterest'].map(p =>
          `<label class="platform-check-item"><input type="checkbox" ${p==='Instagram'?'checked':''} value="${p}"> ${p}</label>`
        ).join('')}
      </div>
    </div>
  </div>

  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn" onclick="savePost('draft')">Save Draft</button>
    <button class="btn btn-primary" onclick="savePost('add')">Add Post</button>
  </div>`;
}

function savePost(mode) {
  const title = document.getElementById('f-title')?.value || 'Untitled Post';
  const clientId = document.getElementById('f-client')?.value || state.client;
  const format = document.getElementById('f-format')?.value || 'Carousel';
  const date = document.getElementById('f-date')?.value || '2026-04-14';
  const time = document.getElementById('f-time')?.value || '09:00';
  const hook = document.getElementById('f-hook')?.value || '';
  const copy = document.getElementById('f-copy')?.value || '';
  const caption = document.getElementById('f-caption')?.value || '';
  const drive = document.getElementById('f-drive')?.value || '';
  const festival = document.getElementById('f-festival')?.value || '';
  const objective = document.getElementById('f-objective')?.value || 'Brand Awareness';
  const d = new Date(date);
  const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const platforms = [...document.querySelectorAll('.platform-check-item input:checked')].map(x => x.value);

  const newPost = {
    id: Date.now(), client: clientId,
    date, day: d.getDate().toString(), mon: months[d.getMonth()], dow: days[d.getDay()],
    festival, title, hook, objective, format,
    status: mode === 'draft' ? 'Draft' : 'Pending',
    time: time, platforms: platforms.length ? platforms : ['Instagram'],
    approval: 'Pending Review',
    assignedTo: DB.team[0]?.name || 'Tejas Patil',
    copy, caption, driveLink: drive,
    reach: 0, saves: 0, shares: 0, likes: 0,
  };
  DB.posts.push(newPost);
  saveDB();
  closeModal();
  showToast('✓', mode === 'draft' ? 'Post saved as draft!' : 'Post added & team notified!');
  updateBadges();
  renderView();
}

/* ─── EDIT POST MODAL ─── */
function buildEditPostModal(id) {
  const p = DB.posts.find(x => x.id === id);
  if (!p) return '<div class="modal-title">Post not found</div>';
  return `
  <div class="modal-title">Edit Post</div>
  <div class="modal-subtitle">${p.title}</div>

  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Status</label>
      <select class="form-select" id="e-status">
        ${['Published','Scheduled','Approved','Not Approved' , 'Not started' ,'NA' ,'Copy Approved','Copy Not Approved'].map(s => `<option ${s===p.status?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Format</label>
      <select class="form-select" id="e-format">
        ${['Carousel','Reel','Story','Static Post'].map(f => `<option ${f===p.format?'selected':''}>${f}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Post Title</label>
      <input type="text" class="form-input" id="e-title" value="${p.title}">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Hook / Idea</label>
      <textarea class="form-textarea" id="e-hook">${p.hook}</textarea>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Post Copy / Script</label>
      <textarea class="form-textarea" id="e-copy" style="min-height:120px">${p.copy}</textarea>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Caption & Hashtags</label>
      <textarea class="form-textarea" id="e-caption">${p.caption}</textarea>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Design Files Link</label>
      <input type="url" class="form-input" id="e-drive" value="${p.driveLink||''}">
    </div>
  </div>

  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="updatePost(${id})">Save Changes</button>
  </div>`;
}

function updatePost(id) {
  const p = DB.posts.find(x => x.id === id);
  if (!p) return;
  p.title   = document.getElementById('e-title')?.value || p.title;
  p.hook    = document.getElementById('e-hook')?.value || p.hook;
  p.copy    = document.getElementById('e-copy')?.value || p.copy;
  p.caption = document.getElementById('e-caption')?.value || p.caption;
  p.driveLink = document.getElementById('e-drive')?.value || p.driveLink;
  p.status  = document.getElementById('e-status')?.value || p.status;
  p.format  = document.getElementById('e-format')?.value || p.format;
  saveDB();
  closeModal();
  showToast('✓', 'Post updated!');
  renderView();
}

/* ─── VIEW POST MODAL ─── */
function buildViewPostModal(id) {
  const p = DB.posts.find(x => x.id === id);
  if (!p) return '<div class="modal-title">Post not found</div>';
  return `
  <div class="modal-title">${p.title}</div>
  <div class="modal-subtitle">Apr ${p.day} · ${p.dow} · ${p.format} · ${p.status}</div>
  <div style="font-size:12px;color:var(--text2);white-space:pre-line;line-height:1.7;margin-bottom:14px">${p.copy}</div>
  <div style="background:var(--bg3);border-radius:var(--r2);padding:12px;font-size:11px;color:var(--text2);white-space:pre-line;line-height:1.65;margin-bottom:14px">${p.caption}</div>
  ${p.driveLink ? `<a href="${p.driveLink}" target="_blank" class="btn btn-success" style="text-decoration:none;margin-bottom:14px">📁 Open Design Files</a>` : ''}
  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Close</button>
    <button class="btn btn-primary" onclick="closeModal();openModal('editPost',${id})">Edit Post</button>
  </div>`;
}

/* ─── ADD CLIENT MODAL ─── */
function buildAddClientModal() {
  return `
  <div class="modal-title">Add New Client</div>
  <div class="modal-subtitle">Client onboarding — all details and setup</div>

  <!-- ROW 1 -->
  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Brand / Client Name</label>
      <input type="text" class="form-input" id="ac-name" placeholder="e.g. Zomato India">
    </div>
    <div class="form-group">
      <label class="form-label">Industry</label>
      <input type="text" class="form-input" id="ac-industry" placeholder="e.g. Food, Tech, Fashion">
    </div>
  </div>

  <!-- ROW 2 -->
  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Contact Name</label>
      <input type="text" class="form-input" id="ac-contact" placeholder="e.g. Rohit Kamble">
    </div>
    <div class="form-group">
      <label class="form-label">WhatsApp Number</label>
      <input type="text" class="form-input" id="ac-wa" placeholder="+91 98765 43210">
    </div>
  </div>

  <!-- ROW 3 -->
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Contact Email</label>
      <input type="email" class="form-input" id="ac-email" placeholder="client@brand.com">
    </div>
  </div>

  <!-- ROW 4 -->
<div class="form-group">
  <label class="form-label">Monthly Posts Plan</label>
  <input type="text" class="form-input" id="ac-posts" placeholder="e.g. 20 posts, 10 reels, 10 creatives">
</div>
    <div class="form-group">
      <label class="form-label">Client Status</label>
      <select class="form-select" id="client-status">
        <option value="Active">🟢 Active</option>
        <option value="Draft">🟡 Pending</option>
        <option value="Paused">🔴 Stopped</option>
      </select>
    </div>
  </div>

  <!-- DRIVE -->
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Drive Link</label>
      <input type="text" class="form-input" id="client-drive" placeholder="Paste Google Drive link">
    </div>
  </div>

  <!-- DETAILS -->
  <div class="form-row">
    <div class="form-group">
      <label class="form-label">More Details</label>
      <textarea class="form-input" id="client-details" placeholder="Extra notes, requirements, strategy..."></textarea>
    </div>
  </div>

  <!-- FOOTER (UPDATED 🔥) -->
  <div class="modal-footer" style="display:flex;justify-content:space-between;gap:10px;">

    <!-- DELETE BUTTON -->
    <button class="btn btn-danger" id="delete-client-btn" style="display:none;" onclick="deleteClientFromModal()">
      🗑 Delete
    </button>

    <!-- RIGHT SIDE -->
    <div style="margin-left:auto;display:flex;gap:10px;">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="save-client-btn" onclick="addClient()">Add Client</button>
    </div>

  </div>
  `;
}

function addClient() {
  const name = document.getElementById('ac-name')?.value;
  if (!name) {
    showToast('⚠','Enter client name');
    return;
  }

  const status = document.getElementById('client-status')?.value || 'Active';
  const drive = document.getElementById('client-drive')?.value || '';
  const details = document.getElementById('client-details')?.value || '';

  if (editingClientId) {
    const c = DB.clients.find(x => x.id === editingClientId);
    if (c) {
      c.name = name;
      c.status = status;
      c.drive = drive;
      c.details = details;
    }

    showToast('✏','Client updated');
  } else {
    const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

    DB.clients.push({
      id: name.toLowerCase().replace(/\s+/g,'_') + '_' + Date.now(),
      name,
      initials,
      color: '#a78bfa',
      bg: 'rgba(124,92,252,0.22)',
      status,
      platform: 'Instagram',
      drive,
      details
    });

    showToast('✓', name + ' added');
  }

  editingClientId = null;
  saveDB();
  closeModal();
  renderClientList();
}

function openEditClient(id) {
  const c = DB.clients.find(x => x.id === id);
  if (!c) return;

  editingClientId = id;

  openModal('addClient');

  setTimeout(() => {
    document.getElementById('ac-name').value = c.name;
    document.getElementById('client-status').value = c.status;
    document.getElementById('client-drive').value = c.drive || '';
    document.getElementById('client-details').value = c.details || '';

    document.getElementById('save-client-btn').textContent = "Update Client";
    document.getElementById('delete-client-btn').style.display = "block";
  }, 100);
}

/* ─── ADD BASIC TASK MODAL (from Team board) ─── */
function buildAddTaskModal() {
  return `
  <div class="modal-title">Add Task</div>
  <div class="modal-subtitle">Assign a task to your team</div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Task Description</label>
      <input type="text" class="form-input" id="nt-title" placeholder="e.g. Design Apr 15 carousel">
    </div>
  </div>

  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Assign To</label>
      <select class="form-select" id="nt-who">
        ${DB.team.map(t => `<option>${t.name} (${t.role})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Due Date</label>
      <input type="date" class="form-input" id="nt-due">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Priority</label>
      <select class="form-select" id="nt-priority">
        <option>medium</option><option>high</option><option>low</option>
      </select>
    </div>
  </div>

  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="addTask()">Add Task</button>
  </div>`;
}

function addTask() {
  const title = document.getElementById('nt-title')?.value;
  if (!title) { showToast('⚠','Please enter a task title'); return; }
  const who = document.getElementById('nt-who')?.value.split(' (')[0];
  const due = document.getElementById('nt-due')?.value || 'TBD';
  const priority = document.getElementById('nt-priority')?.value || 'medium';
  DB.tasks.unshift({ id: 'tk'+Date.now(), title, who, due, status: 'todo', priority, type: 'Other', client: state.client, notes: '' });
  saveDB();
  closeModal();
  updateTaskBadge();
  showToast('✓', 'Task added & team notified!');
  renderView();
}


function updatePostStatus(id, newStatus) {
  const post = DB.posts.find(p => p.id === id);
  if (!post) return;

  post.status = newStatus;

  saveDB();
  renderView();

  showToast('🚦', 'Status: ' + newStatus);
}




/* ─── FULL TASK MODAL (from Task Manager) ─── */
function buildAddFullTaskModal() {
  return `
  <div class="modal-title">New Task</div>
  <div class="modal-subtitle">Add a detailed task to the Task Manager</div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Task Title</label>
      <input type="text" class="form-input" id="ft-title" placeholder="e.g. Create Reel script for Apr 22">
    </div>
  </div>

  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Task Type</label>
      <select class="form-select" id="ft-type">
        <option>Reel</option><option>Poster</option><option>Content</option><option>Other</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Assigned To</label>
      <select class="form-select" id="ft-who">
        ${DB.team.map(t => `<option value="${t.name}">${t.name} — ${t.role}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="form-row form-row-cols c3">
    <div class="form-group">
      <label class="form-label">Status</label>
      <select class="form-select" id="ft-status">
        <option value="todo">Pending</option>
        <option value="inprogress">In Progress</option>
        <option value="done">Completed</option>
        <option value="Sent">Sent</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Priority</label>
      <select class="form-select" id="ft-priority">
        <option>high</option><option>medium</option><option>low</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Due Date</label>
      <input type="date" class="form-input" id="ft-due">
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Client</label>
      <select class="form-select" id="ft-client">
        ${DB.clients.map(c => `<option value="${c.id}" ${c.id===state.client?'selected':''}>${c.name}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <textarea class="form-textarea" id="ft-notes" placeholder="Any additional details or context..."></textarea>
    </div>
  </div>

  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="addFullTask()">Create Task</button>
  </div>`;
}

function addFullTask() {
  const title = document.getElementById('ft-title')?.value;
  if (!title) { showToast('⚠','Please enter a task title'); return; }
  const dueVal = document.getElementById('ft-due')?.value;
  const due = dueVal ? new Date(dueVal).toLocaleDateString('en-IN',{month:'short',day:'numeric'}) : 'TBD';
  const task = {
    id: 'tk' + Date.now(),
    title,
    type:     document.getElementById('ft-type')?.value || 'Other',
    who:      document.getElementById('ft-who')?.value || DB.team[0]?.name,
    status:   document.getElementById('ft-status')?.value || 'todo',
    priority: document.getElementById('ft-priority')?.value || 'medium',
    due,
    client:   document.getElementById('ft-client')?.value || state.client,
    notes:    document.getElementById('ft-notes')?.value || '',
  };
  DB.tasks.unshift(task);
  saveDB();
  closeModal();
  updateTaskBadge();
  showToast('✓', 'Task created!');
  renderView();
}

/* ─── EDIT TASK MODAL ─── */
function buildEditTaskModal(id) {
  const t = DB.tasks.find(x => x.id === id);
  if (!t) return '<div class="modal-title">Task not found</div>';
  return `
  <div class="modal-title">Edit Task</div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Task Title</label>
      <input type="text" class="form-input" id="et-title" value="${t.title}">
    </div>
  </div>

  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Task Type</label>
      <select class="form-select" id="et-type">
        ${['Reel','Poster','Content','Other'].map(x => `<option ${x===t.type?'selected':''}>${x}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Assigned To</label>
      <select class="form-select" id="et-who">
        ${DB.team.map(tm => `<option value="${tm.name}" ${tm.name===t.who?'selected':''}>${tm.name}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="form-row form-row-cols c2">
    <div class="form-group">
      <label class="form-label">Status</label>
      <select class="form-select" id="et-status">
        ${[['todo','Pending'],['inprogress','In Progress'],['done','Completed'],['Sent','Sent']].map(([v,l]) => `<option value="${v}" ${v===t.status?'selected':''}>${l}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Priority</label>
      <select class="form-select" id="et-priority">
        ${['high','medium','low'].map(x => `<option ${x===t.priority?'selected':''}>${x}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-textarea" id="et-notes">${t.notes || ''}</textarea>
    </div>
  </div>

  <div class="modal-footer">
    <button class="btn" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="updateTask('${id}')">Save Changes</button>
  </div>`;
}

function updateTask(id) {
  const t = DB.tasks.find(x => x.id === id);
  if (!t) return;
  t.title    = document.getElementById('et-title')?.value || t.title;
  t.type     = document.getElementById('et-type')?.value || t.type;
  t.who      = document.getElementById('et-who')?.value || t.who;
  t.status   = document.getElementById('et-status')?.value || t.status;
  t.priority = document.getElementById('et-priority')?.value || t.priority;
  t.notes    = document.getElementById('et-notes')?.value || '';
  saveDB();
  closeModal();
  showToast('✓', 'Task updated!');
  renderView();
}

/* ══════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════ */
function showToast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closePanel();
    hideSearch();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput')?.focus();
  }
});

/* ══════════════════════════════════════════════════
   THEME TOGGLE (Dark / Light)
══════════════════════════════════════════════════ */
const LS_THEME_KEY = 'socialflow_theme';

function initTheme() {
  const saved = localStorage.getItem(LS_THEME_KEY) || 'dark';
  applyTheme(saved, false);
}

function toggleTheme(isLight) {
  applyTheme(isLight ? 'light' : 'dark', true);
}

function applyTheme(theme, save) {
  document.documentElement.setAttribute('data-theme', theme);
  const isLight = theme === 'light';
  const toggle = document.getElementById('themeToggle');
  const label  = document.getElementById('theme-label');
  const thumb  = document.getElementById('themeThumb');
  if (toggle) toggle.checked = isLight;
  if (label)  label.textContent = isLight ? '☀ Light Mode' : '🌙 Dark Mode';
  if (thumb)  thumb.textContent = isLight ? '☀' : '🌙';
  if (save)   localStorage.setItem(LS_THEME_KEY, theme);
}

/* ── Theme is initialised in the main DOMContentLoaded above ── */

/* ══════════════════════════════════════════════════
   AI INSIGHTS WIDGET
   Surfaces smart tips from post data
══════════════════════════════════════════════════ */
function renderInsightsWidget() {
  const cp = clientPosts();
  const published = cp.filter(p => p.reach > 0);
  const totalReach = published.reduce((a, p) => a + p.reach, 0);
  const avgReach = published.length ? Math.round(totalReach / published.length) : 0;
  const reels = cp.filter(p => p.format === 'Reel').length;
  const carousels = cp.filter(p => p.format === 'Carousel').length;
  const pending = cp.filter(p => p.status === 'Pending' || p.status === 'Draft').length;
  const openTasks = DB.tasks.filter(t => !['done','Completed'].includes(t.status)).length;

  // Generate dynamic insights from live data
  const tips = [];
  
  return `
 
    <div class="insights-list">
      ${tips.slice(0, 3).map(tip => `
      <div class="insight-item">
        <div class="insight-dot"></div>
        <span>${tip}</span>
      </div>`).join('')}
    </div>
  </div>`;
}
