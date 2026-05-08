import { useState, useEffect } from 'react';
import { fetchPlayers, createPlayer } from '../utils/api';

export default function PlayerPicker({ onSelectPlayer }) {
  const [players, setPlayers] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlayers()
      .then(({ players }) => setPlayers(players))
      .catch(() => setError('Could not load players.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setError('');
    try {
      const { player } = await createPlayer(name);
      onSelectPlayer(player);
    } catch (err) {
      setError(err.message === 'Name already taken' ? 'That name is already taken.' : err.message);
    }
  };

  return (
    <div className="player-picker">
      <h2>Who is playing?</h2>
      {loading && <p>Loading...</p>}
      {players.length > 0 && (
        <div className="player-list">
          {players.map(p => (
            <button key={p.id} className="player-btn" onClick={() => onSelectPlayer(p)}>
              {p.name}
            </button>
          ))}
        </div>
      )}
      <form className="new-player-form" onSubmit={handleCreate}>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New player name..."
          maxLength={40}
        />
        <button className="btn" type="submit">Create</button>
      </form>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
