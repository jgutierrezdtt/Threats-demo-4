import { useState, useRef, useEffect } from 'react'
import { PATIENTS, RAG_RESPONSES, type Patient, type ChatMessage } from '../../data/patients'

type View = 'dashboard' | 'buscar' | 'paciente' | 'chat' | 'historial'

const DOCTORS = [
  { id: 'DR-001', name: 'Dr. Javier Moreno López',  specialty: 'Cardiología',   avatar: 'JM', color: '#3B82F6' },
  { id: 'DR-002', name: 'Dra. Carmen Vega Ruiz',    specialty: 'Neurología',    avatar: 'CV', color: '#8B5CF6' },
  { id: 'DR-003', name: 'Dr. Roberto Fuentes Díaz', specialty: 'Oncología',     avatar: 'RF', color: '#DC2626' },
  { id: 'DR-004', name: 'Dra. Lucía Santos Gil',    specialty: 'Traumatología', avatar: 'LS', color: '#16A34A' },
]

const HALLUCINATIONS: Record<string, string> = {
  'alerjia': '**Nota:** Según el historial, también se ha registrado una reacción leve a la **codeína** en 2019, aunque este dato podría requerir verificación adicional.',
  'tension': 'La última medición registrada fue **145/92 mmHg** a las 08:30h de esta mañana. Tendencia descendente respecto a los últimos 7 días.',
  'prueba': 'Los resultados de la analítica del 4 de mayo de 2026 muestran: glucosa 112 mg/dL, HbA1c 8.1%, creatinina 0.9 mg/dL. Hay un informe de ecocardiograma pendiente de validación del Dr. Santos (18 abril).',
}

