import { useState, useRef } from 'react'
import { INFRA_COMPONENTS, TF_FILES, PLAN_OUTPUT_LINES, APPLY_OUTPUT_LINES, type InfraComponent } from '../../data/infrastructure'

type View = 'ejercicios' | 'dashboard' | 'editor' | 'plan' | 'apply' | 'recursos'
type ExerciseId = 'ssrf' | 'backup' | 'cicd' | 'feature-flag' | 'webhook'

interface CloudExercise {
  id: ExerciseId
  title: string
  level: string
  objective: string
  scenario: string
  entryPoint: string
  steps: string[]
  evidence: string
  keyword: string
  hint: string
}

const TF_FILE_KEYS = Object.keys(TF_FILES) as (keyof typeof TF_FILES)[]
const CLOUD_EXERCISES: CloudExercise[] = [
  {
    id: 'ssrf',
    title: 'SSRF a metadata cloud',
    level: 'Intermedio',
    objective: 'Demuestra que el preview de URLs puede alcanzar la metadata interna de la instancia.',
    scenario: 'El portal TelcoCore permite previsualizar URLs para generar tarjetas de estado. El backend no restringe destinos internos.',
    entryPoint: 'URL Preview: https://status.telcocore.local/preview?url=',
    steps: [
      'Prueba una URL externa normal para ver el formato de respuesta.',
      'Cambia el destino a http://169.254.169.254/latest/meta-data/iam/security-credentials/.',
      'Usa el nombre de rol devuelto para consultar las credenciales temporales.',
      'Identifica el AccessKeyId como evidencia de impacto.'
    ],
    evidence: 'AccessKeyId',
    keyword: 'accesskeyid',
    hint: 'La IP 169.254.169.254 no sale a Internet: solo responde desde la propia instancia cloud.'
  },
  {
    id: 'backup',
    title: 'Backup S3 expuesto',
    level: 'Básico',
    objective: 'Encuentra un backup publicado por error y extrae un secreto de configuración.',
    scenario: 'El Terraform crea buckets con nombres predecibles para artefactos y copias de seguridad. Uno de ellos permite lectura pública.',
    entryPoint: 'Bucket: telco-backups-preprod',
    steps: [
      'Enumera rutas habituales: /backups, /exports, /db, /releases.',
      'Localiza el archivo customer-db-2026-05.sql.gz.',
      'Busca variables tipo DB_PASSWORD, API_SECRET o STRIPE_WEBHOOK_SECRET.',
      'Entrega el nombre del secreto encontrado como evidencia.'
    ],
    evidence: 'API_SECRET',
    keyword: 'api_secret',
    hint: 'Los backups comprimidos suelen seguir siendo texto buscable después de descomprimirlos.'
  },
  {
    id: 'cicd',
    title: 'Secretos en logs CI/CD',
    level: 'Básico',
    objective: 'Localiza un token filtrado en logs de despliegue y explica qué permiso concede.',
    scenario: 'El pipeline imprime variables de entorno para depurar un fallo de Terraform apply.',
    entryPoint: 'Deploy logs: run-4821-preprod',
    steps: [
      'Abre el log de despliegue fallido.',
      'Busca líneas con export, token, password, secret o Authorization.',
      'Identifica el token ghp_ de la cuenta de despliegue.',
      'Relaciona el token con permisos de escritura sobre releases.'
    ],
    evidence: 'ghp_',
    keyword: 'ghp_',
    hint: 'Un token no necesita estar completo en pantalla para demostrar filtrado: el prefijo y el contexto ya son evidencia.'
  },
  {
    id: 'feature-flag',
    title: 'Panel admin por feature flag',
    level: 'Intermedio',
    objective: 'Activa una función interna modificando estado de cliente y accede al panel de administración.',
    scenario: 'La app oculta herramientas internas con feature flags en localStorage, pero el servidor no revalida el rol.',
    entryPoint: 'localStorage: telco.flags',
    steps: [
      'Inspecciona el estado local del navegador.',
      'Activa adminConsole=true y reload.',
      'Abre /admin/iac/rollback desde la navegación interna.',
      'Demuestra que aparece el botón Rollback PRE-PROD.'
    ],
    evidence: 'Rollback PRE-PROD',
    keyword: 'rollback',
    hint: 'Ocultar controles en frontend no equivale a autorizar acciones en backend.'
  },
  {
    id: 'webhook',
    title: 'Bypass de firma webhook',
    level: 'Avanzado',
    objective: 'Modifica una notificación de pago porque la firma se calcula con un secreto vacío.',
    scenario: 'El Terraform define redis_auth_token vacío y el servicio de billing reutiliza esa variable como fallback para validar webhooks.',
    entryPoint: 'POST /billing/webhooks/provider',
    steps: [
      'Envía un webhook legítimo con amount=19.90.',
      'Repite la petición con amount=0.01 y status=paid.',
      'Genera la firma HMAC usando cadena vacía como secreto.',
      'Confirma que la factura queda marcada como paid.'
    ],
    evidence: 'invoice.status=paid',
    keyword: 'paid',
    hint: 'Si el secreto es cadena vacía, cualquiera puede reproducir la firma esperada.'
  }
]

