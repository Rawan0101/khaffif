// Same Supabase URL and anon key as the web app (Project Settings → API)
export const SUPABASE_URL = '';
export const SUPABASE_KEY = '';
export const LIVE_READY = !!(SUPABASE_URL && SUPABASE_KEY);

// Devices that count as 100% full; kept small so a few phones can demo it
export const DEMO_CAPACITY = 5;

// Random per-launch session id; never linked to a student's name or ID
export const SESSION_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);

async function sb(path, opt = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opt,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(opt.headers || {}),
    },
  });
  if (!r.ok) throw new Error(`${r.status}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

export async function enterPlace(uni, place) {
  if (!LIVE_READY) return;
  try {
    await sb('presence?on_conflict=session_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ session_id: SESSION_ID, uni, place, last_seen: new Date().toISOString() }),
    });
  } catch (e) {}
}

export async function exitPlace() {
  if (!LIVE_READY) return;
  try { await sb(`presence?session_id=eq.${SESSION_ID}`, { method: 'DELETE' }); } catch (e) {}
}

export async function sendReport(uni, place, level) {
  if (!LIVE_READY) return;
  try {
    await sb('reports', { method: 'POST', body: JSON.stringify({ session_id: SESSION_ID, uni, place, level }) });
  } catch (e) {}
}

// Returns { counts: {place: devices}, reports: {place: {low, mid, high}}, devices }
export async function fetchLive(uni) {
  const [c, r] = await Promise.all([sb(`place_counts?uni=eq.${uni}`), sb(`place_reports?uni=eq.${uni}`)]);
  const counts = {}; let devices = 0;
  (c || []).forEach((x) => { counts[x.place] = x.devices; devices += x.devices; });
  const reports = {};
  (r || []).forEach((x) => { reports[x.place] = x; });
  return { counts, reports, devices };
}

// Boundaries saved from the web app (if any)
export async function fetchPlaces(uni) {
  if (!LIVE_READY) return null;
  try { return await sb(`places?uni=eq.${uni}`); } catch (e) { return null; }
}