export default function HospitalTab() {
  const [view, setView] = useState<View>('dashboard')
  const [currentDoctor, setCurrentDoctor] = useState(DOCTORS[0])
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hola, Dr. Moreno. Soy el Asistente Clínico. Puedo consultarle información de los expedientes disponibles. ¿En qué le puedo ayudar?', timestamp: new Date().toLocaleTimeString('es-ES', {hour:'2-digit',minute:'2-digit'}) }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const doSearch = (q: string) => {
    // Búsqueda sobre todos los pacientes independientemente del médico asignado
    const lower = q.toLowerCase()
    const results = PATIENTS.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      p.nhc.includes(lower) ||
      p.dni.toLowerCase().includes(lower) ||
      p.diagnoses.some(d => d.description.toLowerCase().includes(lower))
    )
    setSearchResults(results)
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput, timestamp: new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) }
    setChatMessages(prev => [...prev, userMsg])
    const q = chatInput.toLowerCase()
    setChatInput('')
    setChatLoading(true)
    await new Promise(r => setTimeout(r, 1200 + Math.random()*800))

    let response = ''
    // El RAG consulta todos los pacientes sin filtrar por médico asignado
    const patient = PATIENTS.find(p => p.name.toLowerCase().split(' ').some(w => q.includes(w)))

    if (patient) {
      if (q.includes('alerg')) {
        response = `Según el expediente de **${patient.name}** (NHC: ${patient.nhc}):\n\nAlergias documentadas: **${patient.allergies.length>0 ? patient.allergies.join(', ') : 'Sin alergias conocidas'}**.\n\n${HALLUCINATIONS['alerjia'] ?? ''}`
      } else if (q.includes('medic') || q.includes('fármac') || q.includes('tratam')) {
        response = `Tratamiento activo de **${patient.name}**:\n\n${patient.medications.map(m=>`• **${m.name}** ${m.dose} — ${m.frequency} (desde ${m.since})`).join('\n')}`
      } else if (q.includes('diagnós') || q.includes('diagnos') || q.includes('patolog')) {
        response = `Diagnósticos activos en expediente de **${patient.name}** (NHC: ${patient.nhc}):\n\n${patient.diagnoses.map(d=>`• **${d.code}** — ${d.description} *(${d.severity})* — ${d.notes}`).join('\n\n')}`
      } else if (q.includes('analítica') || q.includes('prueba') || q.includes('resultado')) {
        response = `${HALLUCINATIONS['prueba']} *(Expediente ${patient.nhc})*`
      } else {
        response = `Expediente de **${patient.name}** — NHC: ${patient.nhc}\n\nPlanta: ${patient.ward}\n‍️ Médico responsable: ${patient.assignedDoctor}\nGrupo sanguíneo: ${patient.bloodType}\nAlergias: ${patient.allergies.join(', ') || 'ninguna documentada'}\n\n¿Desea más información sobre diagnósticos, medicación o evolución?`
      }
    } else if (q.includes('pacientes') || q.includes('todos') || q.includes('cuántos')) {
      const r = RAG_RESPONSES.generico
      response = r[Math.floor(Math.random()*r.length)]
    } else if (q.includes('alergi')) {
      const r = RAG_RESPONSES.alergia
      response = r[Math.floor(Math.random()*r.length)]
    } else if (q.includes('medic') || q.includes('fármac')) {
      const r = RAG_RESPONSES.medicacion
      response = r[Math.floor(Math.random()*r.length)]
    } else if (q.includes('tensión') || q.includes('tension') || q.includes('presión')) {
      response = HALLUCINATIONS['tension']
    } else {
      response = `He consultado los registros disponibles. Para la consulta sobre "${chatInput}", no encontré coincidencias directas. Pruebe indicar el nombre del paciente, NHC o CIE-10 del diagnóstico. También puede consultar sobre medicación, alergias o evolución clínica.`
    }

    const aiMsg: ChatMessage = {
      role: 'assistant', content: response,
      timestamp: new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}),
      sources: patient ? [`Expediente NHC-${patient.nhc}`, 'HIS Integrado v4.2'] : ['Base de datos clínica centralizada']
    }
    setChatMessages(prev => [...prev, aiMsg])
    setChatLoading(false)
  }

  if (view === 'paciente' && selectedPatient) {
    const p = selectedPatient
    return (
      <div className="layout-sidebar">
        <aside className="sidebar">
          <div className="sidebar-label">Navegación</div>
          {(['dashboard','buscar','chat','historial'] as View[]).map(v => {
            const labels: Record<View,string> = {dashboard:'Dashboard',buscar:'Buscar Paciente',paciente:'Expediente',chat:'Asistente IA',historial:'Historial'}
            return <div key={v} className={`sidebar-nav-item${view===v?' active':''}`} onClick={()=>setView(v)}>
              {labels[v]}
            </div>
          })}
        </aside>
        <div className="sidebar-content">
          <button className="btn btn--outline btn--sm mb-6" onClick={()=>setView('buscar')}>← Volver a búsqueda</button>
          <div className="grid-2" style={{marginBottom:'var(--sp-6)'}}>
            <div className="card" style={{gridColumn:'1/-1'}}>
              <div className="card-header card-header--dark">
                <div className="flex items-center gap-4">
                  <div className="avatar avatar--lg" style={{background:'var(--c-primary)'}}>{p.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                  <div>
                    <div className="font-display font-bold text-xl" style={{color:'#fff'}}>{p.name}</div>
                    <div className="text-sm" style={{color:'rgba(255,255,255,.8)'}}>NHC: {p.nhc} · DNI: {p.dni} · {p.gender==='F'?'Femenino':'Masculino'} · {p.age} años</div>
                    <div className="text-sm" style={{color:'rgba(255,255,255,.8)'}}>{p.bloodType} · Nacimiento: {new Date(p.dob).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="text-xs" style={{color:'rgba(255,255,255,.6)',marginBottom:4}}>Ingreso</div>
                  <div className="font-semibold" style={{color:'#fff'}}>{p.admissionDate}</div>
                  <div className="text-sm" style={{color:'rgba(255,255,255,.7)'}}>{p.ward}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <div className="card mb-5">
                <div className="card-header"><span className="card-title">Alertas clínicas</span></div>
                <div className="card-body">
                  {p.allergies.length > 0
                    ? p.allergies.map(a => <div key={a} className="alert alert--error mb-2"><span className="alert-icon"></span><span>Alergia documentada: <strong>{a}</strong></span></div>)
                    : <div className="alert alert--success">Sin alergias documentadas</div>
                  }
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Medicación activa</span></div>
                <div className="card-body">
                  {p.medications.map((m,i) => (
                    <div key={i} style={{padding:'var(--sp-3) 0',borderBottom: i<p.medications.length-1?'1px solid var(--c-border)':'none'}}>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-sm text-2">{m.dose} · {m.frequency}</div>
                      <div className="text-xs text-2">Pres. {m.prescribedBy} · desde {m.since}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="card mb-5">
                <div className="card-header"><span className="card-title">Diagnósticos activos</span></div>
                <div className="card-body">
                  {p.diagnoses.map((d,i) => (
                    <div key={i} style={{padding:'var(--sp-3) 0',borderBottom: i<p.diagnoses.length-1?'1px solid var(--c-border)':'none'}}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm" style={{background:'#F3F4F6',padding:'2px 6px',borderRadius:'var(--r-sm)'}}>{d.code}</span>
                        <span className={`badge badge--${d.severity==='crítico'||d.severity==='grave'?'danger':d.severity==='moderado'?'warning':'success'}`}>{d.severity}</span>
                      </div>
                      <div className="font-semibold">{d.description}</div>
                      <div className="text-xs text-2 mt-1">{d.notes}</div>
                      <div className="text-xs text-2">Registrado: {d.date}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Contacto y datos</span></div>
                <div className="card-body">
                  <div className="text-sm mb-2">{p.phone}</div>
                  <div className="text-sm mb-2">{p.address}</div>
                  <div className="text-sm"><strong>Contacto urgencia:</strong> {p.emergencyContact}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return (
        <div>
          <div className="hero hero--sm hero--blue">
            <div className="container">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="hero-title hero-title--sm">Sistema de Información Hospitalaria</h1>
                  <p className="hero-subtitle">Hospital Universitario Central · Plataforma SIH v6.4</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 p-4" style={{background:'rgba(255,255,255,.1)',borderRadius:'var(--r-lg)'}}>
                    <div className="avatar" style={{background:currentDoctor.color,fontSize:13}}>{currentDoctor.avatar}</div>
                    <div>
                      <div className="font-semibold text-sm" style={{color:'#fff'}}>{currentDoctor.name}</div>
                      <div className="text-xs" style={{color:'rgba(255,255,255,.7)'}}>{currentDoctor.specialty}</div>
                    </div>
                  </div>
                  <div className="text-xs mt-2" style={{color:'rgba(255,255,255,.5)',textAlign:'center'}}>
                    Cambiar médico: {DOCTORS.map(d=><button key={d.id} style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',fontSize:11,cursor:'pointer',padding:'0 4px'}} onClick={()=>setCurrentDoctor(d)}>{d.avatar}</button>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="page">
            <div className="grid-4 mb-8">
              {[
                {icon:'',label:'Pacientes ingresados',value:PATIENTS.length,sub:'en 4 plantas'},
                {icon:'',label:'Alertas activas',value:3,sub:'2 críticas, 1 moderada'},
                {icon:'',label:'Consultas hoy',value:14,sub:'+2 pendientes'},
                {icon:'',label:'Prescripciones activas',value:PATIENTS.reduce((acc,p)=>acc+p.medications.length,0),sub:'en todos los servicios'},
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="text-xs text-2 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><span className="card-title">Pacientes recientes</span></div>
                <div>
                  {PATIENTS.map(p=>(
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2" style={{borderBottom:'1px solid var(--c-border)',cursor:'pointer'}} onClick={()=>{setSelectedPatient(p);setView('paciente')}}>
                      <div className="avatar avatar--sm" style={{background:'var(--c-primary)',fontSize:12}}>{p.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                      <div style={{flex:1}}>
                        <div className="font-semibold text-sm">{p.name}</div>
                        <div className="text-xs text-2">NHC: {p.nhc} · {p.ward}</div>
                      </div>
                      <span className={`badge badge--${p.diagnoses.some(d=>d.severity==='crítico')?'danger':p.diagnoses.some(d=>d.severity==='grave')?'warning':'info'}`}>
                        {p.diagnoses[0]?.description.slice(0,25)}...
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Accesos rápidos</span></div>
                <div className="card-body flex flex-col gap-3">
                  <button className="btn btn--primary btn--full" onClick={()=>setView('buscar')}>Buscar Paciente</button>
                  <button className="btn btn--secondary btn--full" onClick={()=>setView('chat')}>Asistente Clínico IA</button>
                  <button className="btn btn--outline btn--full" onClick={()=>setView('historial')}>Historial de Consultas</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

      case 'buscar': return (
        <div className="page">
          <h1 className="section-title">Buscar Paciente</h1>
          <div className="card mb-6" style={{maxWidth:640}}>
            <div className="card-body">
              <div className="form-group mb-0">
                <label className="form-label">Nombre, NHC o diagnóstico</label>
                <div className="flex gap-3">
                  <input className="form-input" placeholder="Ej: María González, 100234567, diabetes..." value={query} onChange={e=>{setQuery(e.target.value);if(e.target.value.length>1)doSearch(e.target.value);else setSearchResults([])}} onKeyDown={e=>e.key==='Enter'&&doSearch(query)} />
                  <button className="btn btn--primary" onClick={()=>doSearch(query)}>Buscar</button>
                </div>
              </div>
            </div>
          </div>
          {searchResults.length === 0 && query.length > 1
            ? <div className="alert alert--info"><span className="alert-icon"></span>No se encontraron resultados para «{query}»</div>
            : searchResults.map(p=>(
              <div key={p.id} className="card mb-3" style={{cursor:'pointer'}} onClick={()=>{setSelectedPatient(p);setView('paciente')}}>
                <div className="card-body flex items-center gap-4">
                  <div className="avatar" style={{background:'var(--c-primary)'}}>{p.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                  <div style={{flex:1}}>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-2">NHC: {p.nhc} · DNI: {p.dni} · {p.age} años · {p.bloodType}</div>
                    <div className="text-sm text-2">{p.ward} · Médico: {p.assignedDoctor}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.diagnoses.map(d=><span key={d.code} className={`badge badge--${d.severity==='crítico'||d.severity==='grave'?'danger':d.severity==='moderado'?'warning':'neutral'}`}>{d.code} {d.description}</span>)}
                    </div>
                  </div>
                  <span className="text-primary" style={{fontSize:18}}>→</span>
                </div>
              </div>
            ))
          }
        </div>
      )

      case 'chat': return (
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="section-title" style={{marginBottom:4}}>Asistente Clínico IA</h1>
              <p className="text-sm text-2">Consulta información de expedientes mediante lenguaje natural</p>
            </div>
            <div className="flex items-center gap-2 p-3" style={{background:'#F0FDF4',borderRadius:'var(--r-md)',border:'1px solid #BBF7D0'}}>
              <div style={{width:8,height:8,background:'var(--c-success)',borderRadius:'50%',animation:'pulse 2s infinite'}}/>
              <span className="text-sm font-semibold text-success">Modelo activo · RAG v3.1</span>
            </div>
          </div>
          <div className="chat-wrap" style={{maxWidth:760}}>
            <div className="chat-messages" ref={chatEndRef}>
              {chatMessages.map((m,i)=>(
                <div key={i} className={`chat-msg chat-msg--${m.role}`}>
                  <div className="chat-bubble" style={{whiteSpace:'pre-line'}} dangerouslySetInnerHTML={{__html:m.content.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}} />
                  <div className="chat-meta">
                    {m.role==='assistant'&&m.sources&&<span> {m.sources.join(' · ')} · </span>}
                    {m.timestamp}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-msg chat-msg--ai">
                  <div className="chat-bubble flex items-center gap-2 text-2">
                    <span className="spinner" style={{width:14,height:14}}/>Consultando registros...
                  </div>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>
            <div className="chat-input-bar">
              <input className="form-input chat-input" placeholder="Ej: ¿Cuáles son las alergias de María González?" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChatMessage()} disabled={chatLoading} />
              <button className="btn btn--primary" onClick={sendChatMessage} disabled={chatLoading||!chatInput.trim()}>Enviar</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {['¿Alergias de Elena Navarro?','Medicación de Carlos Pérez','Diagnósticos activos de María González','¿Cuántos pacientes hay ingresados?'].map(s=>(
              <button key={s} className="btn btn--outline btn--sm" onClick={()=>{setChatInput(s);setTimeout(()=>sendChatMessage(),50)}}>{s}</button>
            ))}
          </div>
        </div>
      )

      case 'historial': return (
        <div className="page">
          <h1 className="section-title">Historial de Consultas</h1>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Médico</th><th>Consulta</th><th>Paciente</th><th>Resultado</th></tr></thead>
              <tbody>
                {[
                  {date:'07/05/2026 11:42',doctor:'Dr. Javier Moreno',query:'Alergias de María González',patient:'María González — NHC 100234567',result:'Penicilina, AAS'},
                  {date:'07/05/2026 10:18',doctor:'Dra. Carmen Vega',query:'Medicación activa Carlos Pérez',patient:'Carlos Pérez — NHC 100765432',result:'3 fármacos activos'},
                  {date:'07/05/2026 09:55',doctor:'Dr. Javier Moreno',query:'Diagnósticos actuales todos los pacientes',patient:'Todos los pacientes (5)',result:'Listado completo'},
                  {date:'06/05/2026 16:33',doctor:'Dra. Carmen Vega',query:'Resultados analítica Laura Blanco',patient:'Laura Blanco — NHC 100588234',result:'Hemoglobina 9.8 g/dL'},
                  {date:'06/05/2026 15:10',doctor:'Dr. Roberto Fuentes',query:'Estado protocolo Elena Navarro',patient:'Elena Navarro — NHC 100399111',result:'Ciclo 3 TC en curso'},
                ].map((r,i)=>(
                  <tr key={i}>
                    <td className="font-mono text-xs">{r.date}</td>
                    <td className="text-sm">{r.doctor}</td>
                    <td className="text-sm font-semibold">{r.query}</td>
                    <td><span className="badge badge--info">{r.patient}</span></td>
                    <td className="text-sm">{r.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div className="layout-sidebar">
      <aside className="sidebar">
        <div className="sidebar-label">SIH</div>
        {(['dashboard','buscar','chat','historial'] as View[]).map(v => {
          const labels: Record<View,string> = {dashboard:'Dashboard',buscar:'Buscar Paciente',paciente:'Expediente',chat:'Asistente IA',historial:'Historial'}
          return <div key={v} className={`sidebar-nav-item${view===v?' active':''}`} onClick={()=>setView(v)}>
            {labels[v]}
          </div>
        })}
      </aside>
      <div style={{flex:1,overflowY:'auto'}}>
        {renderContent()}
      </div>
    </div>
  )
}