export default function TelcoIaCTab() {
  const [view, setView] = useState<View>('ejercicios')
  const [selectedExercise, setSelectedExercise] = useState<ExerciseId>('ssrf')
  const [evidenceInput, setEvidenceInput] = useState('')
  const [exerciseResult, setExerciseResult] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [selectedFile, setSelectedFile] = useState<keyof typeof TF_FILES>('main.tf')
  const [planRunning, setPlanRunning] = useState(false)
  const [planLines, setPlanLines] = useState<{type:string;text:string}[]>([])
  const [planDone, setPlanDone] = useState(false)
  const [applyRunning, setApplyRunning] = useState(false)
  const [applyLines, setApplyLines] = useState<{type:string;text:string}[]>([])
  const [applyDone, setApplyDone] = useState(false)
  const [applyConfirm, setApplyConfirm] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const applyRef = useRef<HTMLDivElement>(null)

  const statusColor = (s: InfraComponent['status']) => ({running:'#16A34A',degraded:'#D97706',error:'#DC2626',deploying:'#3B82F6',stopped:'#6B7280'}[s]||'#6B7280')
  const statusBadge = (s: InfraComponent['status']) => {
    const map: Record<string,string> = {running:'success',degraded:'warning',error:'danger',deploying:'info',stopped:'neutral'}
    return <span className={`badge badge--${map[s]||'neutral'}`}>{s}</span>
  }

  const currentExercise = CLOUD_EXERCISES.find(e => e.id === selectedExercise)!

  const validateEvidence = () => {
    const normalized = evidenceInput.toLowerCase()
    setExerciseResult(normalized.includes(currentExercise.keyword) ? 'ok' : 'fail')
  }

  const runPlan = async () => {
    setPlanRunning(true); setPlanLines([]); setPlanDone(false)
    for (let i = 0; i < PLAN_OUTPUT_LINES.length; i++) {
      await new Promise(r => setTimeout(r, 80))
      setPlanLines(prev => [...prev, PLAN_OUTPUT_LINES[i]])
      if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
    setPlanRunning(false); setPlanDone(true)
  }

  const runApply = async () => {
    setApplyRunning(true); setApplyLines([]); setApplyDone(false); setApplyConfirm(false)
    for (let i = 0; i < APPLY_OUTPUT_LINES.length; i++) {
      await new Promise(r => setTimeout(r, 90))
      setApplyLines(prev => [...prev, APPLY_OUTPUT_LINES[i]])
      if (applyRef.current) applyRef.current.scrollTop = applyRef.current.scrollHeight
    }
    setApplyRunning(false); setApplyDone(true)
  }


  const renderContent = () => {
    switch (view) {
      case 'ejercicios': return (
        <div>
          <div className="hero hero--sm" style={{background:'linear-gradient(135deg,#78350F,#B45309)'}}>
            <div className="container">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="hero-title hero-title--sm">Cloud Security Lab</h1>
                  <p className="hero-subtitle">Ejercicios prácticos sobre fallos cloud nacidos de malas decisiones IaC</p>
                </div>
                <div className="flex gap-3">
                  <div style={{background:'rgba(255,255,255,.1)',padding:'var(--sp-3) var(--sp-4)',borderRadius:'var(--r-md)'}}>
                    <div className="text-xs" style={{opacity:.7}}>Entorno</div>
                    <div className="font-semibold">PRE-PROD</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,.1)',padding:'var(--sp-3) var(--sp-4)',borderRadius:'var(--r-md)'}}>
                    <div className="text-xs" style={{opacity:.7}}>Modo</div>
                    <div className="font-semibold">Guided lab</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="page">
            <div className="grid-3 mb-8">
              {CLOUD_EXERCISES.map(exercise => (
                <button
                  key={exercise.id}
                  className="card"
                  onClick={() => { setSelectedExercise(exercise.id); setExerciseResult('idle'); setEvidenceInput('') }}
                  style={{
                    textAlign:'left',
                    border: selectedExercise === exercise.id ? '2px solid var(--c-warning)' : '1px solid var(--c-border)',
                    cursor:'pointer'
                  }}
                >
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-3">
                      <span className="badge badge--warning">{exercise.level}</span>
                      <span className="font-mono text-xs text-2">{exercise.id}</span>
                    </div>
                    <div className="font-display font-bold text-base mb-2">{exercise.title}</div>
                    <p className="text-sm text-2">{exercise.objective}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-title">{currentExercise.title}</span>
                    <div className="card-subtitle">{currentExercise.objective}</div>
                  </div>
                  <span className="badge badge--warning">{currentExercise.level}</span>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <div className="form-label">Escenario</div>
                    <p className="text-sm text-2">{currentExercise.scenario}</p>
                  </div>
                  <div className="form-group">
                    <div className="form-label">Punto de entrada</div>
                    <div className="font-mono text-sm" style={{background:'#F3F4F6',padding:'var(--sp-3)',borderRadius:'var(--r-md)',wordBreak:'break-all'}}>{currentExercise.entryPoint}</div>
                  </div>
                  <div className="form-group">
                    <div className="form-label">Pasos esperados</div>
                    <ol style={{paddingLeft:'var(--sp-5)'}}>
                      {currentExercise.steps.map(step => <li key={step} className="text-sm mb-2">{step}</li>)}
                    </ol>
                  </div>
                  <div className="alert alert--info">
                    <span className="alert-icon"></span>
                    <div><strong>Pista:</strong> {currentExercise.hint}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="card mb-5">
                  <div className="card-header"><span className="card-title">Validador de evidencia</span></div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Evidencia esperada</label>
                      <div className="font-mono text-sm mb-3" style={{color:'var(--c-warning)'}}>{currentExercise.evidence}</div>
                      <textarea
                        className="form-textarea"
                        rows={4}
                        placeholder="Pega aquí la evidencia encontrada..."
                        value={evidenceInput}
                        onChange={e => { setEvidenceInput(e.target.value); setExerciseResult('idle') }}
                      />
                    </div>
                    <button className="btn btn--warning btn--full" onClick={validateEvidence} disabled={!evidenceInput.trim()}>Validar evidencia</button>
                    {exerciseResult === 'ok' && <div className="alert alert--success mt-4">Evidencia válida. El impacto queda demostrado.</div>}
                    {exerciseResult === 'fail' && <div className="alert alert--warning mt-4">Aún no coincide. Revisa la pista y busca la evidencia exacta.</div>}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><span className="card-title">Contexto IaC relacionado</span></div>
                  <div className="card-body flex flex-col gap-3">
                    <button className="btn btn--outline btn--full" onClick={()=>{setView('editor');setSelectedFile(currentExercise.id === 'webhook' ? 'variables.tf' : currentExercise.id === 'ssrf' ? 'iam.tf' : 'database.tf')}}>Abrir Terraform relacionado</button>
                    <button className="btn btn--outline btn--full" onClick={()=>setView('recursos')}>Ver recursos afectados</button>
                    <button className="btn btn--outline btn--full" onClick={()=>setView('plan')}>Revisar plan de cambios</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

      case 'dashboard': return (
        <div>
          <div className="hero hero--sm" style={{background:'linear-gradient(135deg,#78350F,#B45309)'}}>
            <div className="container">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="hero-title hero-title--sm">TelcoCore IaC Console</h1>
                  <p className="hero-subtitle">Infraestructura como código · Terraform v1.7.4 · AWS eu-west-1</p>
                </div>
                <div className="flex gap-3">
                  <div style={{background:'rgba(255,255,255,.1)',padding:'var(--sp-3) var(--sp-4)',borderRadius:'var(--r-md)'}}>
                    <div className="text-xs" style={{opacity:.7}}>Estado global</div>
                    <div className="font-semibold">PRE-PROD</div>
                  </div>
                  <div style={{background:'rgba(255,255,255,.1)',padding:'var(--sp-3) var(--sp-4)',borderRadius:'var(--r-md)'}}>
                    <div className="text-xs" style={{opacity:.7}}>Workspace</div>
                    <div className="font-semibold">telcocore-staging</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="page">
            <div className="grid-4 mb-8">
              {[
                {icon:'️',label:'Recursos activos',value:INFRA_COMPONENTS.filter(c=>c.status==='running').length,sub:'de ' + INFRA_COMPONENTS.length + ' totales'},
                {icon:'',label:'Alertas',value:INFRA_COMPONENTS.filter(c=>c.warnings.length>0).reduce((a,c)=>a+c.warnings.length,0),sub:'en ' + INFRA_COMPONENTS.filter(c=>c.warnings.length>0).length + ' componentes'},
                {icon:'',label:'Coste estimado',value:`${INFRA_COMPONENTS.reduce((a,c)=>a+c.cost,0).toFixed(0)}€`,sub:'por mes (estimado)'},
                {icon:'',label:'Regiones',value:new Set(INFRA_COMPONENTS.map(c=>c.region)).size,sub:'eu-west-1 principal'},
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="text-xs text-2 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>

              <h2 className="section-title text-base mb-4">Componentes de infraestructura</h2>
            <div className="grid-3">
              {INFRA_COMPONENTS.map(c=>(
                <div key={c.id} className="card" style={{borderLeft:`3px solid ${statusColor(c.status)}`}}>
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-xs text-2">{c.type} · {c.region}</div>
                      </div>
                      {statusBadge(c.status)}
                    </div>
                    <div className="flex justify-between mb-3">
                      <span className="badge badge--neutral text-xs">{c.tier}</span>
                      <span className="text-xs text-2">{c.cost}€/mes</span>
                    </div>
                    {c.warnings.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {c.warnings.map((w,i)=>(
                          <div key={i} style={{fontSize:11,background:'#FEF3C7',color:'#92400E',padding:'3px 8px',borderRadius:'var(--r-sm)',display:'flex',gap:4}}>
                            <span></span><span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

      case 'editor': return (
        <div className="page">
          <h1 className="section-title">Editor Terraform</h1>
          <div className="flex gap-2 mb-4 flex-wrap">
            {TF_FILE_KEYS.map(f=>(
              <button key={f} className={`btn btn--sm ${selectedFile===f?'btn--dark':'btn--outline'}`} style={{fontFamily:'var(--f-mono)',fontSize:12}} onClick={()=>setSelectedFile(f)}>{f}</button>
            ))}
          </div>
          <div className="code-block" style={{maxHeight:580,overflow:'auto',position:'relative'}}>
            <div style={{position:'absolute',top:'var(--sp-3)',right:'var(--sp-3)',display:'flex',gap:'var(--sp-2)',zIndex:1}}>
              <span className="badge badge--neutral" style={{fontFamily:'var(--f-mono)',fontSize:11}}>HCL</span>
              <button className="btn btn--sm btn--outline" style={{fontSize:11,padding:'2px 8px'}} onClick={()=>navigator.clipboard?.writeText(TF_FILES[selectedFile])}>Copiar</button>
            </div>
            <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:12,lineHeight:1.6,margin:0}}>{TF_FILES[selectedFile]}</pre>
          </div>
          <div className="alert alert--warning mt-4">
            <span className="alert-icon"></span>
            <div><strong>Modo solo lectura.</strong> Para modificar archivos Terraform usa tu cliente local con las credenciales del workspace.</div>
          </div>
        </div>
      )

      case 'plan': return (
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="section-title text-base mb-0">Terraform Plan</h1>
              <p className="text-sm text-2">Previsualiza los cambios antes de aplicar</p>
            </div>
            <button className="btn btn--dark" onClick={runPlan} disabled={planRunning}>
              {planRunning ? <><span className="spinner" style={{width:14,height:14}}/>&nbsp;Ejecutando...</> : '▶ Ejecutar plan'}
            </button>
          </div>
          <div className="terminal" ref={terminalRef} style={{minHeight:400,maxHeight:560,overflow:'auto'}}>
            {planLines.length === 0
              ? <div className="t-dim">$ terraform plan -out=tfplan.out<br/>Presiona «Ejecutar plan» para iniciar...</div>
              : planLines.map((l,i)=><div key={i} className={`t-${l.type}`}>{l.text||'\u00a0'}</div>)
            }
            {planRunning && <div className="t-dim">▌</div>}
          </div>
          {planDone && (
            <div className="flex gap-3 mt-4">
              <div className="alert alert--success flex-1">Plan completado. Revisa los cambios y procede al Apply.</div>
              <button className="btn btn--warning" onClick={()=>setView('apply')}>Ir a Apply →</button>
            </div>
          )}
        </div>
      )

      case 'apply': return (
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="section-title text-base mb-0">Terraform Apply</h1>
              <p className="text-sm text-2">Aplica los cambios en infraestructura</p>
            </div>
          </div>
          {!applyConfirm && !applyRunning && !applyDone && (
            <div className="card mb-6" style={{maxWidth:560}}>
              <div className="card-body">
                <div className="alert alert--error mb-4"><span className="alert-icon"></span><div><strong>Acción irreversible.</strong> Esta operación modificará la infraestructura real del entorno PRE-PROD.</div></div>
                <div className="form-group">
                  <label className="form-label">Escribe <strong>APPLY</strong> para confirmar</label>
                  <input className="form-input" placeholder="APPLY" onChange={e=>setApplyConfirm(e.target.value==='APPLY')} />
                </div>
              </div>
            </div>
          )}
          {applyConfirm && !applyRunning && !applyDone && (
            <button className="btn btn--danger btn--lg mb-6" onClick={runApply}>▶ Confirmar terraform apply</button>
          )}
          {(applyRunning || applyLines.length > 0) && (
            <div className="terminal" ref={applyRef} style={{minHeight:400,maxHeight:560,overflow:'auto'}}>
              {applyLines.map((l,i)=><div key={i} className={`t-${l.type}`}>{l.text||'\u00a0'}</div>)}
              {applyRunning && <div className="t-dim">▌</div>}
            </div>
          )}
          {applyDone && (
            <div className="alert alert--success mt-4">Apply completado. Estado guardado en terraform.tfstate.</div>
          )}
        </div>
      )

      case 'recursos': return (
        <div className="page">
          <h1 className="section-title">Estado de Recursos</h1>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Región</th><th>Estado</th><th>Tier</th><th>Coste/mes</th><th>Alertas</th></tr>
              </thead>
              <tbody>
                {INFRA_COMPONENTS.map(c=>(
                  <tr key={c.id}>
                    <td className="font-mono text-xs">{c.id}</td>
                    <td className="font-semibold">{c.name}</td>
                    <td className="text-sm text-2">{c.type}</td>
                    <td className="text-xs">{c.region}</td>
                    <td>{statusBadge(c.status)}</td>
                    <td><span className="badge badge--neutral text-xs">{c.tier}</span></td>
                    <td className="font-semibold">{c.cost}€</td>
                    <td>
                      {c.warnings.length > 0
                        ? <span className="badge badge--warning">{c.warnings.length} alerta{c.warnings.length>1?'s':''}</span>
                        : <span className="badge badge--success">OK</span>
                      }
                    </td>
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
        <div className="sidebar-label">TelcoCore</div>
        {([
          {v:'ejercicios',icon:'',l:'Laboratorio Cloud'},
          {v:'dashboard',icon:'',l:'Panel IaC'},
          {v:'editor',icon:'',l:'Editor Terraform'},
          {v:'plan',icon:'',l:'Terraform Plan'},
          {v:'apply',icon:'',l:'Terraform Apply'},
          {v:'recursos',icon:'',l:'Estado Recursos'},
        ] as {v:View,icon:string,l:string}[]).map(({v,icon,l})=>(
          <div key={v} className={`sidebar-nav-item${view===v?' active':''}`} onClick={()=>setView(v)}>
            <span className="nav-icon">{icon}</span>{l}
          </div>
        ))}
      </aside>
      <div style={{flex:1,overflowY:'auto'}}>
        {renderContent()}
      </div>
    </div>
  )
}
