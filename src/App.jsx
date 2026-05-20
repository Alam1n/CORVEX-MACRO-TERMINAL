import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Zap, Activity, TrendingUp, Lock } from 'lucide-react';

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const styles = {
    wrapper: { backgroundColor: '#02040a', minHeight: '100vh', width: '100%', margin: 0, padding: 0 },
    body: { color: '#ffffff', padding: '40px 20px', fontFamily: 'monospace' },
    container: { maxWidth: '1000px', margin: '0 auto' },
    card: { backgroundColor: '#0b111a', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' },
    h1: { color: '#3b82f6', fontSize: '32px', textAlign: 'center', fontStyle: 'italic', margin: '10px 0' },
    h2: { color: '#64748b', fontSize: '11px', letterSpacing: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    input: { backgroundColor: '#02040a', border: '1px solid #1e293b', color: 'white', padding: '12px', borderRadius: '6px', width: '100%', marginBottom: '15px', fontFamily: 'monospace' },
    btn: { backgroundColor: '#3b82f6', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
    strongBuy: { color: '#4ade80', fontWeight: 'bold' },
    sell: { color: '#ef4444' }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // ✅ FIXED: Removed the smashed local url prefix
      const res = await axios.post('https://capitalize-backend.onrender.com/api/login', loginData);
      const newToken = res.data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } catch (err) {
      setError("❌ ACCESS DENIED: INVALID CREDENTIALS");
    }
  };

  const fetchDashboard = async () => {
    const currentToken = localStorage.getItem('token'); 
    
    // ✅ GUARD RAIL: If the storage token is missing or explicitly stringified as 'undefined', halt!
    if (!currentToken || currentToken === 'undefined') {
      setToken(null);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get('https://capitalize-backend.onrender.com/api/dashboard', {
        headers: {
          // ✅ FIXED: Now correctly pointing to 'currentToken' instead of the stale 'token' state
          'Authorization': `Bearer ${currentToken}` 
        }
      });
      setData(res.data);
    } catch (err) { 
      console.error("API Error:", err); 
      // Force exit out of stale/unauthorized tokens
      if (err.response?.status === 401 || err.response?.status === 422) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setData(null);
  };

  useEffect(() => { 
    if (token && token !== 'undefined') {
      fetchDashboard(); 
    } 
  }, [token]);

  // --- LOGIN VIEW ---
  if (!token || token === 'undefined') {
    return (
      <div style={styles.wrapper}>
        <div style={{...styles.body, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
          <div style={{...styles.card, width: '100%', maxWidth: '400px', textAlign: 'center'}}>
            <Lock size={40} style={{color: '#3b82f6', marginBottom: '20px'}}/>
            <h2 style={{...styles.h2, justifyContent: 'center'}}>MISSION CONTROL ACCESS</h2>
            <form onSubmit={handleLogin}>
              <input 
                style={styles.input} type="text" placeholder="OPERATOR ID" 
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              />
              <input 
                style={styles.input} type="password" placeholder="SECURITY KEY" 
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
              {error && <p style={{color: '#ef4444', fontSize: '10px', marginBottom: '15px'}}>{error}</p>}
              <button style={styles.btn} type="submit">AUTHORIZE ACCESS</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- LOADING VIEW ---
  if (loading && !data) return (
    <div style={styles.wrapper}>
      <div style={{...styles.body, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
        [SYSTEM] DECRYPTING INTELLIGENCE FEED...
      </div>
    </div>
  );
  
  // --- DASHBOARD TERMINAL VIEW ---
  return (
    <div style={styles.wrapper}>
      <div style={styles.body}>
        <div style={styles.container}>
          
          {/* HEADER */}
          <nav style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
            <div style={{ color: '#1e293b' }}>=======================================</div>
            <h1 style={styles.h1}>CORVEX MACRO TERMINAL</h1>
            <div style={{ color: '#1e293b' }}>=======================================</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '10px', color: '#475569', marginTop: '15px' }}>
              <span>BY CAPITALZ INC.</span>
              <span>STATION: MISSION CONTROL</span>
              <span>DATE: {data?.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]}</span>
              <button onClick={fetchDashboard} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <RefreshCw size={10}/> RE-SYNC
              </button>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                LOGOUT
              </button>
            </div>
          </nav>

          {/* SYSTEM CONFIDENCE */}
          <section style={{ ...styles.card, borderLeft: '4px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: '#3b82f6', fontSize: '12px', marginBottom: '5px' }}>🧠 SYSTEM CONFIDENCE</h3>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                STATUS: <span style={data?.confidence >= 7 ? styles.strongBuy : {color: '#fbbf24'}}>
                  {data?.confidence >= 7 ? "HIGH CONVICTION" : "CAUTIOUS"}
                </span>
              </p>
            </div>
            <div style={{ fontSize: '64px', fontWeight: '900' }}>
              {data?.confidence}<span style={{ fontSize: '20px', color: '#1e293b' }}>/10</span>
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* CURRENCY STRENGTH */}
            <section>
              <h2 style={styles.h2}><Activity size={14}/> [ 💱 CURRENCY STRENGTH ]</h2>
              <div style={styles.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>ASSET</th>
                      <th style={styles.tableHeader}>SCORE</th>
                      <th style={styles.tableHeader}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.currencies?.map((c) => (
                      <tr key={c.asset} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '12px 0', fontSize: '16px', fontWeight: '900' }}>{c.asset}</td>
                        <td style={{ padding: '12px 0', fontSize: '16px', fontWeight: 'bold', color: c.score > 0 ? '#4ade80' : '#f87171' }}>{c.score}</td>
                        <td style={{ padding: '12px 0', fontSize: '10px', color: '#94a3b8' }}>{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                {/* INDICES BIAS */}
                <section>
                    <h2 style={styles.h2}><TrendingUp size={14}/> [ 📈 INDICES BIAS ]</h2>
                    <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                        {data?.indices && Object.entries(data.indices).map(([key, info]) => (
                        <div key={key} style={{ ...styles.card, marginBottom: '0px', display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>{key}</span>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '12px' }}>{info.status} ({info.score})</span>
                        </div>
                        ))}
                    </div>
                </section>

                {/* METALS BIAS */}
                <section>
                    <h2 style={styles.h2}><Zap size={14}/> [ 💎 PRECIOUS METALS ]</h2>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {data?.metals && Object.entries(data.metals).map(([key, info]) => (
                        <div key={key} style={{ ...styles.card, marginBottom: '0px', display: 'flex', justifyContent: 'space-between', padding: '15px', borderLeft: '2px solid #64748b' }}>
                            <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase' }}>{key}</span>
                            <span style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '12px' }}>{info.status} ({info.score})</span>
                        </div>
                        ))}
                    </div>
                </section>
            </div>
          </div>

          {/* CURRENCY PAIRS */}
          <section style={{ marginTop: '24px' }}>
            <h2 style={styles.h2}>[ ⚖️ CURRENCY PAIRS BIAS ]</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {data?.pairs?.map((p) => (
                    <div key={p.pair} style={{ ...styles.card, textAlign: 'center', padding: '15px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>{p.pair}</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: p.score > 0 ? '#4ade80' : '#f87171' }}>{p.bias}</div>
                        <div style={{ fontSize: '10px', marginTop: '5px', color: '#3b82f6' }}>DIFF: {p.score}</div>
                    </div>
                ))}
            </div>
          </section>

          {/* TACTICAL ADVICE */}
          <section style={{ ...styles.card, marginTop: '40px', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid #1e293b' }}>
            <h3 style={{ color: '#3b82f6', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Zap size={14}/> TACTICAL ADVICE
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {data?.recommendations?.map((rec, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  <div style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', marginTop: '6px', flexShrink: 0 }}></div>
                  {rec}
                </div>
              ))}
            </div>
          </section>

        </div>
        {/* NEWS & EVENTS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginTop: '24px' }}>
          
          {/* NEWS FEED */}
          <section>
            <h2 style={styles.h2}>[ 📰 LATEST INTELLIGENCE ]</h2>
            <div style={styles.card}>
              {data?.news && data.news.length > 0 ? (
                data.news.map((item, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #1e293b', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      color: item.sentiment > 0 ? '#4ade80' : item.sentiment < 0 ? '#f87171' : '#94a3b8', 
                      marginRight: '10px',
                      fontWeight: 'bold'
                    }}>
                      {item.sentiment > 0 ? '▲' : item.sentiment < 0 ? '▼' : '●'}
                    </span>
                    <span style={{ color: '#e2e8f0' }}>{item.title}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b', fontSize: '12px', padding: '10px' }}>📡 No live headlines detected...</div>
              )}
            </div>
          </section>

          {/* CALENDAR */}
          <section>
            <h2 style={styles.h2}>[ 📅 UPCOMING EVENTS ]</h2>
            <div style={styles.card}>
              {data?.calendar?.map((event, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1e293b', fontSize: '11px' }}>
                  <span style={{ fontWeight: 'bold' }}>{event.event}</span>
                  <span style={{ 
                    color: event.rank === 'CRITICAL' ? '#ff0055' : event.rank === 'HIGH' ? '#fbbf24' : '#3b82f6',
                    fontSize: '9px',
                    border: '1px solid',
                    padding: '2px 5px',
                    borderRadius: '4px'
                  }}>{event.rank}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;