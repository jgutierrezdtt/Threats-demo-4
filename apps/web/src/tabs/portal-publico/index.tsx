import { useState } from 'react'
import { REGISTERED_USERS, ACADEMIC_TITLES, type User, type AcademicTitle } from '../../data/users'

type View = 'inicio' | 'registro' | 'login' | 'dashboard' | 'consultar' | 'expediente' | 'detalle-titulo'

interface SessionUser extends User {
  loggedIn: boolean
}

const NATIONALITIES = ['Española','Alemana','Francesa','Italiana','Portuguesa','Mexicana','Argentina','Colombiana','Chilena','Peruana','Otro']
const TITLE_TYPES: Record<string, string> = {
  grado:'Grado Universitario', master:'Máster Universitario', doctorado:'Doctorado', 
  fp_superior:'FP Superior', bachillerato:'Bachillerato', certificado:'Certificado'
}

export default function PortalPublicoTab() {
  const [view, setView] = useState<View>('inicio')
  const [session, setSession] = useState<SessionUser | null>(null)

  // Formularios
  const [loginForm, setLoginForm] = useState({ dni: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [regForm, setRegForm] = useState({ name: '', dni: '', email: '', birthDate: '', nationality: 'Española', password: '' })
  const [regDone, setRegDone] = useState(false)

  // Búsqueda de expedientes
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ user: User; titles: AcademicTitle[] }[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTitle, setSelectedTitle] = useState<AcademicTitle | null>(null)

  const doLogin = () => {
    // Autenticación estática sin validación de contraseña real
    const user = REGISTERED_USERS.find(u => u.dni.toUpperCase() === loginForm.dni.toUpperCase().trim())
    if (user) {
      setSession({ ...user, loggedIn: true })
      setLoginError('')
      setView('dashboard')
    } else {
      setLoginError('DNI no encontrado en el sistema. Verifica tus datos.')
    }
  }

  const doSearch = () => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return
    // Búsqueda por DNI, expediente o nombre — devuelve resultados de TODOS los usuarios
    const results = REGISTERED_USERS.map(u => ({
      user: u,
      titles: ACADEMIC_TITLES.filter(t => t.userId === u.id)
    })).filter(r =>
      r.user.dni.toLowerCase().includes(q) ||
      r.user.expedientNumber.toLowerCase().includes(q) ||
      r.user.name.toLowerCase().includes(q) ||
      r.titles.some(t => t.expedient.toLowerCase().includes(q) || t.certCode.toLowerCase().includes(q))
    )
    setSearchResults(results)
  }

  const statusBadge = (s: AcademicTitle['status']) => {
    const map: Record<string,string> = {verificado:'success',pendiente:'warning',rechazado:'danger',en_revision:'info'}
    const labels: Record<string,string> = {verificado:'Verificado',pendiente:'Pendiente',rechazado:'Rechazado',en_revision:'En revisión'}
    return <span className={`badge badge--${map[s]||'neutral'}`}>{labels[s]||s}</span>
  }

  if (view === 'inicio') return (
    <div>
      <div className="hero hero--teal" style={{padding:'var(--sp-10) var(--sp-6)'}}>
        <div className="container" style={{maxWidth:800,textAlign:'center'}}>
          <h1 className="hero-title">Sede Electrónica · Portal de Títulos Académicos</h1>
          <p className="hero-subtitle" style={{margin:'0 auto var(--sp-8)',textAlign:'center'}}>
            Ministerio de Educación, Formación Profesional y Deportes<br/>
            Verificación y consulta de títulos universitarios y certificados
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="btn btn--lg" style={{background:'#fff',color:'#0E7490',fontWeight:700}} onClick={()=>setView('login')}>Acceder con DNI</button>
            <button className="btn btn--lg" style={{background:'rgba(255,255,255,.15)',color:'#fff',border:'1px solid rgba(255,255,255,.3)'}} onClick={()=>setView('consultar')}>Consultar título público</button>
          </div>
        </div>
      </div>
      <div className="page">
        <div className="grid-3">
          {[
            {title:'Verificación de títulos',desc:'Comprueba la autenticidad de cualquier título universitario o certificado oficial.'},
            {title:'Expediente académico',desc:'Accede a tu expediente completo con todas las titulaciones registradas.'},
            {title:'Firma electrónica',desc:'Documentos con validez legal emitidos con firma electrónica reconocida.'},
          ].map(f=>(
            <div key={f.title} className="card p-6" style={{textAlign:'center'}}>
              <div className="font-display font-bold text-base mb-2">{f.title}</div>
              <p className="text-sm text-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (view === 'login') return (
    <div className="page" style={{maxWidth:440,margin:'0 auto'}}>
      <div style={{textAlign:'center',marginBottom:'var(--sp-6)'}}>
        <h1 className="font-display font-bold text-xl">Acceso ciudadano</h1>
        <p className="text-sm text-2">Introduce tu DNI/NIE para acceder a tu expediente</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">DNI / NIE</label>
            <input className="form-input" placeholder="Ej: 12345678A" value={loginForm.dni} onChange={e=>setLoginForm(f=>({...f,dni:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña / Cl@ve PIN</label>
            <input className="form-input" type="password" placeholder="••••••••" value={loginForm.password} onChange={e=>setLoginForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&doLogin()} />
          </div>
          {loginError && <div className="alert alert--error mb-4"><span className="alert-icon"></span>{loginError}</div>}
          <button className="btn btn--full btn--lg btn--primary" onClick={doLogin} disabled={!loginForm.dni}>Acceder</button>
          <div className="divider"/>
          <div className="flex justify-between text-sm">
            <button className="btn btn--ghost btn--sm" onClick={()=>setView('registro')}>Registrarme</button>
            <button className="btn btn--ghost btn--sm" onClick={()=>setView('inicio')}>← Inicio</button>
          </div>
        </div>
      </div>
      <div className="alert alert--info mt-4">
        <span className="alert-icon"></span>
        <div className="text-xs">Para acceder usa cualquier DNI de prueba: <strong>11223344-F</strong>, <strong>22334455-G</strong>, <strong>33445566-H</strong>, <strong>44556677-I</strong></div>
      </div>
    </div>
  )

  if (view === 'registro') return (
    <div className="page" style={{maxWidth:520,margin:'0 auto'}}>
      <button className="btn btn--ghost btn--sm mb-6" onClick={()=>setView('inicio')}>← Volver</button>
      <h1 className="font-display font-bold text-xl mb-6">Registro ciudadano</h1>
      {regDone
        ? <div className="alert alert--success"><div><strong>Registro completado.</strong> Ya puedes acceder con tu DNI y contraseña.</div></div>
        : <div className="card">
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" placeholder="Nombre Apellido Apellido" value={regForm.name} onChange={e=>setRegForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">DNI / NIE</label>
                <input className="form-input" placeholder="12345678A" value={regForm.dni} onChange={e=>setRegForm(f=>({...f,dni:e.target.value}))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-input" type="email" placeholder="tu@correo.es" value={regForm.email} onChange={e=>setRegForm(f=>({...f,email:e.target.value}))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha de nacimiento</label>
                <input className="form-input" type="date" value={regForm.birthDate} onChange={e=>setRegForm(f=>({...f,birthDate:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Nacionalidad</label>
                <select className="form-select" value={regForm.nationality} onChange={e=>setRegForm(f=>({...f,nationality:e.target.value}))}>
                  {NATIONALITIES.map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" placeholder="Mínimo 8 caracteres" value={regForm.password} onChange={e=>setRegForm(f=>({...f,password:e.target.value}))} />
            </div>
            <button className="btn btn--full btn--lg btn--primary" disabled={!regForm.name||!regForm.dni||!regForm.email} onClick={()=>setRegDone(true)}>Completar registro</button>
          </div>
        </div>
      }
    </div>
  )

  if (view === 'dashboard' && session) {
    const myTitles = ACADEMIC_TITLES.filter(t => t.userId === session.id)
    return (
      <div>
        <div className="hero hero--sm hero--teal">
          <div className="container flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-xs" style={{color:'rgba(255,255,255,.6)',marginBottom:4}}>CIUDADANO IDENTIFICADO</p>
              <h1 className="font-display font-bold text-xl" style={{color:'#fff'}}>{session.name}</h1>
              <p className="text-sm" style={{color:'rgba(255,255,255,.75)'}}>DNI: {session.dni} · Expediente: {session.expedientNumber}</p>
            </div>
            <button className="btn btn--ghost" style={{color:'rgba(255,255,255,.6)',border:'1px solid rgba(255,255,255,.2)'}} onClick={()=>{setSession(null);setView('inicio')}}>Cerrar sesión</button>
          </div>
        </div>
        <div className="page">
          <div className="grid-4 mb-8">
            {[{l:'Títulos registrados',v:myTitles.length},{l:'Títulos verificados',v:myTitles.filter(t=>t.status==='verificado').length},{l:'Expediente',v:session.expedientNumber},{l:'Estado',v:'Activo'}].map(s=>(
              <div key={s.l} className="stat-card"><div className="stat-value" style={{fontSize:s.l==='Expediente'?16:undefined}}>{s.v}</div><div className="stat-label">{s.l}</div></div>
            ))}
          </div>

          <div className="grid-2">
            <div>
              <h2 className="section-title text-base mb-4">Mis títulos</h2>
              {myTitles.map(t=>(
                <div key={t.id} className="card mb-3" style={{cursor:'pointer'}} onClick={()=>{setSelectedTitle(t);setView('detalle-titulo')}}>
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-sm text-2">{t.university} · {t.country} · {t.year}</div>
                        <div className="font-mono text-xs text-2 mt-1">{t.certCode}</div>
                      </div>
                      {statusBadge(t.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="section-title text-base mb-4">Acciones</h2>
              <div className="flex flex-col gap-3">
                <button className="btn btn--primary btn--full" onClick={()=>setView('consultar')}>Consultar expediente público</button>
                <button className="btn btn--outline btn--full"> Descargar certificado digital</button>
                <button className="btn btn--outline btn--full">️ Solicitar verificación</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'consultar') return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <button className="btn btn--ghost btn--sm" onClick={()=>setView(session?'dashboard':'inicio')}>←</button>
        <h1 className="section-title" style={{marginBottom:0}}>Consultar expediente académico</h1>
      </div>
      <div className="alert alert--info mb-6">
        <span className="alert-icon"></span>
        Puedes consultar el estado de cualquier título académico introduciendo el número de expediente, DNI o código de certificado.
      </div>
      <div className="card mb-6" style={{maxWidth:640}}>
        <div className="card-body">
          <div className="form-group mb-0">
            <label className="form-label">Expediente, DNI o código de certificado</label>
            <div className="flex gap-3">
              <input className="form-input" placeholder="Ej: EXP-2026-00001, 11223344-F, Sofía Morales..." value={searchQuery} onChange={e=>{setSearchQuery(e.target.value);if(e.target.value.length<2)setSearchResults([])}} onKeyDown={e=>e.key==='Enter'&&doSearch()} />
              <button className="btn btn--lg" style={{background:'#0891B2',color:'#fff'}} onClick={doSearch}>Buscar</button>
            </div>
          </div>
        </div>
      </div>

      {searchResults.length === 0 && searchQuery.length > 1 && (
        <div className="alert alert--warning"><span className="alert-icon"></span>No se encontraron registros para la consulta realizada.</div>
      )}

      {searchResults.map(r=>(
        <div key={r.user.id} className="card mb-4" style={{cursor:'pointer'}} onClick={()=>{setSelectedUser(r.user);setView('expediente')}}>
          <div className="card-body">
            <div className="flex items-center gap-4 mb-3">
              <div className="avatar" style={{background:'#0E7490',color:'#fff'}}>{r.user.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
              <div>
                <div className="font-bold">{r.user.name}</div>
                <div className="text-sm text-2">DNI: {r.user.dni} · {r.user.email}</div>
                <div className="font-mono text-xs text-2">Expediente: {r.user.expedientNumber}</div>
              </div>
              <span style={{marginLeft:'auto',color:'#0891B2',fontSize:18}}>→</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.titles.map(t=><span key={t.id} className={`badge badge--${t.status==='verificado'?'success':t.status==='pendiente'?'warning':'neutral'}`}>{t.name}</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (view === 'expediente' && selectedUser) {
    const titles = ACADEMIC_TITLES.filter(t => t.userId === selectedUser.id)
    return (
      <div className="page">
        <button className="btn btn--ghost btn--sm mb-6" onClick={()=>setView('consultar')}>← Volver a búsqueda</button>
        <div className="card mb-6">
          <div className="card-header" style={{background:'linear-gradient(90deg,#0E7490,#0891B2)',color:'#fff'}}>
            <div>
              <div style={{fontSize:11,opacity:.6,marginBottom:2}}>EXPEDIENTE ACADÉMICO OFICIAL</div>
              <div style={{fontFamily:'var(--f-display)',fontSize:20,fontWeight:700}}>{selectedUser.name}</div>
              <div style={{fontSize:13,opacity:.8}}>DNI: {selectedUser.dni} · Nacimiento: {new Date(selectedUser.birthDate).toLocaleDateString('es-ES')}</div>
              <div style={{fontSize:13,opacity:.8}}>Email: {selectedUser.email}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11,opacity:.6}}>Nº Expediente</div>
              <div style={{fontFamily:'var(--f-mono)',fontSize:16,fontWeight:700}}>{selectedUser.expedientNumber}</div>
            </div>
          </div>
        </div>
        <div style={{display:'grid',gap:'var(--sp-4)'}}>
          {titles.map(t=>(
            <div key={t.id} className="card" style={{cursor:'pointer',borderLeft:'3px solid #0891B2'}} onClick={()=>{setSelectedTitle(t);setView('detalle-titulo')}}>
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge--info text-xs">{TITLE_TYPES[t.type]||t.type}</span>
                      {t.honors && <span className="badge badge--purple text-xs">Mención de Honor</span>}
                    </div>
                    <div className="font-bold text-lg">{t.name}</div>
                    <div className="text-sm text-2">{t.university} · {t.country} · {t.year}</div>
                    <div className="font-mono text-xs mt-1">{t.certCode}</div>
                  </div>
                  {statusBadge(t.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'detalle-titulo' && selectedTitle) {
    return (
      <div className="page" style={{maxWidth:640}}>
        <button className="btn btn--ghost btn--sm mb-6" onClick={()=>setView(selectedUser?'expediente':'dashboard')}>← Volver</button>
        <div className="card">
          <div className="card-header" style={{background:'linear-gradient(90deg,#164E63,#0891B2)',color:'#fff'}}>
            <div>
              <div style={{fontSize:11,opacity:.6,marginBottom:2}}>CERTIFICADO OFICIAL · {TITLE_TYPES[selectedTitle.type]?.toUpperCase()}</div>
              <div style={{fontFamily:'var(--f-display)',fontSize:22,fontWeight:800}}>{selectedTitle.name}</div>
              {selectedTitle.honors && <div style={{fontSize:12,marginTop:4,background:'rgba(255,255,255,.15)',padding:'2px 10px',borderRadius:'var(--r-full)',display:'inline-block'}}>⭐ Mención de Honor</div>}
            </div>
            {statusBadge(selectedTitle.status)}
          </div>
          <div className="card-body">
            <div className="grid-2">
              {[
                {l:'Universidad / Centro',v:selectedTitle.university},
                {l:'País',v:selectedTitle.country},
                {l:'Año de expedición',v:selectedTitle.year},
                {l:'Tipo',v:TITLE_TYPES[selectedTitle.type]||selectedTitle.type},
                {l:'Nº Expediente',v:selectedTitle.expedient},
                {l:'Código de certificado',v:selectedTitle.certCode},
                {l:'Fecha de homologación',v:selectedTitle.issueDate},
                {l:'Estado',v:selectedTitle.status},
              ].map(f=>(
                <div key={f.l}>
                  <div className="text-xs text-2 mb-1">{f.l}</div>
                  <div className={`font-semibold${f.l==='Código de certificado'||f.l==='Nº Expediente'?' font-mono text-sm':''}`}>{f.v}</div>
                </div>
              ))}
            </div>
            <div className="divider"/>
            <div className="flex gap-3">
              <button className="btn btn--outline btn--sm"> Descargar PDF oficial</button>
              <button className="btn btn--outline btn--sm">Generar enlace de verificación</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <div className="page"><div className="spinner"/></div>
}
