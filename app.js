import { supabase } from './supabaseClient.js'

// Supabase Funktionen

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user ?? null;
}

async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://benhag02.github.io/'
    }
  })
  if (error) throw error
}

async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

async function loadTasksFromSupabase() {
  const user = await getCurrentUser();

  if (!user) {
    state.tasks.today = [];
    renderTaskList('today', 'todayTaskList', 'todayTaskCount');
    return;
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) throw error

  state.tasks.today = data.map(task => ({
    id: String(task.id),
    title: task.title,
    category: task.category || 'uni',
    done: task.done
  }))

  renderTaskList('today', 'todayTaskList', 'todayTaskCount')
}

function showAuthView() {
  document.getElementById('authView').style.display = 'block'
  document.getElementById('appView').style.display = 'none'
}

function showAppView() {
  document.getElementById('authView').style.display = 'none'
  document.getElementById('appView').style.display = 'block'
}

async function checkAuthOnStart() {
  const user = await getCurrentUser()

  if (user) {
    showAppView()
    await loadTasksFromSupabase();
    await loadGoalsFromSupabase();
    await loadCreditsFromSupabase();
    await loadDeadlinesFromSupabase();
    await loadJobMetricsFromSupabase();
  } else {
    showAuthView()
  }
}

function bindAuth() {
  const form = document.getElementById('authForm');
  const signUpBtn = document.getElementById('signUpBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const status = document.getElementById('authStatus');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    try {
      await signIn(email, password);
      status.textContent = 'Eingeloggt';
      showAppView();
      await loadTasksFromSupabase();
      await loadGoalsFromSupabase();
      await loadCreditsFromSupabase();
      await loadDeadlinesFromSupabase();
      await loadJobMetricsFromSupabase();
    } catch (err) {
      status.textContent = err.message;
    }
  });

  signUpBtn.addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    try {
      await signUp(email, password);
      status.textContent = 'Registrierung erfolgreich. Bitte ggf. E-Mail bestätigen.';
    } catch (err) {
      status.textContent = err.message;
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut();
      status.textContent = 'Ausgeloggt';
      showAuthView();
      state.tasks.today = [];
      renderTaskList('today', 'todayTaskList', 'todayTaskCount');
    } catch (err) {
      status.textContent = err.message;
    }
  });
}

// Ende Funktionen für Supabase

const state = {
  editingTaskId: null,
  editingTaskKey: null,
  editingDeadlineId: null,
  credits: { earned: 15, total: 120 },
  job: { doneHours: 6, targetHours: 10, overtime: 14 },
  deadlines: [],
  tasks: {
    today: []
  },
  goals: [],
  events: [
    { id: crypto.randomUUID(), title: 'Vorlesung Business Intelligence', date: '2026-06-08', startTime: '10:15', endTime: '11:45', category: 'uni' },
    { id: crypto.randomUUID(), title: 'Datarocket Schicht', date: '2026-06-09', startTime: '13:00', endTime: '17:00', category: 'work' },
    { id: crypto.randomUUID(), title: 'Fußballtraining', date: '2026-06-09', startTime: '18:30', endTime: '20:00', category: 'sport' },
    { id: crypto.randomUUID(), title: 'Treffen mit Kommilitonen', date: '2026-06-12', startTime: '16:00', endTime: '18:00', category: 'private' }
  ],
  currentCalendarDate: new Date('2026-06-01T12:00:00'),
  editingGoalId: null,
  editingEventId: null,
  selectedCalendarDate: null
};

