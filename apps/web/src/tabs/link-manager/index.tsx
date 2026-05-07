import { useState, useRef } from 'react'
import { ALL_USER_LINKS, AI_SUGGESTIONS, ANALYTICS_DATA, type LinkPost } from '../../data/links'

type View = 'perfil' | 'mis-links' | 'ia' | 'analytics'

const CURRENT_USER_ID = 'user-me'

export default function LinkManagerTab() {
  const [view, setView] = useState<View>('perfil')
  const [links, setLinks] = useState<LinkPost[]>(ALL_USER_LINKS)
  const [editingLink, setEditingLink] = useState<LinkPost | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '', category: 'trabajo', tags: '', isPublic: true })
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiModel, setAiModel] = useState<'gemma'|'fallback'|null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const deleteLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id))

  const saveLink = () => {
    if (editingLink) {
      setLinks(prev => prev.map(l => l.id === editingLink.id ? { ...editingLink } : l))
      setEditingLink(null)
    } else {
      const created: LinkPost = {
        id: `link-${Date.now()}`,
        userId: CURRENT_USER_ID,
        title: newLink.title,
        url: newLink.url,
        description: '',
        category: newLink.category as LinkPost['category'],
        tags: newLink.tags.split(',').map(t=>t.trim()).filter(Boolean),
        clicks: 0,
        isPublic: newLink.isPublic,
        aiSuggested: false,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }
      setLinks(prev => [created, ...prev])
      setNewLink({ title:'', url:'', category:'trabajo', tags:'', isPublic:true })
    }
    setShowForm(false)
  }

  const copyLink = (url: string, id: string) => {
    navigator.clipboard?.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const askAI = async () => {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    setAiResponse(null)
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemma2:2b', prompt: `Eres un asistente de gestión de contenido. ${aiQuery}`, stream: false }),
        signal: AbortSignal.timeout(3000)
      })
      const data = await res.json()
      setAiResponse(data.response)
      setAiModel('gemma')
    } catch {
      await new Promise(r => setTimeout(r, 900))
      const suggestion = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)]
      setAiResponse(`**${suggestion.title}**\n\n${suggestion.description}\n\nCategoría sugerida: *${suggestion.category}*\nEtiquetas recomendadas: ${suggestion.tags.join(', ')}`)
      setAiModel('fallback')
    }
    setAiLoading(false)
  }

  const categoryColor: Record<string, string> = {
    trabajo: '#3B82F6', aprendizaje: '#8B5CF6', noticias: '#F59E0B', entretenimiento: '#EC4899', herramienta: '#16A34A', personal: '#6B7280'
  }

  const renderContent = () => {
    switch (view) {
      case 'perfil': return (
        <div>
          <div className="hero hero--sm" style={{background:'linear-gradient(135deg,#831843,#BE185D)'}}>
            <div className="container flex items-center gap-6 flex-wrap">
              <div className="avatar" style={{width:72,height:72,fontSize:24,background:'rgba(255,255,255,.2)',flexShrink:0}}>AE</div>
              <div>
                <h1 className="hero-title hero-title--sm" style={{marginBottom:4}}>Alejandro Estévez</h1>
                <p className="hero-subtitle" style={{fontSize:13}}>@alejandro_e · Ingeniero de Software · Madrid</p>
                <div className="flex gap-3 mt-3">
                  {[{l:'Links',v:links.filter(l=>l.userId===CURRENT_USER_ID).length},{l:'Clicks',v:ANALYTICS_DATA.totalClicks},{l:'Sugerencias IA',v:AI_SUGGESTIONS.length}].map(s=>(
                    <div key={s.l} style={{textAlign:'center'}}>
                      <div className="price-display" style={{fontSize:22}}>{s.v}</div>
                      <div className="text-xs" style={{opacity:.7}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="page">
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><span className="card-title">Mi página pública</span></div>
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-4" style={{background:'#FDF2F8',padding:'var(--sp-3) var(--sp-4)',borderRadius:'var(--r-md)'}}>
                    <span></span>
                    <div className="font-mono text-sm" style={{color:'#BE185D'}}>linkme.io/alejandro_e</div>
                    <button className="btn btn--sm btn--outline" style={{marginLeft:'auto'}}>Abrir</button>
                  </div>
                  <div className="flex justify-between text-sm mb-2"><span className="text-2">Links publicados</span><span className="font-semibold">{links.filter(l=>l.isPublic&&l.userId===CURRENT_USER_ID).length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-2">Vistas totales esta semana</span><span className="font-semibold">{ANALYTICS_DATA.weeklyClicks[ANALYTICS_DATA.weeklyClicks.length-1].clicks}</span></div>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Acciones rápidas</span></div>
                <div className="card-body flex flex-col gap-3">
                  <button className="btn btn--pink btn--full" onClick={()=>{setView('mis-links');setShowForm(true)}}>Añadir nuevo link</button>
                  <button className="btn btn--outline btn--full" onClick={()=>setView('ia')}>Sugerencias IA</button>
                  <button className="btn btn--outline btn--full" onClick={()=>setView('analytics')}>Ver Analytics</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

      case 'mis-links': return (
        <div className="page">
          <div className="page-header">
              <h1 className="section-title text-base mb-0">Mis Links</h1>
            <button className="btn btn--pink" onClick={()=>{setShowForm(true);setEditingLink(null)}}>Nuevo link</button>
          </div>

          {showForm && (
            <div className="card mb-6" ref={formRef} style={{maxWidth:560}}>
              <div className="card-header"><span className="card-title">{editingLink?'Editar link':'Añadir link'}</span><button className="btn btn--ghost btn--sm" onClick={()=>{setShowForm(false);setEditingLink(null)}}></button></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input className="form-input" placeholder="Nombre del enlace" value={editingLink?.title??newLink.title} onChange={e=>editingLink?setEditingLink({...editingLink,title:e.target.value}):setNewLink(n=>({...n,title:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">URL</label>
                  <input className="form-input" placeholder="https://..." value={editingLink?.url??newLink.url} onChange={e=>editingLink?setEditingLink({...editingLink,url:e.target.value}):setNewLink(n=>({...n,url:e.target.value}))} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Categoría</label>
                    <select className="form-select" value={editingLink?.category??newLink.category} onChange={e=>editingLink?setEditingLink({...editingLink,category:e.target.value as LinkPost['category']}):setNewLink(n=>({...n,category:e.target.value}))}>
                      {Object.keys(categoryColor).map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Etiquetas (coma)</label>
                    <input className="form-input" placeholder="react, frontend..." value={editingLink?.tags.join(',')??(newLink.tags)} onChange={e=>editingLink?setEditingLink({...editingLink,tags:e.target.value.split(',').map(t=>t.trim())}):setNewLink(n=>({...n,tags:e.target.value}))} />
                  </div>
                </div>
                <label className="flex items-center gap-2 mb-4" style={{cursor:'pointer'}}>
                  <input type="checkbox" checked={editingLink?.isPublic??newLink.isPublic} onChange={e=>editingLink?setEditingLink({...editingLink,isPublic:e.target.checked}):setNewLink(n=>({...n,isPublic:e.target.checked}))} />
                  <span className="text-sm">Visible en mi página pública</span>
                </label>
                <div className="flex gap-3">
                  <button className="btn btn--pink" onClick={saveLink}>Guardar</button>
                  <button className="btn btn--ghost" onClick={()=>{setShowForm(false);setEditingLink(null)}}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <div style={{display:'grid',gap:'var(--sp-3)'}}>
            {links.map(link => (
              <div key={link.id} className="card" style={{borderLeft:`3px solid ${categoryColor[link.category]||'#6B7280'}`}}>
                <div className="card-body flex items-start gap-4">
                  <div style={{flex:1,minWidth:0}}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold">{link.title}</span>
                      {link.aiSuggested && <span className="badge badge--purple text-xs">IA</span>}
                      {!link.isPublic && <span className="badge badge--neutral text-xs">Privado</span>}
                      {link.userId !== CURRENT_USER_ID && <span className="badge badge--warning text-xs">Usuario: {link.userId}</span>}
                    </div>
                    <div className="font-mono text-xs text-2 mb-2" style={{wordBreak:'break-all'}}>{link.url}</div>
                    <div className="flex flex-wrap gap-2">
                      <span style={{fontSize:11,background:categoryColor[link.category]||'#6B7280',color:'#fff',padding:'2px 8px',borderRadius:'var(--r-full)'}}>{link.category}</span>
                      {link.tags.map(t=><span key={t} className="tag tag--neutral text-xs">{t}</span>)}
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div className="text-sm font-semibold mb-3">{link.clicks}</div>
                    <div className="flex gap-2">
                      <button className="btn btn--sm btn--outline" onClick={()=>copyLink(link.url,link.id)}>{copied===link.id?'':'Copiar'}</button>
                      <button className="btn btn--sm btn--outline" onClick={()=>{setEditingLink(link);setShowForm(true)}}></button>
                      <button className="btn btn--sm btn--outline" style={{color:'var(--c-danger)',borderColor:'var(--c-danger)'}} onClick={()=>deleteLink(link.id)}></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

      case 'ia': return (
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="section-title" style={{marginBottom:4}}>Asistente IA de Contenido</h1>
              <div className="flex items-center gap-2">
                <div style={{width:8,height:8,background: aiModel==='gemma'?'var(--c-success)':'var(--c-warning)',borderRadius:'50%'}}/>
                <span className="text-xs text-2">{aiModel==='gemma'?'Gemma 2:2b (Ollama local)':aiModel==='fallback'?'Modo offline — reglas estáticas':'Esperando consulta'}</span>
              </div>
            </div>
          </div>

          <div className="card mb-6" style={{maxWidth:680}}>
            <div className="card-body">
              <div className="form-group mb-3">
                <label className="form-label">¿Sobre qué necesitas sugerencias?</label>
                <textarea className="form-textarea" rows={3} placeholder="Ej: Necesito links sobre inteligencia artificial para mi trabajo de ingeniero..." value={aiQuery} onChange={e=>setAiQuery(e.target.value)} />
              </div>
              <button className="btn btn--pink" onClick={askAI} disabled={aiLoading||!aiQuery.trim()}>
                {aiLoading ? <><span className="spinner" style={{width:14,height:14}}/>&nbsp;Consultando IA...</> : 'Pedir sugerencia'}
              </button>
            </div>
          </div>

          {aiResponse && (
            <div className="card mb-6" style={{maxWidth:680,border:'1px solid #FBCFE8'}}>
              <div className="card-header" style={{background:'#FDF2F8'}}>
                <span className="card-title" style={{color:'#BE185D'}}>Respuesta del asistente</span>
                <span className="badge badge--pink text-xs">{aiModel==='gemma'?'Gemma local':'Modo offline'}</span>
              </div>
              <div className="card-body">
                <div style={{whiteSpace:'pre-line'}} dangerouslySetInnerHTML={{__html:aiResponse.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>')}} />
              </div>
            </div>
          )}

          <h2 className="section-title" style={{fontSize:16}}>Sugerencias predefinidas</h2>
          <div className="grid-2">
            {AI_SUGGESTIONS.map(s=>(
              <div key={s.id} className="card" style={{border:'1px dashed var(--c-border)'}}>
                <div className="card-body">
                  <div className="font-semibold mb-1">{s.title}</div>
                  <div className="text-sm text-2 mb-3">{s.description}</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {s.tags.map(t=><span key={t} className="tag tag--neutral text-xs">{t}</span>)}
                  </div>
                  <button className="btn btn--sm btn--outline" style={{color:'#BE185D',borderColor:'#FBCFE8'}} onClick={()=>{setLinks(prev=>[{id:`link-${Date.now()}`,userId:CURRENT_USER_ID,title:s.title,url:s.url,description:s.description,category:s.category as LinkPost['category'],tags:s.tags,clicks:0,isPublic:true,aiSuggested:true,createdAt:new Date().toISOString().split('T')[0],updatedAt:new Date().toISOString().split('T')[0]},...prev]);setView('mis-links')}}>
                    + Añadir a mi lista
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

      case 'analytics': return (
        <div className="page">
          <h1 className="section-title">Analytics</h1>
          <div className="grid-4 mb-8">
            {[
              {l:'Clicks totales',v:ANALYTICS_DATA.totalClicks},
              {l:'Visitantes únicos',v:ANALYTICS_DATA.uniqueVisitors},
              {l:'CTR medio',v:ANALYTICS_DATA.ctr+'%'},
              {l:'Links activos',v:links.filter(l=>l.isPublic).length},
            ].map(s=>(
              <div key={s.l} className="stat-card">
                <div className="stat-value">{s.v}</div>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">Clicks últimas semanas</span></div>
              <div className="card-body">
                {ANALYTICS_DATA.weeklyClicks.map((w,i)=>(
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-2" style={{minWidth:60}}>{w.week}</span>
                    <div style={{flex:1,background:'#F3F4F6',borderRadius:'var(--r-full)',height:10,overflow:'hidden'}}>
                      <div style={{height:'100%',background:'#EC4899',borderRadius:'var(--r-full)',width:`${(w.clicks/ANALYTICS_DATA.totalClicks*100*3).toFixed(0)}%`,transition:'width .3s'}}/>
                    </div>
                    <span className="font-semibold text-sm">{w.clicks}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card mb-4">
                <div className="card-header"><span className="card-title">Top fuentes</span></div>
                <div className="card-body">
                  {ANALYTICS_DATA.sources.map(s=>(
                    <div key={s.name} className="flex items-center gap-3 mb-2">
                      <span className="text-sm" style={{minWidth:80}}>{s.name}</span>
                      <div style={{flex:1,background:'#F3F4F6',borderRadius:'var(--r-full)',height:8}}>
                        <div style={{height:'100%',background:'#8B5CF6',borderRadius:'var(--r-full)',width:`${s.pct}%`}}/>
                      </div>
                      <span className="text-xs text-2">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Top países</span></div>
                <div className="card-body">
                  {ANALYTICS_DATA.countries.map(c=>(
                    <div key={c.country} className="flex justify-between text-sm mb-2">
                      <span>{c.flag} {c.country}</span><span className="font-semibold">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
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
        <div className="sidebar-label">LinkMe</div>
        {([
          {v:'perfil',l:'Mi Perfil'},
          {v:'mis-links',l:'Mis Links'},
          {v:'ia',l:'Asistente IA'},
          {v:'analytics',l:'Analytics'},
        ] as {v:View,l:string}[]).map(({v,l})=>(
          <div key={v} className={`sidebar-nav-item${view===v?' active':''}`} onClick={()=>setView(v)}>
            {l}
          </div>
        ))}
      </aside>
      <div style={{flex:1,overflowY:'auto'}}>
        {renderContent()}
      </div>
    </div>
  )
}
