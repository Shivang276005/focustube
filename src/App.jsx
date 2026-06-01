import { useState, useEffect } from 'react'

const COLORS   = ['#FF6B2B','#00C896','#FFD60A','#7C6BFF','#FF5C8D','#00CFFF','#FF9F43','#26de81']
const uid      = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const todayKey = () => new Date().toISOString().slice(0, 10)
const fmtDate  = () => new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })

/* ── tiny progress bar ── */
function PBar({ pct, color, h = 8 }) {
  return (
    <div style={{ background:'#202024', borderRadius:99, height:h, overflow:'hidden' }}>
      <div style={{
        width:`${Math.min(100, Math.max(0, pct))}%`, height:'100%',
        background:color, borderRadius:99,
        transition:'width .6s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  )
}

/* ── pure-SVG stacked bar chart (no external deps) ── */
function BarChart({ data }) {
  const [tip, setTip] = useState(null)
  if (!data.length) return null
  const maxVal = Math.max(...data.map(d => d.total), 1)
  const W = 560, H = 160, PAD_L = 36, PAD_B = 28, PAD_T = 8
  const plotW = W - PAD_L - 12
  const plotH = H - PAD_B - PAD_T
  const barW  = Math.min(36, (plotW / data.length) * 0.55)
  const step  = plotW / data.length
  const yTicks = [0, Math.round(maxVal * 0.5), maxVal]

  return (
    <div style={{ position:'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', display:'block' }}>
        {yTicks.map(t => {
          const y = PAD_T + plotH - (t / maxVal) * plotH
          return (
            <g key={t}>
              <line x1={PAD_L} x2={W - 12} y1={y} y2={y} stroke='#1e1e22' strokeWidth={1} />
              <text x={PAD_L - 6} y={y + 4} textAnchor='end' fontSize={10} fill='#555' fontFamily='Space Mono, monospace'>{t}</text>
            </g>
          )
        })}
        {data.map((d, i) => {
          const cx    = PAD_L + step * i + step / 2
          const x     = cx - barW / 2
          const wH    = (d.watched   / maxVal) * plotH
          const rH    = (d.remaining / maxVal) * plotH
          const totH  = wH + rH
          return (
            <g key={i} style={{ cursor:'pointer' }}
              onMouseEnter={() => setTip({ i, d, cx })}
              onMouseLeave={() => setTip(null)}>
              {rH > 0 && <rect x={x} y={PAD_T + plotH - totH} width={barW} height={rH} fill='#1e1e22' rx={3} />}
              {wH > 0 && <rect x={x} y={PAD_T + plotH - wH}   width={barW} height={wH} fill={d.color} rx={rH > 0 ? 0 : 3} />}
              {totH > 0 && <rect x={x} y={PAD_T + plotH - totH} width={barW} height={Math.min(6, totH)} fill={rH > 0 ? '#1e1e22' : d.color} rx={3} />}
              <text x={cx} y={H - 6} textAnchor='middle' fontSize={10.5} fill='#555' fontFamily='Figtree, system-ui'>{d.name}</text>
            </g>
          )
        })}
      </svg>
      {tip && (
        <div style={{
          position:'absolute', top:4,
          left: (tip.cx / 560 * 100) + '%',
          transform:'translateX(-50%)',
          background:'#1c1c1f', border:'1px solid #2a2a2e',
          borderRadius:8, padding:'6px 10px', fontSize:11.5,
          color:'#fff', pointerEvents:'none', whiteSpace:'nowrap', zIndex:10,
        }}>
          <div style={{ fontWeight:600, marginBottom:2, color:tip.d.color }}>{tip.d.fullName}</div>
          <div>Watched: <strong>{tip.d.watched}</strong></div>
          <div>Remaining: <strong>{tip.d.remaining}</strong></div>
          <div>Progress: <strong>{tip.d.pct}%</strong></div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════ */
export default function App() {
  const [lists,      setLists]      = useState([])
  const [goals,      setGoals]      = useState([])
  const [detailId,   setDetailId]   = useState(null)
  const [showAdd,    setShowAdd]    = useState(false)
  const [ready,      setReady]      = useState(false)
  const [form,       setForm]       = useState({ name:'', url:'', n:'', desc:'' })
  const [goalTxt,    setGoalTxt]    = useState('')
  const [showGoalIn, setShowGoalIn] = useState(false)
  const [vidTxt,     setVidTxt]     = useState('')

  const detail  = lists.find(l => l.id === detailId)
  const getW    = l => l.vids?.length ? l.vids.filter(v => v.w).length : (l.wc || 0)
  const getPct  = l => l.n > 0 ? Math.round(getW(l) / l.n * 100) : 0
  const totN    = lists.reduce((s, l) => s + l.n, 0)
  const totW    = lists.reduce((s, l) => s + getW(l), 0)
  const ovPct   = totN ? Math.round(totW / totN * 100) : 0
  const todayGs = goals.filter(g => g.date === todayKey())
  const doneGs  = todayGs.filter(g => g.done).length

  /* ── localStorage persistence ── */
  useEffect(() => {
    try { const d = localStorage.getItem('ft_lists'); if (d) setLists(JSON.parse(d)) } catch {}
    try { const d = localStorage.getItem('ft_goals'); if (d) setGoals(JSON.parse(d)) } catch {}
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem('ft_lists', JSON.stringify(lists)) } catch {}
  }, [lists, ready])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem('ft_goals', JSON.stringify(goals)) } catch {}
  }, [goals, ready])

  /* ── playlist handlers ── */
  const addList   = () => {
    const n = parseInt(form.n)
    if (!form.name.trim() || isNaN(n) || n < 1) return
    setLists(ls => [...ls, {
      id:uid(), name:form.name.trim(), url:form.url.trim(),
      desc:form.desc.trim(), n, vids:[], wc:0,
      color:COLORS[ls.length % COLORS.length], created:Date.now(),
    }])
    setForm({ name:'', url:'', n:'', desc:'' })
    setShowAdd(false)
  }
  const delList   = id => { setLists(ls => ls.filter(l => l.id !== id)); if (detailId === id) setDetailId(null) }
  const toggleVid = (lid, vid) => setLists(ls => ls.map(l => l.id !== lid ? l : { ...l, vids:l.vids.map(v => v.id === vid ? { ...v, w:!v.w } : v) }))
  const markUpTo  = (lid, i)   => setLists(ls => ls.map(l => l.id !== lid ? l : { ...l, vids:l.vids.map((v, j) => j <= i ? { ...v, w:true } : v) }))
  const addVid    = lid => { if (!vidTxt.trim()) return; setLists(ls => ls.map(l => l.id !== lid ? l : { ...l, vids:[...l.vids, { id:uid(), title:vidTxt.trim(), w:false }] })); setVidTxt('') }
  const removeVid = (lid, vid) => setLists(ls => ls.map(l => l.id !== lid ? l : { ...l, vids:l.vids.filter(v => v.id !== vid) }))
  const setWC     = (lid, val) => setLists(ls => ls.map(x => x.id !== lid ? x : { ...x, wc:Math.min(Math.max(0, parseInt(val) || 0), x.n) }))

  /* ── goal handlers ── */
  const addGoal = () => { if (!goalTxt.trim()) return; setGoals(gs => [...gs, { id:uid(), text:goalTxt.trim(), done:false, date:todayKey() }]); setGoalTxt(''); setShowGoalIn(false) }
  const togGoal = id => setGoals(gs => gs.map(g => g.id === id ? { ...g, done:!g.done } : g))
  const delGoal = id => setGoals(gs => gs.filter(g => g.id !== id))

  const chartData = lists.map(l => ({
    name:      l.name.length > 12 ? l.name.slice(0, 12) + '…' : l.name,
    fullName:  l.name,
    watched:   getW(l),
    remaining: l.n - getW(l),
    total:     l.n,
    pct:       getPct(l),
    color:     l.color,
  }))

  const C = { bg:'#0D0D0F', card:'#161618', border:'#242428', text:'#F5F5F7', muted:'#73737A', accent:'#FF6B2B' }
  const cardStyle = { background:C.card, borderRadius:16, border:`1px solid ${C.border}`, padding:18 }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, color:C.text, fontFamily:"'Figtree',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Figtree:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap');
        .lc{transition:transform .2s,box-shadow .2s;cursor:pointer}
        .lc:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.45)!important}
        .gr:hover .xb{opacity:1!important}
        .vr:hover .xb{opacity:1!important}
        .vr:hover .ub{opacity:1!important}
        @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .fi{animation:fu .25s ease forwards}
        @keyframes sr{from{transform:translateX(104%)}to{transform:none}}
        .si{animation:sr .3s cubic-bezier(.4,0,.2,1) forwards}
        .pbtn{transition:filter .15s,transform .15s;cursor:pointer}
        .pbtn:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .delbtn:hover{color:#ff5050!important}
        @media(max-width:660px){.ml{flex-direction:column!important}.ls{width:100%!important;min-width:0!important}}
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 28px', borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, zIndex:200, background:C.bg+'f2', backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, background:'linear-gradient(135deg,#FF6B2B,#FF3030)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>▶</div>
          <div>
            <div style={{ fontFamily:'Syne', fontSize:20, fontWeight:800, letterSpacing:-.5 }}>Focus<span style={{ color:C.accent }}>Tube</span></div>
            <div style={{ fontSize:10.5, color:C.muted, fontFamily:'Space Mono', marginTop:1 }}>{fmtDate()}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:24 }}>
          {[
            { l:'Overall', v:`${ovPct}%`,                  c:C.accent  },
            { l:'Videos',  v:`${totW}/${totN}`,             c:C.text    },
            { l:'Goals',   v:`${doneGs}/${todayGs.length}`, c:'#00C896' },
          ].map(s => (
            <div key={s.l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Space Mono', fontSize:17, fontWeight:700, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:9.5, color:C.muted, textTransform:'uppercase', letterSpacing:.8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className='ml' style={{ display:'flex', gap:18, padding:'22px 28px', maxWidth:1440, margin:'0 auto' }}>

        {/* ── SIDEBAR ── */}
        <div className='ls' style={{ width:256, minWidth:256, flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>

          {/* Goals */}
          <div style={cardStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:'Syne', fontSize:14.5, fontWeight:700 }}>Today's Goals</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{doneGs}/{todayGs.length} completed</div>
              </div>
              <button onClick={() => setShowGoalIn(v => !v)} style={{ width:26, height:26, borderRadius:8, border:'none', cursor:'pointer', background:showGoalIn?'#2a2a2e':C.accent, color:'#fff', fontSize:17, display:'flex', alignItems:'center', justifyContent:'center', transition:'background .15s' }}>
                {showGoalIn ? '−' : '+'}
              </button>
            </div>
            {todayGs.length > 0 && (
              <div style={{ marginBottom:10 }}>
                <PBar pct={todayGs.length ? Math.round(doneGs / todayGs.length * 100) : 0} color='#00C896' h={5} />
              </div>
            )}
            {showGoalIn && (
              <div style={{ display:'flex', gap:6, marginBottom:10 }} className='fi'>
                <input value={goalTxt} onChange={e => setGoalTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} placeholder='Add a goal…' autoFocus
                  style={{ flex:1, background:'#1e1e22', border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 10px', color:C.text, fontSize:12.5, outline:'none', fontFamily:"'Figtree',system-ui" }} />
                <button onClick={addGoal} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:8, padding:'0 12px', fontWeight:600, fontSize:12.5, cursor:'pointer' }}>+</button>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:260, overflowY:'auto' }}>
              {todayGs.length === 0 && !showGoalIn && (
                <p style={{ fontSize:12, color:C.muted, textAlign:'center', padding:'12px 0' }}>No goals yet — add one!</p>
              )}
              {todayGs.map(g => (
                <div key={g.id} className='gr' style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 10px', background:g.done?'#172520':'#1c1c1f', borderRadius:9, border:`1px solid ${g.done?'#1d3e28':C.border}` }}>
                  <button onClick={() => togGoal(g.id)} style={{ width:17, height:17, minWidth:17, borderRadius:5, marginTop:2, background:g.done?'#00C896':'transparent', border:`2px solid ${g.done?'#00C896':'#3a3a40'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:9.5, transition:'all .15s' }}>{g.done && '✓'}</button>
                  <span style={{ flex:1, fontSize:12.5, lineHeight:1.45, textDecoration:g.done?'line-through':'none', color:g.done?C.muted:C.text, transition:'all .15s' }}>{g.text}</span>
                  <button className='xb' onClick={() => delGoal(g.id)} style={{ background:'none', border:'none', color:'#444', fontSize:15, cursor:'pointer', opacity:0, transition:'opacity .15s', padding:0 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={cardStyle}>
            <div style={{ fontFamily:'Syne', fontSize:14.5, fontWeight:700, marginBottom:12 }}>Stats</div>
            {[
              { l:'Playlists',    v:lists.length,                                 c:C.accent  },
              { l:'Total Videos', v:totN,                                         c:'#FFD60A' },
              { l:'Watched',      v:totW,                                         c:'#00C896' },
              { l:'Remaining',    v:Math.max(0, totN - totW),                     c:'#7C6BFF' },
              { l:'Completed ✓',  v:lists.filter(l => getPct(l) === 100).length,  c:'#FF5C8D' },
            ].map(s => (
              <div key={s.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:12, color:C.muted }}>{s.l}</span>
                <span style={{ fontFamily:'Space Mono', fontSize:15, fontWeight:700, color:s.c }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div>
              <div style={{ fontFamily:'Syne', fontSize:23, fontWeight:800 }}>My Playlists</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{lists.length} playlist{lists.length !== 1 ? 's' : ''} · {totN} videos total</div>
            </div>
            <button className='pbtn' onClick={() => setShowAdd(true)} style={{ background:C.accent, color:'#fff', border:'none', borderRadius:12, padding:'9px 20px', fontSize:13.5, fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
              ＋ Add Playlist
            </button>
          </div>

          {lists.length === 0 ? (
            <div style={{ border:`2px dashed ${C.border}`, borderRadius:18, padding:'56px 28px', textAlign:'center', color:C.muted, background:C.card }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎬</div>
              <div style={{ fontFamily:'Syne', fontSize:19, fontWeight:700, color:C.text, marginBottom:8 }}>No playlists yet</div>
              <div style={{ fontSize:13.5, maxWidth:320, margin:'0 auto', lineHeight:1.65 }}>Add a YouTube playlist and start tracking your learning without getting distracted.</div>
              <button className='pbtn' onClick={() => setShowAdd(true)} style={{ marginTop:20, background:C.accent, color:'#fff', border:'none', borderRadius:12, padding:'11px 26px', fontSize:13.5, fontWeight:600 }}>Get Started →</button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
              {lists.map(l => {
                const w = getW(l), pct = getPct(l)
                return (
                  <div key={l.id} className='lc fi' onClick={() => setDetailId(l.id)} style={{ background:C.card, borderRadius:15, border:`1px solid ${C.border}`, padding:'16px 18px', position:'relative', overflow:'hidden', boxShadow:'0 2px 6px rgba(0,0,0,.25)' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:l.color }} />
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:9 }}>
                      <div style={{ flex:1, paddingRight:8 }}>
                        <div style={{ fontFamily:'Syne', fontSize:15, fontWeight:700, lineHeight:1.3, marginBottom:2 }}>
                          {pct === 100 && <span style={{ color:'#00C896' }}>✓ </span>}{l.name}
                        </div>
                        {l.desc && <div style={{ fontSize:11, color:C.muted, lineHeight:1.4, marginBottom:3 }}>{l.desc}</div>}
                        {l.url && (
                          <a href={l.url} target='_blank' rel='noopener noreferrer' onClick={e => e.stopPropagation()} style={{ fontSize:11, color:l.color, textDecoration:'none' }}>↗ YouTube</a>
                        )}
                      </div>
                      <button className='delbtn' onClick={e => { e.stopPropagation(); delList(l.id) }} style={{ background:'none', border:'none', color:'#383840', fontSize:17, cursor:'pointer', borderRadius:6, width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'color .15s' }}>×</button>
                    </div>
                    <PBar pct={pct} color={l.color} h={7} />
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:7, alignItems:'center' }}>
                      <span style={{ fontSize:11.5, color:C.muted }}>{w} / {l.n} videos</span>
                      <span style={{ fontFamily:'Space Mono', fontSize:16, fontWeight:700, color:pct === 100 ? '#00C896' : l.color }}>{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Chart */}
          {lists.length > 0 && (
            <div style={{ marginTop:22, ...cardStyle }}>
              <div style={{ fontFamily:'Syne', fontSize:16, fontWeight:700, marginBottom:4 }}>Progress Overview</div>
              <div style={{ fontSize:12, color:C.muted, marginBottom:18 }}>Watched (color) vs remaining (dark) per playlist</div>
              <BarChart data={chartData} />
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 18px', marginTop:14 }}>
                {lists.map(l => (
                  <div key={l.id} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:C.muted }}>
                    <span style={{ width:10, height:10, borderRadius:3, background:l.color, flexShrink:0, display:'inline-block' }} />
                    {l.name.length > 20 ? l.name.slice(0, 20) + '…' : l.name} — {getPct(l)}%
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ ADD PLAYLIST MODAL ══ */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.78)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className='fi' style={{ background:'#18181b', border:`1px solid ${C.border}`, borderRadius:20, padding:28, width:'90%', maxWidth:450, boxShadow:'0 24px 64px rgba(0,0,0,.55)' }}>
            <div style={{ fontFamily:'Syne', fontSize:21, fontWeight:800, marginBottom:5 }}>Add Playlist</div>
            <div style={{ fontSize:12.5, color:C.muted, marginBottom:22 }}>Track a new YouTube playlist</div>
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
              {[
                { l:'Name *',                 k:'name', ph:'e.g. "React Complete Guide"',          t:'text'   },
                { l:'YouTube URL (optional)', k:'url',  ph:'https://youtube.com/playlist?list=…',  t:'url'    },
                { l:'Total Videos *',         k:'n',    ph:'e.g. 42',                               t:'number' },
                { l:'Description (optional)', k:'desc', ph:'What is this about?',                  t:'text'   },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize:11.5, color:C.muted, display:'block', marginBottom:5, fontWeight:500 }}>{f.l}</label>
                  <input type={f.t} value={form[f.k]} onChange={e => setForm(v => ({ ...v, [f.k]:e.target.value }))} onKeyDown={e => e.key === 'Enter' && addList()} placeholder={f.ph}
                    style={{ width:'100%', background:'#202024', border:`1px solid ${C.border}`, borderRadius:9, padding:'9px 13px', color:C.text, fontSize:13.5, fontFamily:"'Figtree',system-ui", outline:'none' }} />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:9, marginTop:22 }}>
              <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:'11px', background:'#202024', color:C.muted, border:'none', borderRadius:11, fontSize:13.5, fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button className='pbtn' onClick={addList} style={{ flex:2, padding:'11px', background:C.accent, color:'#fff', border:'none', borderRadius:11, fontSize:13.5, fontWeight:600 }}>Add Playlist</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DETAIL SLIDE-OVER ══ */}
      {detail && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.52)', zIndex:400, backdropFilter:'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setDetailId(null)}>
          <div className='si' style={{ position:'absolute', right:0, top:0, bottom:0, width:'min(500px,96vw)', background:'#101013', borderLeft:`1px solid ${C.border}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Header */}
            <div style={{ padding:'20px 24px 16px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
              <div style={{ height:4, background:detail.color, borderRadius:4, marginBottom:14 }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1, paddingRight:12 }}>
                  <div style={{ fontFamily:'Syne', fontSize:19, fontWeight:800, lineHeight:1.3 }}>{detail.name}</div>
                  {detail.desc && <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>{detail.desc}</div>}
                  {detail.url && (
                    <a href={detail.url} target='_blank' rel='noopener noreferrer' style={{ fontSize:11.5, color:detail.color, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:3, marginTop:4 }}>↗ Open on YouTube</a>
                  )}
                </div>
                <button onClick={() => setDetailId(null)} style={{ background:'#1e1e22', border:'none', color:C.muted, borderRadius:8, width:30, height:30, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
              </div>
              <div style={{ marginTop:12 }}>
                <PBar pct={getPct(detail)} color={detail.color} h={9} />
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                  <span style={{ fontSize:12, color:C.muted }}>{getW(detail)} of {detail.n} videos watched</span>
                  <span style={{ fontFamily:'Space Mono', fontWeight:700, fontSize:13.5, color:detail.color }}>{getPct(detail)}%</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex:1, overflowY:'auto', padding:'18px 24px' }}>

              {/* Count mode */}
              {detail.vids.length === 0 && (
                <div style={{ background:'#1a1a1e', borderRadius:12, padding:16, marginBottom:18 }}>
                  <div style={{ fontSize:12.5, color:C.muted, marginBottom:12, lineHeight:1.55 }}>Quick update — how many videos have you watched so far?</div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <input type='number' min='0' max={detail.n} value={detail.wc || 0} onChange={e => setWC(detail.id, e.target.value)}
                      style={{ width:76, background:'#222226', border:`1px solid ${C.border}`, borderRadius:10, padding:8, color:detail.color, fontSize:26, fontFamily:'Space Mono', fontWeight:700, textAlign:'center', outline:'none' }} />
                    <span style={{ fontSize:13.5, color:C.muted }}>of <strong style={{ color:C.text }}>{detail.n}</strong> videos</span>
                  </div>
                </div>
              )}

              {/* Video list header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ fontFamily:'Syne', fontSize:15, fontWeight:700 }}>Video List</div>
                {detail.vids.length > 1 && (
                  <button onClick={() => {
                    const allDone = detail.vids.every(v => v.w)
                    if (allDone) { setLists(ls => ls.map(l => l.id !== detail.id ? l : { ...l, vids:l.vids.map(v => ({ ...v, w:false })) })) }
                    else { const f = detail.vids.findIndex(v => !v.w); if (f >= 0) markUpTo(detail.id, f) }
                  }} style={{ fontSize:11, color:C.muted, background:'#1e1e22', border:`1px solid ${C.border}`, borderRadius:7, padding:'4px 9px', cursor:'pointer' }}>
                    {detail.vids.every(v => v.w) ? 'Reset All' : '✓ Mark Next'}
                  </button>
                )}
              </div>

              {detail.vids.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
                  {detail.vids.map((v, i) => (
                    <div key={v.id} className='vr' style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 11px', background:v.w?'#182920':'#1a1a1e', borderRadius:9, border:`1px solid ${v.w?'#1e3d28':C.border}`, transition:'all .15s' }}>
                      <button onClick={() => toggleVid(detail.id, v.id)} style={{ width:18, height:18, minWidth:18, borderRadius:5, background:v.w?'#00C896':'transparent', border:`2px solid ${v.w?'#00C896':'#3a3a40'}`, color:'#fff', fontSize:9, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>{v.w && '✓'}</button>
                      <span style={{ fontSize:10.5, color:C.muted, fontFamily:'Space Mono', width:20, flexShrink:0 }}>{String(i + 1).padStart(2, '0')}</span>
                      <span style={{ flex:1, fontSize:12.5, lineHeight:1.4, transition:'all .15s', textDecoration:v.w?'line-through':'none', color:v.w?C.muted:C.text }}>{v.title}</span>
                      <button className='ub' onClick={() => markUpTo(detail.id, i)} title='Mark all above as watched' style={{ fontSize:10, color:detail.color, background:'transparent', border:`1px solid ${detail.color}44`, borderRadius:5, padding:'2px 6px', cursor:'pointer', opacity:0, transition:'opacity .15s', whiteSpace:'nowrap' }}>↑ here</button>
                      <button className='xb' onClick={() => removeVid(detail.id, v.id)} style={{ background:'none', border:'none', color:'#3a3a40', fontSize:15, cursor:'pointer', opacity:0, transition:'opacity .15s', padding:0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add video */}
              <div style={{ display:'flex', gap:7 }}>
                <input value={vidTxt} onChange={e => setVidTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && addVid(detail.id)} placeholder='Add a video title…'
                  style={{ flex:1, background:'#1a1a1e', border:`1px solid ${C.border}`, borderRadius:9, padding:'8px 12px', color:C.text, fontSize:12.5, fontFamily:"'Figtree',system-ui", outline:'none' }} />
                <button onClick={() => addVid(detail.id)} style={{ background:detail.color, color:'#fff', border:'none', borderRadius:9, padding:'0 16px', fontSize:12.5, fontWeight:600, cursor:'pointer' }}>Add</button>
              </div>
              <div style={{ fontSize:11, color:C.muted, marginTop:7, lineHeight:1.55 }}>
                {detail.vids.length === 0
                  ? 'Tip: add individual video titles to track each one, or just use the counter above.'
                  : `${detail.vids.length} named · ${detail.n - detail.vids.length > 0 ? `${detail.n - detail.vids.length} still unnamed` : 'all named'}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
