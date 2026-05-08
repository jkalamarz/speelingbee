async function apiFetch(path, options = {}) {
  const res = await fetch(path, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export function fetchPlayers() {
  return apiFetch('/api/players');
}

export function createPlayer(name) {
  return apiFetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
}

export function fetchProgress(playerId, stage, mode) {
  return apiFetch(`/api/progress/${playerId}/${encodeURIComponent(stage)}/${encodeURIComponent(mode)}`);
}

export function recordAnswer(playerId, stage, mode, word, correct) {
  return apiFetch(
    `/api/progress/${playerId}/${encodeURIComponent(stage)}/${encodeURIComponent(mode)}/${encodeURIComponent(word)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct }),
    }
  );
}
