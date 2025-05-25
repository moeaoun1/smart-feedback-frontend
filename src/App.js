import React, { useState } from 'react';
import './App.css';

function App() {
  const [rawInput, setRawInput] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('feedback-history');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSubmit = async () => {
    if (!rawInput.trim()) return;
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_input: rawInput }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Something went wrong');
      }

      const data = await res.json();
      setSummary(data.generated_summary);

      const newEntry = {
        id: Date.now(),
        input: rawInput,
        summary: data.generated_summary,
      };
      const updated = [newEntry, ...history];
      setHistory(updated);
      localStorage.setItem('feedback-history', JSON.stringify(updated));
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
      <div className="container">
        <h1>Smart Feedback Assistant</h1>

        <p className="about">
          Paste performance notes, and this AI assistant will generate a polished
          feedback summary using OpenAI’s GPT model. Great for performance reviews,
          mentoring feedback, or HR reports.
        </p>

        <textarea
            placeholder="Enter raw performance feedback here..."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
        />

        <div className="button-wrapper">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
        </div>

        {summary && (
            <div className="summary">
              <h2>Generated Summary</h2>
              <p>{summary}</p>
            </div>
        )}

        {error && <p className="error">❌ {error}</p>}

        {history.length > 1 && (
            <div className="history">
              <h3>Feedback History</h3>
              {history.slice(1).map((entry) => (
                  <div key={entry.id} className="history-item">
                    <p><strong>Input:</strong> {entry.input}</p>
                    <p><strong>Summary:</strong> {entry.summary}</p>
                    <hr />
                  </div>
              ))}
            </div>
        )}
      </div>
  );
}

export default App;
