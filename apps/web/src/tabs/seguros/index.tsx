import { useState } from 'react'
import { INSURANCE_PRODUCTS, PROMO_CODES, SAMPLE_POLICIES, SAMPLE_CLAIMS, type InsuranceProduct, type Policy, type Claim } from '../../data/insurance'

type View = 'catalogo' | 'cotizador' | 'mi-poliza' | 'siniestros'

interface QuoteState {
  product: InsuranceProduct | null
  age: number
  smoker: boolean
  addOns: Record<string, boolean>
  promoInput: string
  appliedCodes: { code: string; discount: number }[]
  step: 'config' | 'resultado'
}

const CATEGORY_LABELS: Record<string, string> = {
  salud:'Salud', hogar:'Hogar', auto:'Auto', vida:'Vida', dental:'Dental'
}
const CATEGORY_COLORS: Record<string, string> = {
  salud:'#8B5CF6', hogar:'#16A34A', auto:'#3B82F6', vida:'#DC2626', dental:'#06B6D4'
}

export default function SegurosTab() {
  const [view, setView] = useState<View>('catalogo')
  const [quote, setQuote] = useState<QuoteState>({
    product: null, age: 35, smoker: false, addOns: {}, promoInput: '', appliedCodes: [], step: 'config'
  })
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')
  const [policies] = useState<Policy[]>(SAMPLE_POLICIES)
  const [claims] = useState<Claim[]>(SAMPLE_CLAIMS)
  const [newClaim, setNewClaim] = useState({ policyId: '', description: '', type: '' })
  const [claimSent, setClaimSent] = useState(false)

  const startQuote = (product: InsuranceProduct) => {
    setQuote({ product, age: 35, smoker: false, addOns: {}, promoInput: '', appliedCodes: [], step: 'config' })
    setPromoError(''); setPromoSuccess('')
    setView('cotizador')
  }

  const calcPrice = () => {
    if (!quote.product) return 0
    let base = quote.product.basePrice
    // Factor edad
    if (quote.age >= 55) base *= 1.4
    else if (quote.age >= 40) base *= 1.2
    else if (quote.age < 25) base *= 0.9
    // Factor fumador
    if (quote.smoker) base *= 1.25
    // Add-ons
    quote.product.addOns?.forEach(ao => {
      if (quote.addOns[ao.id]) base += ao.price
    })
    // Descuentos acumulativos sin límite
    const totalDiscount = quote.appliedCodes.reduce((acc, c) => acc + c.discount, 0)
    base = base * (1 - totalDiscount / 100)
    return Math.max(base, 0)
  }

  const applyPromo = () => {
    const code = quote.promoInput.toUpperCase().trim()
    if (!code) return
    if (quote.appliedCodes.some(c => c.code === code)) {
      setPromoError('Ese código ya está aplicado')
      return
    }
    const promo = PROMO_CODES[code]
    if (!promo) {
      setPromoError('Código promocional no válido')
      setPromoSuccess('')
      return
    }
    setQuote(q => ({
      ...q,
      appliedCodes: [...q.appliedCodes, { code, discount: promo.discount }],
      promoInput: ''
    }))
    setPromoError('')
    setPromoSuccess(`¡Código «${code}» aplicado! −${promo.discount}% de descuento adicional`)
  }

  const totalDiscount = quote.appliedCodes.reduce((a, c) => a + c.discount, 0)
  const finalPrice = calcPrice()

  const renderContent = () => {
    switch (view) {
      case 'catalogo': return (
        <div>
          <div className="hero hero--sm hero--purple">
            <div className="container">
              <h1 className="hero-title hero-title--sm">Seguros MAPFRE Digital</h1>
              <p className="hero-subtitle">Encuentra la protección que necesitas con los mejores precios</p>
            </div>
          </div>
          <div className="page">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span className="badge badge--purple">CATÁLOGO 2026</span>
              <span className="text-sm text-2">{INSURANCE_PRODUCTS.length} productos disponibles</span>
            </div>
            <div className="grid-3">
              {INSURANCE_PRODUCTS.map(p => (
                <div key={p.id} className="product-card">
                  <div className="product-card-accent" style={{background:CATEGORY_COLORS[p.category]||'var(--c-secondary)'}}/>
                  <div className="product-card-body">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="badge badge--neutral text-xs">{CATEGORY_LABELS[p.category]||p.category}</span>
                        <div className="font-display font-bold text-lg mt-2">{p.name}</div>
                        <div className="text-sm text-2">{p.description}</div>
                      </div>
                      <div style={{textAlign:'right',flexShrink:0,marginLeft:'var(--sp-3)'}}>
                        <div className="price-display price-display--lg price-display--purple">{p.basePrice}€</div>
                        <div className="text-xs text-2">/ mes</div>
                      </div>
                    </div>
                    <ul className="list-none mb-4">
                      {p.coverages.slice(0,3).map(c=><li key={c} className="text-sm py-1">{c}</li>)}
                    </ul>
                    <div className="flex gap-2">
                      <button className="btn btn--secondary btn--sm btn--full" onClick={()=>startQuote(p)}>Calcular precio</button>
                      <button className="btn btn--outline btn--sm">Más info</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

      case 'cotizador': {
        if (!quote.product) return <div className="page"><div className="alert alert--info">Selecciona un producto del catálogo.</div></div>
        const p = quote.product

        if (quote.step === 'resultado') return (
          <div className="page" style={{maxWidth:680}}>
            <button className="btn btn--ghost text-sm mb-6" onClick={()=>setQuote(q=>({...q,step:'config'}))}>← Volver a configurar</button>
            <div className="card mb-6">
              <div className="card-header card-header--purple">
                <span className="card-title">Cotización personalizada — {p.name}</span>
                <span className="badge badge--neutral">Válida 48h</span>
              </div>
              <div className="card-body">
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-2">Precio base</span><span className="font-semibold">{p.basePrice.toFixed(2)}€/mes</span>
                </div>
                {quote.age >= 55 && <div className="flex justify-between mb-3"><span className="text-sm text-2">Recargo por edad</span><span className="font-semibold text-warning">+40%</span></div>}
                {quote.age >= 40 && quote.age < 55 && <div className="flex justify-between mb-3"><span className="text-sm text-2">Recargo por edad</span><span className="font-semibold text-warning">+20%</span></div>}
                {quote.smoker && <div className="flex justify-between mb-3"><span className="text-sm text-2">Recargo fumador</span><span className="font-semibold text-warning">+25%</span></div>}
                {p.addOns?.filter(ao=>quote.addOns[ao.id]).map(ao=>(
                  <div key={ao.id} className="flex justify-between mb-3"><span className="text-sm text-2">+ {ao.name}</span><span className="font-semibold">+{ao.price.toFixed(2)}€</span></div>
                ))}
                <div className="divider"/>
                {quote.appliedCodes.map(c=>(
                  <div key={c.code} className="flex justify-between mb-2">
                    <span className="text-sm font-mono text-success">{c.code}</span>
                    <span className="font-semibold text-success">−{c.discount}%</span>
                  </div>
                ))}
                {totalDiscount > 0 && (
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-success">Descuento total aplicado</span>
                    <span className="font-bold text-success">−{totalDiscount}%</span>
                  </div>
                )}
                <div className="divider"/>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Precio final/mes</span>
                  <span className="price-display price-display--lg price-display--purple">{finalPrice.toFixed(2)}€</span>
                </div>
                {totalDiscount > 50 && (
                  <div className="alert alert--warning mt-4"><span className="alert-icon"></span>Descuento acumulado: {totalDiscount}%. ¡Precio especial aplicado!</div>
                )}
              </div>
            </div>

            <div className="card mb-6">
              <div className="card-header"><span className="card-title">Añadir código adicional</span></div>
              <div className="card-body">
                <div className="flex gap-3 mb-2">
                  <input className="form-input" placeholder="Ej: VERANO26, NUEVO50, VIP2026..." value={quote.promoInput} onChange={e=>setQuote(q=>({...q,promoInput:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&applyPromo()} />
                  <button className="btn btn--secondary" onClick={applyPromo}>Aplicar</button>
                </div>
                {promoError && <p className="text-sm text-danger">{promoError}</p>}
                {promoSuccess && <p className="text-sm text-success">{promoSuccess}</p>}
                <p className="form-hint">Códigos disponibles: VERANO26 · NUEVO50 · VIP2026 · FAMILIA · ONLINE10 · FIDELIDAD · EMPLEADO40</p>
              </div>
            </div>

            <button className="btn btn--secondary btn--full btn--lg">Contratar ahora — {finalPrice.toFixed(2)}€/mes</button>
          </div>
        )

        return (
          <div className="page" style={{maxWidth:680}}>
            <button className="btn btn--ghost text-sm mb-6" onClick={()=>setView('catalogo')}>← Catálogo</button>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Configurar cotización — {p.name}</span>
                <span className="price-display price-display--purple" style={{fontSize:22}}>{p.basePrice}€/mes base</span>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Edad del asegurado principal: <strong>{quote.age} años</strong></label>
                  <input type="range" className="form-range" min={18} max={80} value={quote.age} onChange={e=>setQuote(q=>({...q,age:+e.target.value}))} />
                  <div className="flex justify-between text-xs text-2"><span>18</span><span>80</span></div>
                </div>

                {(p.category === 'salud' || p.category === 'vida') && (
                  <div className="form-group">
                    <label className="form-label flex items-center gap-3">
                      <input type="checkbox" checked={quote.smoker} onChange={e=>setQuote(q=>({...q,smoker:e.target.checked}))} style={{width:16,height:16}} />
                      Fumador habitual (+25% prima)
                    </label>
                  </div>
                )}

                {p.addOns && p.addOns.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Coberturas adicionales</label>
                    {p.addOns.map(ao=>(
                      <label key={ao.id} className="flex items-center gap-3 mb-2" style={{cursor:'pointer'}}>
                        <input type="checkbox" checked={!!quote.addOns[ao.id]} onChange={e=>setQuote(q=>({...q,addOns:{...q.addOns,[ao.id]:e.target.checked}}))} style={{width:16,height:16}} />
                        <span className="text-sm"><strong>{ao.name}</strong> — +{ao.price}€/mes</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Código promocional</label>
                  <div className="flex gap-3">
                    <input className="form-input" placeholder="Ej: VERANO26" value={quote.promoInput} onChange={e=>setQuote(q=>({...q,promoInput:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&applyPromo()} />
                    <button className="btn btn--outline" onClick={applyPromo}>Aplicar</button>
                  </div>
                  {promoError && <p className="text-sm mt-1 text-danger">{promoError}</p>}
                  {promoSuccess && <p className="text-sm mt-1 text-success">{promoSuccess}</p>}
                  {quote.appliedCodes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {quote.appliedCodes.map(c=><span key={c.code} className="tag tag--success">{c.code} −{c.discount}%</span>)}
                    </div>
                  )}
                </div>

                <div className="divider"/>
                <div className="flex justify-between items-center mb-5">
                  <span className="font-bold text-lg">Estimación mensual</span>
                  <span className="price-display price-display--lg price-display--purple">{finalPrice.toFixed(2)}€</span>
                </div>
                <button className="btn btn--secondary btn--full btn--lg" onClick={()=>setQuote(q=>({...q,step:'resultado'}))}>Ver cotización detallada →</button>
              </div>
            </div>
          </div>
        )
      }

      case 'mi-poliza': return (
        <div className="page">
          <h1 className="section-title">Mis Pólizas</h1>
          {policies.map(pol=>(
            <div key={pol.id} className="card mb-5">
              <div className="card-header">
                <div>
                  <span className="font-mono text-sm" style={{color:'var(--c-text-2)'}}>{pol.id}</span>
                  <div className="font-bold text-lg mt-1">{pol.productName}</div>
                </div>
                <span className={`badge badge--${pol.status==='activa'?'success':pol.status==='tramitacion'?'warning':'danger'}`}>{pol.status}</span>
              </div>
              <div className="card-body">
                <div className="grid-4 mb-4">
                  {[
                    {l:'Prima mensual',v:`${pol.monthlyPremium}€`},
                    {l:'Vigencia desde',v:pol.startDate},
                    {l:'Renovación',v:pol.endDate},
                    {l:'Forma de pago',v:pol.paymentMode},
                  ].map(f=><div key={f.l}><div className="text-xs text-2">{f.l}</div><div className="font-semibold">{f.v}</div></div>)}
                </div>
                <details>
                  <summary className="btn btn--ghost btn--sm" style={{cursor:'pointer',listStyle:'none'}}>Modificar datos de póliza</summary>
                  <div className="mt-4">
                    <div className="alert alert--warning mb-4"><span className="alert-icon"></span>Puedes modificar la fecha de inicio y modalidad de pago de tu póliza activa.</div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Fecha de inicio</label>
                        <input type="date" className="form-input" defaultValue={pol.startDate} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Modalidad de pago</label>
                        <select className="form-select" defaultValue={pol.paymentMode}>
                          <option>Mensual</option><option>Trimestral</option><option>Semestral</option><option>Anual</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn btn--secondary btn--sm">Guardar cambios</button>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )

      case 'siniestros': return (
        <div className="page">
          <h1 className="section-title">Gestión de Siniestros</h1>
          <div className="grid-2">
            <div>
              <h2 className="section-title" style={{fontSize:16}}>Siniestros abiertos</h2>
              {claims.map(c=>(
                <div key={c.id} className="card mb-4">
                  <div className="card-body">
                    <div className="flex justify-between mb-2">
                      <span className="font-mono text-sm">{c.id}</span>
                      <span className={`badge badge--${c.status==='en_revision'?'warning':c.status==='aprobado'||c.status==='pagado'?'success':'neutral'}`}>{c.status}</span>
                    </div>
                    <div className="font-semibold">{c.description}</div>
                    <div className="text-sm text-2 mt-1">Póliza: {c.policyId} · Fecha: {c.date}</div>
                    <div className="text-sm font-semibold mt-2" style={{color:'var(--c-danger)'}}>Importe solicitado: {c.amount}€</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="section-title" style={{fontSize:16}}>Declarar nuevo siniestro</h2>
              {claimSent
                ? <div className="alert alert--success">Siniestro registrado. Recibirá confirmación en 24-48h hábiles.</div>
                : <div className="card">
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Póliza afectada</label>
                      <select className="form-select" value={newClaim.policyId} onChange={e=>setNewClaim(n=>({...n,policyId:e.target.value}))}>
                        <option value="">Selecciona póliza...</option>
                        {policies.map(p=><option key={p.id} value={p.id}>{p.id} — {p.product}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tipo de siniestro</label>
                      <select className="form-select" value={newClaim.type} onChange={e=>setNewClaim(n=>({...n,type:e.target.value}))}>
                        <option value="">Selecciona tipo...</option>
                        <option>Hospitalización</option><option>Daño material</option><option>Accidente de tráfico</option><option>Robo</option><option>Fallecimiento</option><option>Consulta médica</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción</label>
                      <textarea className="form-textarea" placeholder="Describe el siniestro ocurrido..." rows={4} value={newClaim.description} onChange={e=>setNewClaim(n=>({...n,description:e.target.value}))} />
                    </div>
                    <button className="btn btn--secondary btn--full" disabled={!newClaim.policyId||!newClaim.type||!newClaim.description} onClick={()=>setClaimSent(true)}>Enviar declaración</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="layout-sidebar">
      <aside className="sidebar">
        <div className="sidebar-label">MAPFRE Digital</div>
        {([
          {v:'catalogo',l:'Catálogo'},
          {v:'cotizador',l:'Nueva Cotización'},
          {v:'mi-poliza',l:'Mis Pólizas'},
          {v:'siniestros',l:'Siniestros'},
        ] as {v:View,l:string}[]).map(({v,l})=>(
          <div key={v} className={`sidebar-nav-item${view===v?' active':''}`} onClick={()=>setView(v)}>
            {l}
          </div>
        ))}
        <div className="sidebar-section" style={{padding:'var(--sp-4) var(--sp-3)',marginTop:'auto'}}>
          <div className="text-xs text-2">Nº Cliente</div>
          <div className="font-mono text-sm">CLI-2026-00847</div>
          <div className="text-xs text-2 mt-1">Carlos García Ruiz</div>
        </div>
      </aside>
      <div style={{flex:1,overflowY:'auto'}}>
        {renderContent()}
      </div>
    </div>
  )
}
