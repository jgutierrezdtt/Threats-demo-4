import { useState, useEffect } from 'react'
import { MATCHES, SAMPLE_TICKETS, type Match, type Ticket } from '../../data/matches'

type View = 'partidos' | 'detalle' | 'checkout' | 'confirmacion' | 'mis-entradas' | 'socio'

export default function FutbolTab() {
  const [view, setView] = useState<View>('partidos')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [qty, setQty] = useState(1)
  const [step, setStep] = useState(1)
  const [myTickets, setMyTickets] = useState<Ticket[]>(SAMPLE_TICKETS)
  const [purchaseData, setPurchaseData] = useState({ name: '', email: '', card: '', expiry: '', cvv: '' })
  const [processing, setProcessing] = useState(false)
  const [newTicket, setNewTicket] = useState<Ticket | null>(null)

  // VULNERABILIDAD IDOR: el parámetro ?match= carga cualquier partido sin validar membresía
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const matchId = params.get('match')
    if (matchId) {
      const m = MATCHES.find(m => m.id === matchId)
      // No se valida m.sociOnly — acceso directo a partidos restringidos vía URL
      if (m) { setSelectedMatch(m); setView('detalle') }
    }
  }, [])

  const goToDetail = (match: Match) => {
    setSelectedMatch(match)
    setSelectedCategory(0)
    setQty(1)
    setView('detalle')
    const params = new URLSearchParams(window.location.search)
    params.set('match', match.id)
    window.history.replaceState({}, '', `?${params.toString()}`)
  }

  const startCheckout = () => { setStep(1); setView('checkout') }

  const confirmPurchase = async () => {
    if (!selectedMatch) return
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1800))
    const cat = selectedMatch.categories[selectedCategory]
    const ticket: Ticket = {
      id: `TK-2026-${Math.floor(Math.random()*90000)+10000}`,
      matchId: selectedMatch.id,
      match: `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}`,
      date: `${selectedMatch.date} · ${selectedMatch.time}h`,
      stadium: `${selectedMatch.stadium}, ${selectedMatch.city}`,
      seat: `Sec. ${String.fromCharCode(65+Math.floor(Math.random()*12))}${Math.floor(Math.random()*8)+1} · Fila ${Math.floor(Math.random()*20)+1} · Asiento ${Math.floor(Math.random()*30)+1}`,
      category: cat.name,
      price: cat.price * qty,
      buyerEmail: purchaseData.email,
      code: `${selectedMatch.id.replace(/-/g,'').slice(0,6)}-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
      status: 'valid'
    }
    setNewTicket(ticket)
    setMyTickets(prev => [ticket, ...prev])
    setProcessing(false)
    setView('confirmacion')
  }

  const statusBadge = (s: Match['status']) => {
    if (s === 'available')  return <span className="badge badge--success">Entradas disponibles</span>
    if (s === 'almostSold') return <span className="badge badge--warning">Pocas entradas</span>
    return <span className="badge badge--danger">Agotado</span>
  }

  if (view === 'detalle' && selectedMatch) {
    const cat = selectedMatch.categories[selectedCategory]
    return (
      <div style={{ background: '#F9FAFB', minHeight: '100%' }}>
      <div className="hero hero--sm hero--green">
          <div className="container">
            <button className="btn btn--ghost" style={{color:'#fff',marginBottom:'var(--sp-4)'}} onClick={() => { setView('partidos'); const p=new URLSearchParams(window.location.search); p.delete('match'); window.history.replaceState({},'',`?${p.toString()}`) }}>
              ← Volver a partidos
            </button>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="badge badge--neutral">{selectedMatch.competition}</span>
                  {selectedMatch.sociOnly && <span className="badge badge--warning">Exclusivo Socios</span>}
                </div>
                <h1 className="hero-title" style={{marginBottom:'var(--sp-2)'}}>
                  {selectedMatch.homeTeam} <span style={{opacity:.6}}>vs</span> {selectedMatch.awayTeam}
                </h1>
                <p className="hero-subtitle">
                  {new Date(selectedMatch.date).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · {selectedMatch.time}h &nbsp;|&nbsp; {selectedMatch.stadium}, {selectedMatch.city}
                </p>
              </div>
              {statusBadge(selectedMatch.status)}
            </div>
          </div>
        </div>

        <div className="container page">
          <div className="grid-2">
            <div>
              <h2 className="section-title text-base mb-4">Selecciona tu categoría</h2>
              {selectedMatch.categories.map((c, i) => (
                <div key={i} onClick={() => { if(c.available>0) setSelectedCategory(i) }}
                  style={{ padding:'var(--sp-4)', marginBottom:'var(--sp-3)', borderRadius:'var(--r-lg)', cursor: c.available>0?'pointer':'not-allowed',
                    border: selectedCategory===i ? '2px solid var(--c-success)':'1px solid var(--c-border)',
                    background: selectedCategory===i ? '#F0FDF4':'#fff', opacity: c.available===0?.5:1 }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-sm">{c.name}</div>
                      <div className="text-2 text-sm">{c.description}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div className="price-display price-display--primary" style={{fontSize:22}}>{c.price}€</div>
                      <div className="text-xs text-2">{c.available > 0 ? `${c.available} disp.` : 'Agotado'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">Resumen de pedido</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Número de entradas</label>
                  <div className="flex items-center gap-3">
                    <button className="btn btn--outline btn--sm" onClick={() => setQty(q=>Math.max(1,q-1))}>−</button>
                    <span style={{fontSize:20,fontWeight:700,minWidth:32,textAlign:'center'}} className="font-display">{qty}</span>
                    <button className="btn btn--outline btn--sm" onClick={() => setQty(q=>Math.min(8,q+1))}>+</button>
                    <span className="text-sm text-2">(máx. 8 por compra)</span>
                  </div>
                </div>
                <div className="divider" />
                <div className="flex justify-between mb-2"><span className="text-sm text-2">Precio unitario</span><span className="font-semibold">{cat.price}€</span></div>
                <div className="flex justify-between mb-2"><span className="text-sm text-2">Cantidad</span><span className="font-semibold">x{qty}</span></div>
                <div className="flex justify-between mb-4"><span className="text-sm text-2">Gastos de gestión</span><span className="font-semibold">2.50€</span></div>
                <div className="divider" />
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-lg">Total</span>
                  <span className="price-display price-display--lg price-display--primary">{(cat.price*qty+2.5).toFixed(2)}€</span>
                </div>

                <div className="flex items-center gap-2 mb-3 p-4" style={{background:'#EFF6FF',borderRadius:'var(--r-md)'}}>
                  <span></span>
                  <div>
                    <div className="text-sm font-semibold">Comparte el evento</div>
                    <div className="text-xs text-2" style={{marginTop:2,fontFamily:'var(--f-mono)',wordBreak:'break-all'}}>
                      {`${window.location.origin}/?tab=futbol&match=${selectedMatch.id}`}
                    </div>
                  </div>
                  <button className="btn btn--outline btn--sm" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/?tab=futbol&match=${selectedMatch.id}`)}>Copiar</button>
                </div>

                <button className="btn btn--success btn--full btn--lg" onClick={startCheckout} disabled={cat.available===0 || selectedMatch.status==='soldOut'}>
                  {cat.available===0 ? 'Agotado' : 'Proceder al pago →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'checkout') {
    const cat = selectedMatch!.categories[selectedCategory]
    const total = cat.price * qty + 2.5
    return (
      <div className="page">
        <div className="stepper">
          {['Datos personales','Pago','Confirmación'].map((s,i) => (
            <>
              <div key={s} className={`step ${step===i+1?'active':step>i+1?'done':''}`}>
                <div className="step-num">{step>i+1?'':i+1}</div>
                <span className="step-label">{s}</span>
              </div>
              {i<2 && <div key={`line-${i}`} className="step-line"/>}
            </>
          ))}
        </div>

        <div style={{maxWidth:560,margin:'0 auto'}}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">{step===1?'Datos del titular':'Datos de pago'}</span>
            </div>
            <div className="card-body">
              {step === 1 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nombre completo</label>
                    <input className="form-input" placeholder="Ej: Ana García López" value={purchaseData.name} onChange={e=>setPurchaseData(p=>({...p,name:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo electrónico</label>
                    <input className="form-input" type="email" placeholder="tu@correo.es" value={purchaseData.email} onChange={e=>setPurchaseData(p=>({...p,email:e.target.value}))} />
                    <span className="form-hint">La entrada se enviará a este correo</span>
                  </div>
                  <button className="btn btn--success btn--full" onClick={() => setStep(2)} disabled={!purchaseData.name || !purchaseData.email}>Continuar →</button>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="alert alert--info mb-4"><span className="alert-icon"></span>Pago seguro con cifrado SSL. Aceptamos Visa, Mastercard y American Express.</div>
                  <div className="form-group">
                    <label className="form-label">Número de tarjeta</label>
                    <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19} value={purchaseData.card} onChange={e=>setPurchaseData(p=>({...p,card:e.target.value}))} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Caducidad</label>
                      <input className="form-input" placeholder="MM/AA" maxLength={5} value={purchaseData.expiry} onChange={e=>setPurchaseData(p=>({...p,expiry:e.target.value}))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input className="form-input" placeholder="123" maxLength={3} value={purchaseData.cvv} onChange={e=>setPurchaseData(p=>({...p,cvv:e.target.value}))} />
                    </div>
                  </div>
                  <div className="divider"/>
                  <div className="flex justify-between mb-4"><span className="font-bold">Total a pagar</span><span style={{fontFamily:'var(--f-display)',fontSize:22,fontWeight:800,color:'#16A34A'}}>{total.toFixed(2)}€</span></div>
                  <div className="flex gap-3">
                    <button className="btn btn--outline" onClick={() => setStep(1)}>← Atrás</button>
                    <button className="btn btn--success" style={{flex:1}} onClick={confirmPurchase} disabled={processing||!purchaseData.card||!purchaseData.expiry||!purchaseData.cvv}>
                      {processing ? <><span className="spinner"/>&nbsp;Procesando...</> : `Pagar ${total.toFixed(2)}€`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'confirmacion' && newTicket) {
    return (
      <div className="page" style={{maxWidth:600,margin:'0 auto'}}>
        <div className="alert alert--success mb-6"><div><strong>¡Compra completada!</strong> Tu entrada ha sido procesada correctamente.</div></div>
        <div className="ticket-card">
          <div className="flex justify-between items-start">
            <div>
              <div style={{fontSize:12,opacity:.6,marginBottom:4}}>ENTRADA · {newTicket.category.toUpperCase()}</div>
              <div style={{fontFamily:'var(--f-display)',fontSize:20,fontWeight:700}}>{newTicket.match}</div>
              <div style={{fontSize:13,opacity:.75,marginTop:4}}>{newTicket.date}</div>
              <div style={{fontSize:13,opacity:.75}}>️ {newTicket.stadium}</div>
            </div>
            <div style={{fontSize:40}}></div>
          </div>
          <div className="ticket-stub">
            <div className="flex justify-between">
              <div><div style={{fontSize:10,opacity:.5}}>ASIENTO</div><div style={{fontWeight:700}}>{newTicket.seat}</div></div>
              <div style={{textAlign:'right'}}><div style={{fontSize:10,opacity:.5}}>PRECIO</div><div style={{fontWeight:700,fontSize:18}}>{newTicket.price}€</div></div>
            </div>
            <div className="mt-4" style={{fontFamily:'var(--f-mono)',fontSize:11,opacity:.6,textAlign:'center',letterSpacing:3}}>{newTicket.code}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button className="btn btn--outline" onClick={() => { setView('mis-entradas') }}>Ver mis entradas</button>
          <button className="btn btn--dark" onClick={() => { setView('partidos'); const p=new URLSearchParams(window.location.search); p.delete('match'); window.history.replaceState({},'',`?${p.toString()}`) }}>Ver más partidos</button>
        </div>
      </div>
    )
  }

  if (view === 'mis-entradas') {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="section-title" style={{marginBottom:0}}>Mis entradas</h1>
          <button className="btn btn--outline" onClick={() => setView('partidos')}>← Partidos</button>
        </div>
        {myTickets.length === 0
          ? <div className="empty-state"><div className="empty-icon"></div><div className="empty-title">No tienes entradas</div><div className="empty-desc">Compra tu primera entrada y aparecerá aquí.</div></div>
          : <div style={{display:'grid',gap:'var(--sp-4)',maxWidth:680}}>
            {myTickets.map(t => (
              <div key={t.id} className="ticket-card">
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{fontSize:11,opacity:.5,marginBottom:2}}>{t.id} · <span style={{textTransform:'uppercase'}}>{t.status}</span></div>
                    <div style={{fontFamily:'var(--f-display)',fontSize:17,fontWeight:700}}>{t.match}</div>
                    <div style={{fontSize:13,opacity:.75,marginTop:3}}>{t.date}</div>
                    <div style={{fontSize:13,opacity:.75}}>️ {t.stadium}</div>
                    <div style={{fontSize:13,opacity:.75}}> {t.seat} — <strong>{t.category}</strong></div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:22,fontWeight:800}}>{t.price}€</div>
                    <span className={`badge badge--${t.status==='valid'?'success':t.status==='used'?'neutral':'danger'}`}>{t.status}</span>
                  </div>
                </div>
                <div className="ticket-stub">
                  <div style={{fontFamily:'var(--f-mono)',fontSize:11,opacity:.5,textAlign:'center',letterSpacing:2}}>{t.code}</div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    )
  }

  // Vista principal: lista de partidos
  const upcoming = MATCHES.filter(m => m.status !== 'soldOut')

  return (
    <div>
      <div className="hero hero--sm" style={{background:'linear-gradient(135deg,#14532D,#16A34A)'}}>
        <div className="container">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="hero-title" style={{fontSize:28}}>Venta de Entradas Oficial</h1>
              <p className="hero-subtitle" style={{fontSize:14}}>Compra tus entradas para los mejores partidos de la temporada 2025-2026</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn--outline" style={{color:'#fff',borderColor:'rgba(255,255,255,.3)'}} onClick={() => setView('mis-entradas')}>Mis entradas ({myTickets.length})</button>
              <button className="btn" style={{background:'#fff',color:'#16A34A',fontWeight:700}} onClick={() => setView('socio')}> Área Socios</button>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="flex items-center gap-3 mb-6">
          <span className="badge badge--success" style={{fontSize:13,padding:'4px 12px'}}>TEMPORADA 2025-26</span>
          <span className="text-sm text-2">Mostrando {MATCHES.length} eventos · Actualizado {new Date().toLocaleDateString('es-ES')}</span>
        </div>

        <h2 className="section-title" style={{fontSize:18}}>Próximos partidos</h2>
        <div style={{display:'grid',gap:'var(--sp-4)',marginBottom:'var(--sp-8)'}}>
          {upcoming.map(m => (
            <div key={m.id} className={`match-card${m.sociOnly?' match-card--locked':''}`}
              onClick={() => { if (!m.sociOnly) goToDetail(m) }}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'var(--sp-3)', cursor: m.sociOnly ? 'default' : 'pointer' }}
            >
              <div style={{flex:1,minWidth:240}}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{fontSize:11,color:'var(--c-text-2)',background:'var(--c-bg)',padding:'2px 8px',borderRadius:'var(--r-full)'}}>{m.competition}</span>
                  {m.sociOnly && <span className="badge badge--warning">Solo Socios</span>}
                  {statusBadge(m.status)}
                </div>
                <div style={{fontFamily:'var(--f-display)',fontSize:17,fontWeight:700}}>
                  {m.homeShield} {m.homeTeam} <span style={{color:'var(--c-text-2)',fontWeight:400}}>vs</span> {m.awayTeam} {m.awayShield}
                </div>
                <div className="text-sm text-2 mt-1">{new Date(m.date).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})} · {m.time}h &nbsp;|&nbsp; ️ {m.stadium}, {m.city}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:11,color:'var(--c-text-2)',marginBottom:4}}>desde</div>
                <div style={{fontFamily:'var(--f-display)',fontSize:22,fontWeight:800,color: m.sociOnly ? 'var(--c-text-2)' : '#16A34A'}}>{Math.min(...m.categories.map(c=>c.price))}€</div>
                {m.sociOnly
                  ? <button className="btn btn--outline btn--sm mt-2" onClick={e => { e.stopPropagation(); setView('socio') }}>Acceso socios →</button>
                  : <button className="btn btn--success btn--sm mt-2" onClick={e => { e.stopPropagation(); goToDetail(m) }}>Comprar →</button>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