function escapeHtml(text){return String(text).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function formatHeaderDate(){const now=new Date();document.getElementById('dateBadge').textContent=now.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short',year:'numeric'});document.getElementById('footerYear').textContent=now.getFullYear();}
function initTheme(){const toggle=document.querySelector('[data-theme-toggle]');const root=document.documentElement;let current=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';root.setAttribute('data-theme',current);updateThemeIcon(current);toggle.addEventListener('click',()=>{current=current==='dark'?'light':'dark';root.setAttribute('data-theme',current);updateThemeIcon(current);updateChartTheme(current);});}
function updateThemeIcon(theme){document.querySelector('[data-theme-toggle]').innerHTML=theme==='dark'?`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;}

function bindToggleForms(){document.querySelectorAll('[data-toggle-form]').forEach(btn=>{btn.addEventListener('click',()=>{const target=document.getElementById(btn.dataset.toggleForm);target.classList.toggle('is-open');});});}

// ── TAGESAUFGABEN – nach Kategorie gegliedert ──
const CAT_ORDER = ['uni','arbeit','freizeit'];
const CAT_LABELS = {uni:'Uni',arbeit:'Arbeit',freizeit:'Freizeit'};
const CAT_ICONS = {uni:'🎓',arbeit:'💼',freizeit:'🏖️'};

function taskCategoryLabel(category){return CAT_LABELS[category]||'Sonstiges';}

function renderTaskList(key,listId,countId){
  const wrap=document.getElementById(listId);
  wrap.innerHTML='';
  const tasks=state.tasks[key];
  const total=tasks.length;
  const done=tasks.filter(t=>t.done).length;
  document.getElementById(countId).textContent=`${done}/${total} erledigt`;

  // Gruppieren nach Kategorie
  CAT_ORDER.forEach(cat=>{
    const catTasks=tasks.filter(t=>t.category===cat);
    if(!catTasks.length)return;

    const header=document.createElement('div');
    header.className='task-category-header';
    header.textContent=`${CAT_ICONS[cat]} ${CAT_LABELS[cat]}`;
    wrap.appendChild(header);

    const ul=document.createElement('ul');
    ul.className='task-list';
    catTasks.forEach(task=>{
      const li=document.createElement('li');
      li.className=`task-item ${task.done?'done':''}`;
      li.dataset.id=task.id;
      li.innerHTML=`<div class="task-check" data-action="toggle"></div><div class="task-main"><div class="task-text">${escapeHtml(task.title)}</div></div><button class="icon-btn" type="button" data-action="edit" aria-label="Aufgabe bearbeiten">✎</button><button class="icon-btn" type="button" data-action="delete" aria-label="Aufgabe löschen">×</button>`;
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
  });

  // Sonstige Kategorien (falls jemand etwas eingibt das nicht passt)
  const otherTasks=tasks.filter(t=>!CAT_ORDER.includes(t.category));
  if(otherTasks.length){
    const header=document.createElement('div');
    header.className='task-category-header';
    header.textContent='📋 Sonstige';
    wrap.appendChild(header);
    const ul=document.createElement('ul');
    ul.className='task-list';
    otherTasks.forEach(task=>{
      const li=document.createElement('li');
      li.className=`task-item ${task.done?'done':''}`;
      li.dataset.id=task.id;
      li.innerHTML=`<div class="task-check" data-action="toggle"></div><div class="task-main"><div class="task-text">${escapeHtml(task.title)}</div></div><button class="icon-btn" type="button" data-action="edit" aria-label="Aufgabe bearbeiten">✎</button><button class="icon-btn" type="button" data-action="delete" aria-label="Aufgabe löschen">×</button>`;
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
  }
}

async function updateTaskInSupabase(id, updates) {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', Number(id));

  if (error) throw error;
}

async function deleteTaskFromSupabase(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', Number(id));

  if (error) throw error;
}

function bindTaskList(listId, key, countId) {
  document.getElementById(listId).addEventListener('click', async (event) => {
    const item = event.target.closest('.task-item');
    if (!item) return;

    const task = state.tasks[key].find(t => t.id === item.dataset.id);
    if (!task) return;

    const action = event.target.dataset.action || event.target.closest('[data-action]')?.dataset.action;

    try {
      if (action === 'toggle') {
        await updateTaskInSupabase(task.id, { done: !task.done });
        await loadTasksFromSupabase();
        return;
      }

      if (action === 'delete') {
        await deleteTaskFromSupabase(task.id);
        await loadTasksFromSupabase();
        return;
      }

      if (action === 'edit') {
        state.editingTaskId = task.id;
        state.editingTaskKey = key;
        const form = document.getElementById('taskEditForm');
        form.title.value = task.title;
        form.category.value = task.category || 'uni';
        openPanel('taskEditor');
      }
    } catch (err) {
      alert(err.message);
    }
  });
}

async function addTaskToSupabase(title, category) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Nicht eingeloggt');

  const { error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title,
      category,
      done: false
    });

  if (error) throw error;
}

function bindTaskForm(formId, key, listId, countId, wrapId) {
  const form = document.getElementById(formId);
  const wrap = document.getElementById(wrapId);

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString().trim();
    const category = (fd.get('category') || 'uni').toString();

    if (!title) return;

    try {
      await addTaskToSupabase(title, category);
      form.reset();
      wrap?.classList.remove('is-open');
      await loadTasksFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });
}

// ── CREDITS ──
function renderCredits(){const{earned,total}=state.credits;const pct=Math.max(0,Math.min(100,(earned/total)*100));document.getElementById('creditProgressText').textContent=`${earned} / ${total} Credits · ${pct.toFixed(0)} %`;document.getElementById('creditFill').style.width=pct+'%';}

function bindCreditsForm() {
  const form = document.getElementById('creditsForm');
  const wrap = document.getElementById('creditsFormWrap');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fd = new FormData(form);
    const earned = Number(fd.get('earned'));

    if (!Number.isFinite(earned) || earned < 0) return;

    try {
      await saveCreditsToSupabase(Math.min(120, earned), 120);
      form.reset();
      wrap?.classList.remove('is-open');
      await loadCreditsFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadCreditsFromSupabase() {
  const user = await getCurrentUser();

  if (!user) {
    state.credits = { earned: 0, total: 120 };
    renderCredits();
    return;
  }

  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  state.credits = {
    earned: data?.earned ?? 0,
    total: data?.total ?? 120
  };

  renderCredits();
}

async function saveCreditsToSupabase(earned, total = 120) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Nicht eingeloggt');

  const { error } = await supabase
    .from('credits')
    .upsert(
      {
        user_id: user.id,
        earned,
        total,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id'
      }
    );

  if (error) throw error;
}

// ── JOB-METRIKEN mit auto-Überstunden ──
function renderJobMetrics(){
  const{doneHours,targetHours,overtime}=state.job;
  const open=Math.max(0,targetHours-doneHours);
  document.getElementById('jobDoneHours').textContent=`${doneHours} h`;
  document.getElementById('jobTargetHours').textContent=`${targetHours} h`;
  document.getElementById('jobOpenHours').textContent=`${open} h`;
  document.getElementById('jobOvertimeHours').textContent=`${overtime} h`;
  document.getElementById('jobWeekBadge').textContent=`${targetHours} h / Woche`;
  // Konto goldfarbig wenn > 0
  const box=document.getElementById('jobOvertimeBox');
  box.classList.toggle('overtime-positive',overtime>0);
}

function openPanel(id){document.getElementById(id)?.classList.add('is-open');}
function closePanel(id){document.getElementById(id)?.classList.remove('is-open');}
function bindPanelCloseButtons(){document.querySelectorAll('[data-close-panel]').forEach(btn=>btn.addEventListener('click',()=>closePanel(btn.dataset.closePanel)));}

function bindJobHoursInline() {
  document.querySelectorAll('[data-edit-job]').forEach(el => {
    el.addEventListener('click', () => {
      const form = document.getElementById('jobInlineForm');
      if (!form) return;

      form.doneHours.value = state.job.doneHours;
      form.targetHours.value = state.job.targetHours;
      form.manualAdd.value = 0;
      openPanel('jobInlineEditor');
    });
  });

  const form = document.getElementById('jobInlineForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fd = new FormData(form);
    const newDone = Number(fd.get('doneHours'));
    const newTarget = Number(fd.get('targetHours'));
    const manualAdd = Number(fd.get('manualAdd')) || 0;

    let doneHours = state.job.doneHours;
    let targetHours = state.job.targetHours;
    let newOvertime = state.job.overtime;

    if (Number.isFinite(newDone) && newDone >= 0) doneHours = newDone;
    if (Number.isFinite(newTarget) && newTarget >= 0) targetHours = newTarget;

    if (doneHours > targetHours) {
      const ueberstunden = Number((doneHours - targetHours).toFixed(1));
      newOvertime = Number((newOvertime + ueberstunden).toFixed(1));
    }

    if (Number.isFinite(manualAdd) && manualAdd !== 0) {
      newOvertime = Number((newOvertime + manualAdd).toFixed(1));
    }

    newOvertime = Math.max(0, newOvertime);

    try {
      await saveJobMetricsToSupabase(doneHours, targetHours, newOvertime);
      closePanel('jobInlineEditor');
      await loadJobMetricsFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadJobMetricsFromSupabase() {
  const user = await getCurrentUser();

  if (!user) {
    state.job = { doneHours: 0, targetHours: 10, overtime: 0 };
    renderJobMetrics();
    return;
  }

  const { data, error } = await supabase
    .from('job_metrics')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  state.job = {
    doneHours: Number(data?.done_hours ?? 0),
    targetHours: Number(data?.target_hours ?? 10),
    overtime: Number(data?.overtime ?? 0)
  };

  renderJobMetrics();
}

async function saveJobMetricsToSupabase(doneHours, targetHours, overtime) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Nicht eingeloggt');

  const { error } = await supabase
    .from('job_metrics')
    .upsert(
      {
        user_id: user.id,
        done_hours: doneHours,
        target_hours: targetHours,
        overtime,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id'
      }
    );

  if (error) throw error;
}

// ── EVENTS & KALENDER ──
function eventTs(ev){return new Date(`${ev.date}T${ev.startTime||'00:00'}`).getTime();}
function sortedEvents(){return [...state.events].sort((a,b)=>eventTs(a)-eventTs(b));}
function categoryLabel(category){return({uni:'Uni',work:'Arbeit',sport:'Sport',private:'Privat',deadline:'Deadline'})[category]||'Termin';}
function categoryIcon(category){return({uni:'🎓',work:'💼',sport:'⚽',private:'🧍',deadline:'🔴'})[category]||'🗓️';}
function formatEventDate(date,startTime,endTime){const d=new Date(`${date}T${startTime}`);return d.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'})+' · '+startTime+'–'+endTime+' Uhr';}

function renderNextEvent(){
  const now=Date.now();
  const items=getCalendarItems();
  const next=items.find(ev=>eventTs(ev)>=now)||items[0];
  const box=document.getElementById('nextEventBox');
  if(!next){box.innerHTML='<div class="event-main"><div class="event-title">Noch kein Termin eingetragen</div><div class="event-meta">Lege oben den ersten Termin an.</div></div>';return;}
  box.innerHTML=`<div class="next-event-icon">${categoryIcon(next.category)}</div><div class="event-main"><div class="event-title">${escapeHtml(next.title)}</div><div class="event-meta">${categoryLabel(next.category)} · ${formatEventDate(next.date,next.startTime,next.endTime)}</div></div>`;
}

function renderEventList(){
  const upcoming=getCalendarItems();
  document.getElementById('eventCountBadge').textContent=`${upcoming.length} Termine`;
}

// ── KALENDER: Deadlines automatisch ROT eintragen ──
function getCalendarItems(){
  // Deadlines als Kalendereinträge mit Kategorie "deadline"
  const deadlineEvents=state.deadlines
    .filter(dl=>dl.isoDate)
    .map((dl,index)=>({
      id:'deadline-'+index,
      title:'⚠ '+dl.title,
      date:dl.isoDate,
      startTime:'00:00',
      endTime:'23:59',
      category:'deadline',
      readonly:true
    }));
  return [...state.events,...deadlineEvents].sort((a,b)=>eventTs(a)-eventTs(b));
}

function renderCalendar(){
  const grid=document.getElementById('calendarGrid');
  grid.innerHTML='';
  ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(label=>{
    const h=document.createElement('div');
    h.className='calendar-dayhead';
    h.textContent=label;
    grid.appendChild(h);
  });
  const current=state.currentCalendarDate;
  const month=current.getMonth();
  const year=current.getFullYear();
  const first=new Date(year,month,1);
  const firstWeekday=(first.getDay()+6)%7;
  const start=new Date(year,month,1-firstWeekday);

  for(let i=0;i<42;i++){
    const cellDate=new Date(start);
    cellDate.setDate(start.getDate()+i);
    const iso=`${cellDate.getFullYear()}-${String(cellDate.getMonth()+1).padStart(2,'0')}-${String(cellDate.getDate()).padStart(2,'0')}`;
    const dayItems=getCalendarItems().filter(ev=>ev.date===iso);
    const hasDeadline=dayItems.some(ev=>ev.category==='deadline');
    const hasOtherEvent=dayItems.some(ev=>ev.category!=='deadline');

    const cell=document.createElement('button');
    cell.type='button';
    cell.dataset.date=iso;
    cell.className=[
      'calendar-cell',
      cellDate.getMonth()!==month?'is-outside':'',
      hasOtherEvent?'has-event':'',
      hasDeadline?'has-deadline':''
    ].filter(Boolean).join(' ');

    cell.innerHTML=`<div class="calendar-daynum">${cellDate.getDate()}</div>`;

    // Deadlines zuerst anzeigen (rot), dann restliche Termine
    const deadlineItems=dayItems.filter(ev=>ev.category==='deadline');
    const otherItems=dayItems.filter(ev=>ev.category!=='deadline');

    [...deadlineItems,...otherItems].slice(0,2).forEach(ev=>{
      const pill=document.createElement('span');
      pill.className=`calendar-pill ${ev.category}`;
      pill.textContent=ev.category==='deadline'
        ?`🔴 ${ev.title.replace('⚠ ','')}`
        :`${categoryLabel(ev.category)} · ${ev.startTime}`;
      cell.appendChild(pill);
    });

    grid.appendChild(cell);
  }
}

function rerenderEvents(){renderNextEvent();renderEventList();renderCalendar();bindCalendarCells();renderSelectedDayEvents();updateChartIfReady();}
function updateChartIfReady(){if(window.weekChartInstance){const{uni,work,sport}=calcWeekData();window.weekChartInstance.data.datasets[0].data=uni;window.weekChartInstance.data.datasets[1].data=work;window.weekChartInstance.data.datasets[2].data=sport;const maxRaw=Math.max(...uni.map((v,i)=>v+work[i]+sport[i]),4);window.weekChartInstance.options.scales.y.max=Math.ceil(maxRaw)+1;window.weekChartInstance.update();}}

// Rundet Startzeit auf :00 und setzt Endzeit auf +1h
function bindEventTimeLogic(formId){
  const form=document.getElementById(formId);
  if(!form)return;
  const startInput=form.querySelector('[name="startTime"]');
  const endInput=form.querySelector('[name="endTime"]');
  if(!startInput||!endInput)return;

  // Beim Fokussieren: Startwert :00 vorbelegen, falls noch leer
  startInput.addEventListener('focus',()=>{
    if(!startInput.value){
      const now=new Date();
      startInput.value=String(now.getHours()).padStart(2,'0')+':00';
    }
  });

  // Nach Auswahl der Stunde: Minuten auf :00 setzen UND Endzeit auf +1h
  // Nur wenn Endzeit noch nicht manuell geändert wurde
  let endManuallyEdited=false;
  endInput.addEventListener('input',()=>{ endManuallyEdited=true; });

  startInput.addEventListener('change',()=>{
    const val=startInput.value;
    if(!val)return;
    const[hStr,mStr]=val.split(':');
    // Minuten auf :00 setzen (nur wenn Minuten noch 0 oder leer — = Startwert)
    // Nutzer kann danach frei ändern, aber initialer Klick setzt :00
    if(!mStr||mStr==='00'||mStr==='0'){
      startInput.value=hStr.padStart(2,'0')+':00';
    }
    // Endzeit nur setzen wenn noch nicht manuell geändert
    if(!endManuallyEdited||!endInput.value){
      const hNum=parseInt(hStr,10);
      const endH=Math.min(hNum+1,23);
      endInput.value=String(endH).padStart(2,'0')+':00';
    }
  });

  // Bei Öffnen eines Edit-Formulars: Status zurücksetzen
  form.addEventListener('reset',()=>{ endManuallyEdited=false; });
}

function bindEventForm(){
  bindEventTimeLogic('eventForm');
  bindEventTimeLogic('eventEditForm');
  document.getElementById('eventForm').addEventListener('submit',event=>{
    event.preventDefault();
    const fd=new FormData(event.currentTarget);
    const title=fd.get('title').toString().trim();
    if(!title)return;
    state.events.push({id:crypto.randomUUID(),title,date:fd.get('date').toString(),startTime:fd.get('startTime').toString(),endTime:fd.get('endTime').toString(),category:fd.get('category').toString()});
    state.selectedCalendarDate=fd.get('date').toString();
    event.currentTarget.reset();
    document.getElementById('eventFormWrap').classList.remove('is-open');
    rerenderEvents();
  });
  document.getElementById('eventEditForm').addEventListener('submit',event=>{
    event.preventDefault();
    const ev=state.events.find(item=>item.id===state.editingEventId);
    if(!ev)return;
    const fd=new FormData(event.currentTarget);
    const title=fd.get('title').toString().trim();
    if(!title)return;
    ev.title=title;ev.date=fd.get('date').toString();ev.startTime=fd.get('startTime').toString();ev.endTime=fd.get('endTime').toString();ev.category=fd.get('category').toString();
    state.selectedCalendarDate=ev.date;
    closePanel('eventEditor');
    rerenderEvents();
  });
}

function bindCalendarNav(){
  document.getElementById('prevMonthBtn').addEventListener('click',()=>{state.currentCalendarDate=new Date(state.currentCalendarDate.getFullYear(),state.currentCalendarDate.getMonth()-1,1);renderCalendar();bindCalendarCells();});
  document.getElementById('nextMonthBtn').addEventListener('click',()=>{state.currentCalendarDate=new Date(state.currentCalendarDate.getFullYear(),state.currentCalendarDate.getMonth()+1,1);renderCalendar();bindCalendarCells();});
}

function renderSelectedDayEvents(){
  const panel=document.getElementById('selectedDayPanel');
  const list=document.getElementById('selectedDayEvents');
  if(!state.selectedCalendarDate){panel.classList.remove('is-open');list.innerHTML='';return;}
  const events=getCalendarItems().filter(ev=>ev.date===state.selectedCalendarDate);
  document.getElementById('selectedDayTitle').textContent='Termine am ausgewählten Tag';
  document.getElementById('selectedDaySubtitle').textContent=new Date(state.selectedCalendarDate+'T12:00').toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'});
  list.innerHTML='';
  if(!events.length){panel.classList.add('is-open');list.innerHTML='<div class="muted">Keine Termine an diesem Tag.</div>';return;}
  events.forEach((ev,index)=>{
    const card=document.createElement('article');
    card.className='day-event-card';
    card.dataset.id=ev.id;
    const isDeadline=ev.category==='deadline';
    card.style.borderColor=isDeadline?'#f87171':'';
    card.innerHTML=`<div class="goal-index" style="${isDeadline?'background:#fee2e2;color:#b91c1c;':''}">${isDeadline?'🔴':index+1}</div><div><div class="goal-title">${escapeHtml(ev.title)}</div><div class="goal-sub">${categoryLabel(ev.category)} · ${isDeadline?ev.date:''+formatEventDate(ev.date,ev.startTime,ev.endTime)}</div></div><div class="goal-actions">${isDeadline?'':` <button class="icon-btn" type="button" data-day-action="edit" aria-label="Termin bearbeiten">✎</button>`}<button class="icon-btn" type="button" data-day-action="delete" aria-label="${isDeadline?'Deadline':'Termin'} löschen">×</button></div>`;
    list.appendChild(card);
  });
  panel.classList.add('is-open');
}

function bindSelectedDayEvents(){
  document.getElementById('selectedDayEvents').addEventListener('click',event=>{
    const btn=event.target.closest('[data-day-action]');
    if(!btn)return;
    const card=event.target.closest('.day-event-card');
    if(!card)return;
    const action=btn.dataset.dayAction;
    const id=card.dataset.id;

    // Deadline-Einträge haben id wie "deadline-0"
    if(id.startsWith('deadline-')){
      if(action==='delete'){
        const idx=parseInt(id.replace('deadline-',''));
        state.deadlines.splice(idx,1);
        state.selectedCalendarDate=null;
        renderDeadlines();
        rerenderEvents();
      }
      return;
    }

    const ev=state.events.find(item=>item.id===id);
    if(!ev)return;
    if(action==='delete'){state.events=state.events.filter(item=>item.id!==ev.id);renderSelectedDayEvents();rerenderEvents();return;}
    if(action==='edit'){
      state.editingEventId=ev.id;
      const form=document.getElementById('eventEditForm');
      form.title.value=ev.title;form.date.value=ev.date;form.startTime.value=ev.startTime;form.endTime.value=ev.endTime;form.category.value=ev.category;
      openPanel('eventEditor');
    }
  });
}

function bindCalendarCells(){
  document.querySelectorAll('.calendar-cell').forEach(cell=>{
    cell.onclick=()=>{state.selectedCalendarDate=cell.dataset.date;renderSelectedDayEvents();};
  });
}

// ── DEADLINES ──
function renderDeadlines(){
  const list=document.getElementById('deadlineList');
  list.innerHTML='';
  state.deadlines.forEach(dl=>{
    const item=document.createElement('li');
    item.className=`deadline-item ${dl.level==='urgent'?'urgent':dl.level==='warn'?'warn':''}`;
    item.dataset.id=dl.id;
    item.innerHTML=`<span>${escapeHtml(dl.title)}</span><div class="inline-actions"><span class="muted">${escapeHtml(dl.date)}</span><button class="icon-btn" type="button" data-action="edit" aria-label="Deadline bearbeiten">✎</button><button class="icon-btn" type="button" data-action="delete" aria-label="Deadline löschen">×</button></div>`;
    list.appendChild(item);
  });
}

function bindDeadlineForm() {
  const deadlineForm = document.getElementById('deadlineForm');
  const deadlineList = document.getElementById('deadlineList');
  const deadlineEditForm = document.getElementById('deadlineEditForm');

  if (!deadlineForm || !deadlineList || !deadlineEditForm) return;

  deadlineForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = deadlineForm;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString().trim();
    const date = (fd.get('date') || '').toString().trim();

    if (!title || !date) return;

    const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    const level = daysUntil <= 7 ? 'urgent' : daysUntil <= 21 ? 'warn' : 'normal';

    try {
      await addDeadlineToSupabase(title, date, level);
      form.reset();
      document.getElementById('deadlineFormWrap')?.classList.remove('is-open');
      await loadDeadlinesFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });

  deadlineList.addEventListener('click', async (event) => {
    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;

    const item = event.target.closest('.deadline-item');
    if (!item) return;

    const deadline = state.deadlines.find(d => d.id === item.dataset.id);
    if (!deadline) return;

    const action = actionBtn.dataset.action;

    try {
      if (action === 'delete') {
        await deleteDeadlineFromSupabase(deadline.id);
        await loadDeadlinesFromSupabase();
        return;
      }

      if (action === 'edit') {
        state.editingDeadlineId = deadline.id;
        deadlineEditForm.title.value = deadline.title;
        deadlineEditForm.date.value = deadline.isoDate || '';
        openPanel('deadlineEditor');
      }
    } catch (err) {
      alert(err.message);
    }
  });

  deadlineEditForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = deadlineEditForm;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString().trim();
    const date = (fd.get('date') || '').toString().trim();

    if (!title || !date || !state.editingDeadlineId) return;

    const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    const level = daysUntil <= 7 ? 'urgent' : daysUntil <= 21 ? 'warn' : 'normal';

    try {
      await updateDeadlineInSupabase(state.editingDeadlineId, {
        title,
        iso_date: date,
        level
      });

      closePanel('deadlineEditor');
      await loadDeadlinesFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });
}

async function loadDeadlinesFromSupabase() {
  const user = await getCurrentUser();

  if (!user) {
    state.deadlines = [];
    renderDeadlines();
    rerenderEvents();
    return;
  }

  const { data, error } = await supabase
    .from('deadlines')
    .select('*')
    .eq('user_id', user.id)
    .order('iso_date', { ascending: true });

  if (error) throw error;

  state.deadlines = data.map(dl => ({
    id: String(dl.id),
    title: dl.title,
    isoDate: dl.iso_date,
    date: new Date(dl.iso_date + 'T12:00').toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short'
    }),
    level: dl.level || 'normal'
  }));

  renderDeadlines();
  rerenderEvents();
}

async function addDeadlineToSupabase(title, isoDate, level) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Nicht eingeloggt');

  const { error } = await supabase
    .from('deadlines')
    .insert({
      user_id: user.id,
      title,
      iso_date: isoDate,
      level
    });

  if (error) throw error;
}

async function updateDeadlineInSupabase(id, updates) {
  const { error } = await supabase
    .from('deadlines')
    .update(updates)
    .eq('id', Number(id));

  if (error) throw error;
}

async function deleteDeadlineFromSupabase(id) {
  const { error } = await supabase
    .from('deadlines')
    .delete()
    .eq('id', Number(id));

  if (error) throw error;
}

// ── WOCHENZIELE ──
const GOAL_CAT_ORDER=['uni','arbeit','freizeit'];
const GOAL_CAT_LABELS={uni:'Uni',arbeit:'Arbeit',freizeit:'Freizeit'};
const GOAL_CAT_ICONS={uni:'🎓',arbeit:'💼',freizeit:'🏖️'};
const GOAL_CAT_COLORS={uni:'var(--color-blue)',arbeit:'var(--color-gold)',freizeit:'var(--color-green)'};
const GOAL_CAT_BG={uni:'var(--color-blue-light)',arbeit:'var(--color-gold-light)',freizeit:'var(--color-green-light)'};

async function loadGoalsFromSupabase() {
  const user = await getCurrentUser();

  if (!user) {
    state.goals = [];
    renderGoals();
    return;
  }

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;

  state.goals = data.map(goal => ({
    id: String(goal.id),
    title: goal.title,
    subtitle: goal.subtitle || '',
    category: goal.category || 'uni'
  }));

  renderGoals();
}

async function addGoalToSupabase(title, subtitle, category) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Nicht eingeloggt');

  const { error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title,
      subtitle,
      category
    });

  if (error) throw error;
}

async function updateGoalInSupabase(id, updates) {
  const { error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', Number(id));

  if (error) throw error;
}

async function deleteGoalFromSupabase(id) {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', Number(id));

  if (error) throw error;
}

function renderGoals(){
  const wrap=document.getElementById('goalList');
  wrap.innerHTML='';

  let globalIdx=0;
  GOAL_CAT_ORDER.forEach(cat=>{
    const catGoals=state.goals.filter(g=>g.category===cat);
    if(!catGoals.length)return;
    const header=document.createElement('div');
    header.className='task-category-header';
    header.textContent=`${GOAL_CAT_ICONS[cat]} ${GOAL_CAT_LABELS[cat]}`;
    wrap.appendChild(header);
    const stack=document.createElement('div');
    stack.className='goal-stack';
    catGoals.forEach(goal=>{
      globalIdx++;
      const el=document.createElement('article');
      el.className='goal-card';
      el.dataset.id=goal.id;
      el.innerHTML=`<div class="goal-index" style="background:${GOAL_CAT_BG[cat]};color:${GOAL_CAT_COLORS[cat]}">${globalIdx}</div><div><div class="goal-title">${escapeHtml(goal.title)}</div><div class="goal-sub">${escapeHtml(goal.subtitle||'Keine Zusatznotiz')}</div></div><div class="goal-actions"><button class="icon-btn" type="button" data-action="edit" aria-label="Ziel bearbeiten">✎</button><button class="icon-btn" type="button" data-action="delete" aria-label="Ziel löschen">×</button></div>`;
      stack.appendChild(el);
    });
    wrap.appendChild(stack);
  });

  // Sonstige (unbekannte Kategorie)
  const others=state.goals.filter(g=>!GOAL_CAT_ORDER.includes(g.category));
  if(others.length){
    const header=document.createElement('div');
    header.className='task-category-header';
    header.textContent='📋 Sonstige';
    wrap.appendChild(header);
    const stack=document.createElement('div');
    stack.className='goal-stack';
    others.forEach(goal=>{
      globalIdx++;
      const el=document.createElement('article');
      el.className='goal-card';
      el.dataset.id=goal.id;
      el.innerHTML=`<div class="goal-index">${globalIdx}</div><div><div class="goal-title">${escapeHtml(goal.title)}</div><div class="goal-sub">${escapeHtml(goal.subtitle||'')}</div></div><div class="goal-actions"><button class="icon-btn" type="button" data-action="edit" aria-label="Ziel bearbeiten">✎</button><button class="icon-btn" type="button" data-action="delete" aria-label="Ziel löschen">×</button></div>`;
      stack.appendChild(el);
    });
    wrap.appendChild(stack);
  }
}

function bindTaskEditForm() {
  document.getElementById('taskEditForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fd = new FormData(event.currentTarget);
    const title = fd.get('title').toString().trim();
    const category = fd.get('category').toString();

    if (!title || !state.editingTaskId) return;

    try {
      await updateTaskInSupabase(state.editingTaskId, {
        title,
        category
      });

      closePanel('taskEditor');
      await loadTasksFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });
}

function bindGoalForm() {
  const goalForm = document.getElementById('goalForm');
  const goalList = document.getElementById('goalList');
  const goalEditForm = document.getElementById('goalEditForm');

  if (!goalForm || !goalList || !goalEditForm) return;

  goalForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = goalForm;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString().trim();
    const subtitle = (fd.get('subtitle') || '').toString().trim();
    const category = (fd.get('category') || 'uni').toString();

    if (!title) return;

    try {
      await addGoalToSupabase(title, subtitle, category);
      form.reset();
      document.getElementById('goalFormWrap')?.classList.remove('is-open');
      await loadGoalsFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });

  goalList.addEventListener('click', async (event) => {
    event.stopPropagation();

    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;

    const card = event.target.closest('.goal-card');
    if (!card) return;

    const goal = state.goals.find(g => g.id === card.dataset.id);
    if (!goal) return;

    const action = actionBtn.dataset.action;

    try {
      if (action === 'delete') {
        await deleteGoalFromSupabase(goal.id);
        await loadGoalsFromSupabase();
        return;
      }

      if (action === 'edit') {
        state.editingGoalId = goal.id;
        goalEditForm.title.value = goal.title;
        goalEditForm.category.value = goal.category || 'uni';
        goalEditForm.subtitle.value = goal.subtitle || '';
        document.querySelector('#goalEditor .edit-panel-title').textContent = 'Wochenziel bearbeiten';
        openPanel('goalEditor');
      }
    } catch (err) {
      alert(err.message);
    }
  });

  goalEditForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = goalEditForm;
    const fd = new FormData(form);
    const title = (fd.get('title') || '').toString().trim();
    const subtitle = (fd.get('subtitle') || '').toString().trim();
    const category = (fd.get('category') || 'uni').toString();

    if (!title || !state.editingGoalId) return;

    try {
      await updateGoalInSupabase(state.editingGoalId, {
        title,
        subtitle,
        category
      });

      closePanel('goalEditor');
      await loadGoalsFromSupabase();
    } catch (err) {
      alert(err.message);
    }
  });
}

// ── CHART – live aus Kalender-Events ──
function getChartColors(theme){const isDark=theme==='dark';return{blue:isDark?'#60a5fa':'#2563eb',gold:isDark?'#fbbf24':'#d97706',green:isDark?'#4ade80':'#16a34a',text:isDark?'#94a3b8':'#6b7280',grid:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'}; }

// Dauer eines Events in Stunden (gerundet auf 0.1)
function eventDurationH(ev){
  const [sh,sm]=(ev.startTime||'00:00').split(':').map(Number);
  const [eh,em]=(ev.endTime||'01:00').split(':').map(Number);
  const diff=(eh*60+em)-(sh*60+sm);
  return diff>0?Math.round(diff/6)/10:0;
}

// Summiert Stunden je Kategorie für Mo–So der aktuellen Woche
function calcWeekData(){
  const now=new Date();
  const dayOfWeek=(now.getDay()+6)%7; // Mo=0 … So=6
  const monday=new Date(now);
  monday.setDate(now.getDate()-dayOfWeek);
  monday.setHours(0,0,0,0);
  const uni=Array(7).fill(0);
  const work=Array(7).fill(0);
  const sport=Array(7).fill(0);
  state.events.forEach(ev=>{
    const d=new Date(ev.date+'T12:00');
    const idx=Math.floor((d-monday)/(1000*60*60*24));
    if(idx<0||idx>6)return;
    const h=eventDurationH(ev);
    if(ev.category==='uni')uni[idx]+=h;
    else if(ev.category==='work')work[idx]+=h;
    else if(ev.category==='sport')sport[idx]+=h;
  });
  // auf 1 Dezimale runden
  return{
    uni:uni.map(v=>Math.round(v*10)/10),
    work:work.map(v=>Math.round(v*10)/10),
    sport:sport.map(v=>Math.round(v*10)/10)
  };
}

function buildChart(theme){
  const ctx=document.getElementById('weekChart');
  if(!ctx)return;
  const c=getChartColors(theme);
  const{uni,work,sport}=calcWeekData();
  const maxRaw=Math.max(...uni.map((v,i)=>v+work[i]+sport[i]),4);
  const maxY=Math.ceil(maxRaw)+1;
  window.weekChartInstance=new Chart(ctx,{type:'bar',data:{labels:['Mo','Di','Mi','Do','Fr','Sa','So'],datasets:[
    {label:'Uni',data:uni,backgroundColor:c.blue,borderRadius:8,borderSkipped:false},
    {label:'Arbeit',data:work,backgroundColor:c.gold,borderRadius:8,borderSkipped:false},
    {label:'Sport',data:sport,backgroundColor:c.green,borderRadius:8,borderSkipped:false}
  ]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:"'Satoshi',sans-serif",size:11},color:c.text,usePointStyle:true,boxHeight:8,padding:14}},tooltip:{backgroundColor:theme==='dark'?'#1c2235':'#fff',borderColor:theme==='dark'?'#252d40':'#e2e6ef',borderWidth:1,titleColor:theme==='dark'?'#e2e8f0':'#1a1f2e',bodyColor:c.text,callbacks:{label:ctx=>` ${ctx.dataset.label}: ${ctx.parsed.y} h`}}},scales:{x:{stacked:true,grid:{display:false},ticks:{color:c.text},border:{display:false}},y:{stacked:true,grid:{color:c.grid},ticks:{color:c.text,callback:v=>v+' h'},border:{display:false},max:maxY}}}});
}
function updateChartTheme(theme){if(window.weekChartInstance)window.weekChartInstance.destroy();buildChart(theme);}

// ── INIT ──
async function init() {
  formatHeaderDate();
  initTheme();
  bindToggleForms();
  bindPanelCloseButtons();
  bindAuth();

  renderTaskList('today','todayTaskList','todayTaskCount');
  bindTaskList('todayTaskList','today','todayTaskCount');
  bindTaskForm('todayTaskForm','today','todayTaskList','todayTaskCount','todayTaskFormWrap');
  bindTaskEditForm();
  renderCredits();
  bindCreditsForm();
  renderDeadlines();
  bindDeadlineForm();
  renderJobMetrics();
  bindJobHoursInline();
  renderGoals();
  bindGoalForm();
  bindEventForm();
  bindCalendarNav();
  bindSelectedDayEvents();
  rerenderEvents();
  bindCalendarCells();
  buildChart(document.documentElement.getAttribute('data-theme') || 'light');

  await checkAuthOnStart();
}

init();
