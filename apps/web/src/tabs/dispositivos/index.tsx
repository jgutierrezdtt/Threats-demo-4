import { useMemo, useState } from 'react'
import { MEDICAL_DEVICES, SAFETY_NOTICES, THERAPY_ORDERS, type MedicalDevice, type SafetyNotice, type TherapyOrder } from '../../data/medicalDevices'
import { type Language, t } from '../../i18n'

type View = 'fleet' | 'therapy' | 'maintenance' | 'notices' | 'support' | 'audit'
type Role = 'clinical' | 'biomed' | 'service-admin'

const ROLE_LABEL: Record<Role, string> = {
  clinical: 'Operador clínico',
  biomed: 'Ingeniería biomédica',
  'service-admin': 'Administrador de servicio',
}

const STATUS_BADGE: Record<MedicalDevice['status'], string> = {
  online: 'success',
  maintenance: 'warning',
  alarm: 'danger',
  offline: 'neutral',
}

const STATUS_LABEL: Record<MedicalDevice['status'], string> = {
  online: 'Operativo',
  maintenance: 'En mantenimiento',
  alarm: 'Alarma',
  offline: 'Sin conexión',
}

const NOTICE_BADGE: Record<SafetyNotice['severity'], string> = {
  critical: 'danger',
  major: 'warning',
  minor: 'info',
}

const NOTICE_LABEL: Record<SafetyNotice['severity'], string> = {
  critical: 'Crítico',
  major: 'Importante',
  minor: 'Menor',
}

const ORDER_STATUS_LABEL: Record<TherapyOrder['status'], string> = {
  draft: 'Borrador',
  pending_review: 'Pendiente de revisión',
  active: 'Activa',
  paused: 'Pausada',
}

interface DispositivosTabProps {
  language: Language
}

export default function DispositivosTab({ language }: DispositivosTabProps) {
  const tx = (phrase: string) => t(phrase, language)
  const [view, setView] = useState<View>('fleet')
  const [role, setRole] = useState<Role>('clinical')
  const [devices, setDevices] = useState<MedicalDevice[]>(MEDICAL_DEVICES)
  const [orders, setOrders] = useState<TherapyOrder[]>(THERAPY_ORDERS)
  const [notices, setNotices] = useState<SafetyNotice[]>(SAFETY_NOTICES)
  const [selectedDevice, setSelectedDevice] = useState<MedicalDevice>(MEDICAL_DEVICES[1])
  const [newRate, setNewRate] = useState(String(MEDICAL_DEVICES[1].infusionRate ?? 0))
  const [overrideReason, setOverrideReason] = useState('')
  const [bundlePath, setBundlePath] = useState('logs/DEV-INF-0188/service.log')
  const [bundleResponse, setBundleResponse] = useState('')
  const [auditLines, setAuditLines] = useState<string[]>([
    '2026-06-15 07:44:12 operador-clinico consultó DEV-INF-0188',
    '2026-06-15 07:46:03 ingenieria-biomedica abrió FSN-2026-041',
    '2026-06-15 07:50:28 administrador-servicio exportó logs/DEV-INF-0188/service.log',
  ])

  const overdueDevices = useMemo(() => devices.filter(d => new Date(d.nextCalibration) < new Date('2026-06-15')), [devices])
  const alarmDevices = devices.filter(d => d.status === 'alarm')
  const activeOrders = orders.filter(o => o.status === 'active' || o.status === 'pending_review')

  const appendAudit = (line: string) => setAuditLines(prev => [`2026-06-15 ${new Date().toLocaleTimeString('es-ES')} ${line}`, ...prev].slice(0, 8))

  const updateRate = () => {
    const rate = Number(newRate)
    setDevices(prev => prev.map(d => d.id === selectedDevice.id ? { ...d, infusionRate: rate, status: rate > (d.maxRate ?? 999) ? 'alarm' : 'online' } : d))
    setOrders(prev => prev.map(o => o.deviceId === selectedDevice.id ? { ...o, orderedRate: rate, status: 'active' } : o))
    appendAudit(`${ROLE_LABEL[role]} actualizó ${selectedDevice.id} tasa=${rate} motivo="${overrideReason || 'sin indicar'}"`)
  }

  const rescheduleCalibration = (device: MedicalDevice, days: number) => {
    const next = new Date('2026-06-15')
    next.setDate(next.getDate() + days)
    const nextDate = next.toISOString().split('T')[0]
    setDevices(prev => prev.map(d => d.id === device.id ? { ...d, nextCalibration: nextDate, status: 'online' } : d))
    appendAudit(`${ROLE_LABEL[role]} reprogramó la calibración de ${device.id} para ${nextDate}`)
  }

  const closeNotice = (notice: SafetyNotice) => {
    setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, openDevices: 0, status: 'closed' } : n))
    appendAudit(`${ROLE_LABEL[role]} cerró ${notice.id} sin conciliación de equipos`)
  }

  const exportBundle = () => {
    const normalized = bundlePath.toLowerCase()
    if (normalized.includes('..') || normalized.includes('env')) {
      setBundleResponse('200 OK\nfile=.env\nDEVICE_API_TOKEN=mdt_live_7f41_service_override\nDB_PASSWORD=preprod-medical-devices')
    } else {
      setBundleResponse(`200 OK\nfile=${bundlePath}\n[INFO] ${tx('Sincronización con dispositivo completada')}\n[WARN] ${tx('Variación de presión detectada aguas arriba')}`)
    }
    appendAudit(`${ROLE_LABEL[role]} exportó paquete de soporte ruta=${bundlePath}`)
  }

  const renderContent = () => {
    switch (view) {
      case 'fleet': return (
        <div className="ops-page">
          <div className="ops-topbar">
            <div>
              <h1 className="ops-title">{tx('Consola de Operaciones de Dispositivos Médicos')}</h1>
              <div className="ops-subtitle">{tx('Región Madrid · espejo PRE-PROD')} · {tx('Última sincronización')} 08:42</div>
            </div>
            <div className="ops-controls">
              <label className="ops-role-label" htmlFor="device-role">{tx('Perfil activo')}</label>
              <select id="device-role" className="form-select ops-role-select" value={role} onChange={e=>{const nextRole = e.target.value as Role; setRole(nextRole);appendAudit(`perfil cambiado a ${ROLE_LABEL[nextRole]}`)}}>
                {(['clinical','biomed','service-admin'] as Role[]).map(r => <option key={r} value={r}>{tx(ROLE_LABEL[r])}</option>)}
              </select>
              <span className="badge badge--info">MediOps v6.8</span>
            </div>
          </div>

          <div className="ops-content">
            <div className="ops-metrics">
              {[
                {label:'Conectados', value:devices.filter(d=>d.status!=='offline').length, sub:<>{devices.length} {tx('totales')}</>, tone:'ok'},
                {label:'Alarmas', value:alarmDevices.length, sub:'presión / límites', tone:'danger'},
                {label:'Avisos abiertos', value:notices.filter(n=>n.status!=='closed').length, sub:'seguridad de campo', tone:'warn'},
                {label:'Calibración vencida', value:overdueDevices.length, sub:'requiere servicio', tone:'warn'}
              ].map(s => (
                <div key={s.label} className={`ops-metric ops-metric--${s.tone}`}>
                  <div className="ops-metric-value">{s.value}</div>
                  <div>
                    <div className="ops-metric-label">{tx(s.label)}</div>
                    <div className="ops-metric-sub">{typeof s.sub === 'string' ? tx(s.sub) : s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ops-grid">
              <div className="ops-panel">
                <div className="ops-panel-header">
                  <div>
                    <div className="ops-panel-title">{tx('Flota de dispositivos')}</div>
                    <div className="ops-panel-subtitle">{tx('Estado operativo por equipo y unidad clínica')}</div>
                  </div>
                  <button className="btn btn--outline btn--sm" onClick={()=>setView('audit')}>{tx('Ver auditoría')}</button>
                </div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr><th>{tx('Equipo')}</th><th>{tx('Unidad')}</th><th>{tx('Paciente')}</th><th>{tx('Estado')}</th><th>Firmware</th><th>{tx('Calibración')}</th><th>{tx('Terapia')}</th><th></th></tr>
                    </thead>
                    <tbody>
                      {devices.map(device => (
                        <tr key={device.id}>
                          <td>
                            <div className="font-semibold">{device.model}</div>
                            <div className="font-mono text-xs text-2">{device.id} · {device.serial}</div>
                          </td>
                          <td className="text-sm">{tx(device.ward)}</td>
                          <td className="font-mono text-xs">{device.patient ?? '—'}</td>
                          <td><span className={`badge badge--${STATUS_BADGE[device.status]}`}>{tx(STATUS_LABEL[device.status])}</span></td>
                          <td className="font-mono text-xs">{device.firmware}</td>
                          <td>
                            <div className="text-sm">{device.nextCalibration}</div>
                            {new Date(device.nextCalibration) < new Date('2026-06-15') && <span className="badge badge--danger">{tx('vencida')}</span>}
                          </td>
                          <td className="text-sm">
                            {device.infusionRate !== undefined ? `${device.infusionRate} / ${device.maxRate} ml/h` : '—'}
                          </td>
                          <td><button className="btn btn--outline btn--sm" onClick={() => { setSelectedDevice(device); setNewRate(String(device.infusionRate ?? 0)); setView(device.family === 'infusion' ? 'therapy' : 'maintenance') }}>{tx('Abrir')}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="ops-panel ops-panel--side">
                <div className="ops-panel-header">
                  <div>
                    <div className="ops-panel-title">{tx('Cola de seguridad')}</div>
                    <div className="ops-panel-subtitle">{tx('Acciones pendientes')}</div>
                  </div>
                </div>
                <div className="ops-queue">
                  {notices.map(notice => (
                    <button key={notice.id} className="ops-queue-item" onClick={()=>setView('notices')}>
                      <div className="flex justify-between gap-3">
                        <span className={`badge badge--${NOTICE_BADGE[notice.severity]}`}>{tx(NOTICE_LABEL[notice.severity])}</span>
                        <span className="font-mono text-xs text-2">{notice.id}</span>
                      </div>
                      <div className="font-semibold text-sm mt-2">{tx(notice.title)}</div>
                      <div className="text-xs text-2 mt-1">{notice.openDevices} {tx('dispositivos')} · {tx('vence')} {notice.dueAt}</div>
                    </button>
                  ))}
                  <button className="ops-queue-item" onClick={()=>setView('support')}>
                    <div className="flex justify-between gap-3">
                      <span className="badge badge--neutral">{tx('Soporte')}</span>
                      <span className="font-mono text-xs text-2">{tx('paquete')}</span>
                    </div>
                    <div className="font-semibold text-sm mt-2">{tx('Exportación técnica disponible')}</div>
                    <div className="text-xs text-2 mt-1">{tx('logs y perfiles por dispositivo')}</div>
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )

      case 'therapy': return (
        <div className="page">
          <div className="page-header">
            <div>
              <h1 className="section-title text-base mb-0">{tx('Control de terapia')}</h1>
              <p className="text-sm text-2">{selectedDevice.model} · {selectedDevice.id} · {tx(selectedDevice.ward)}</p>
            </div>
            <span className={`badge badge--${STATUS_BADGE[selectedDevice.status]}`}>{tx(STATUS_LABEL[selectedDevice.status])}</span>
          </div>
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">{tx('Órdenes de terapia activas')}</span></div>
              <div className="card-body">
                {activeOrders.map(order => (
                  <div key={order.id} className="card mb-4" style={{boxShadow:'none'}}>
                    <div className="card-body">
                      <div className="flex justify-between mb-2"><span className="font-mono text-xs">{order.id}</span><span className={`badge badge--${order.status==='active'?'success':'warning'}`}>{tx(ORDER_STATUS_LABEL[order.status])}</span></div>
                      <div className="font-semibold">{tx(order.drug)}</div>
                      <div className="text-sm text-2">{order.concentration} · {order.patientWeight} kg</div>
                      <div className="flex justify-between text-sm mt-3"><span>{tx('Tasa indicada')}</span><strong>{order.orderedRate} ml/h</strong></div>
                      <div className="flex justify-between text-sm"><span>{tx('Máximo recomendado')}</span><strong>{order.maxRecommendedRate} ml/h</strong></div>
                      <div className="text-xs text-2 mt-2">{tx('Ordenado por')} {order.orderedBy}{order.cosignedBy ? ` · ${tx('Validado por')} ${order.cosignedBy}` : ` · ${tx('Doble validación pendiente')}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card mb-5">
                <div className="card-header"><span className="card-title">{tx('Ajuste de tasa')}</span></div>
                <div className="card-body">
                  <div className="alert alert--warning mb-4">{tx('Los límites blandos son orientativos para flujos de emergencia.')}</div>
                  <div className="form-group">
                    <label className="form-label">{tx('Nueva tasa de infusión (ml/h)')}</label>
                    <input className="form-input" type="number" value={newRate} onChange={e=>setNewRate(e.target.value)} />
                    <div className="form-hint">{tx('Máximo de librería farmacológica:')} {selectedDevice.maxRate ?? 'n/a'} ml/h</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{tx('Motivo de excepción')}</label>
                    <select className="form-select" value={overrideReason} onChange={e=>setOverrideReason(e.target.value)}>
                      <option value="">{tx('Selecciona motivo...')}</option>
                      <option>{tx('Titulación de emergencia')}</option>
                      <option>{tx('Orden verbal médica')}</option>
                      <option>{tx('Excepción de protocolo')}</option>
                    </select>
                  </div>
                  <button className="btn btn--primary btn--full" onClick={updateRate}>{tx('Aplicar cambio de tasa')}</button>
                </div>
              </div>
              <div className="alert alert--info">{tx('Rol actual:')} <strong>{tx(ROLE_LABEL[role])}</strong>. {tx('La consola mantiene el flujo operativo durante atención urgente.')}</div>
            </div>
          </div>
        </div>
      )

      case 'maintenance': return (
        <div className="page">
          <h1 className="section-title">{tx('Planificación de mantenimiento')}</h1>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{tx('Dispositivo')}</th><th>{tx('Unidad')}</th><th>{tx('Última calibración')}</th><th>{tx('Próxima calibración')}</th><th>{tx('Estado')}</th><th>{tx('Acción')}</th></tr></thead>
              <tbody>
                {devices.map(device => (
                  <tr key={device.id}>
                    <td><div className="font-semibold">{device.model}</div><div className="font-mono text-xs text-2">{device.id}</div></td>
                    <td>{tx(device.ward)}</td>
                    <td>{device.lastCalibration}</td>
                    <td>{device.nextCalibration}</td>
                    <td><span className={`badge badge--${new Date(device.nextCalibration) < new Date('2026-06-15') ? 'danger' : 'success'}`}>{tx(new Date(device.nextCalibration) < new Date('2026-06-15') ? 'vencida' : 'programada')}</span></td>
                    <td><button className="btn btn--outline btn--sm" onClick={()=>rescheduleCalibration(device, 90)}>{tx('Mover +90 días')}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="alert alert--warning mt-4">{tx('Los cambios de planificación se aplican inmediatamente para mantener ventanas de servicio flexibles.')}</div>
        </div>
      )

      case 'notices': return (
        <div className="page">
          <h1 className="section-title">{tx('Avisos de seguridad de campo')}</h1>
          <div className="grid-2">
            {notices.map(notice => (
              <div key={notice.id} className="card">
                <div className="card-header">
                  <div>
                    <span className="card-title">{tx(notice.title)}</span>
                    <div className="card-subtitle">{notice.id} · {tx('Vence')} {notice.dueAt}</div>
                  </div>
                  <span className={`badge badge--${NOTICE_BADGE[notice.severity]}`}>{tx(NOTICE_LABEL[notice.severity])}</span>
                </div>
                <div className="card-body">
                  <div className="flex justify-between mb-2"><span className="text-sm text-2">{tx('Modelos afectados')}</span><span className="font-semibold">{notice.affectedModels.join(', ')}</span></div>
                  <div className="flex justify-between mb-4"><span className="text-sm text-2">{tx('Dispositivos abiertos')}</span><span className="font-semibold">{notice.openDevices}</span></div>
                  <button className="btn btn--warning btn--full" disabled={notice.status==='closed'} onClick={()=>closeNotice(notice)}>{tx(notice.status==='closed'?'Cerrado':'Cerrar aviso')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

      case 'support': return (
        <div className="page">
          <h1 className="section-title">{tx('Paquete de soporte técnico')}</h1>
          <div className="grid-2">
            <div className="card">
              <div className="card-header"><span className="card-title">{tx('Exportar archivo de servicio')}</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">{tx('Ruta del paquete')}</label>
                  <input className="form-input font-mono" value={bundlePath} onChange={e=>setBundlePath(e.target.value)} />
                  <div className="form-hint">{tx('Ejemplos: logs/DEV-INF-0188/service.log, configs/DEV-DIA-0027/profile.json')}</div>
                </div>
                <button className="btn btn--dark" onClick={exportBundle}>{tx('Exportar paquete')}</button>
              </div>
            </div>
            <div className="terminal" style={{whiteSpace:'pre-wrap'}}>{bundleResponse || tx('$ esperando solicitud de exportación')}</div>
          </div>
        </div>
      )

      case 'audit': return (
        <div className="page">
          <h1 className="section-title">{tx('Registro de auditoría')}</h1>
          <div className="terminal" style={{whiteSpace:'pre-wrap'}}>
            {auditLines.map(line => <div key={line}>{line}</div>)}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="layout-sidebar">
      <aside className="sidebar">
        <div className="sidebar-label">MediOps</div>
        {([
          {v:'fleet',l:'Vista de flota'},
          {v:'therapy',l:'Control de terapia'},
          {v:'maintenance',l:'Mantenimiento'},
          {v:'notices',l:'Avisos de seguridad'},
          {v:'support',l:'Paquete de soporte'},
          {v:'audit',l:'Registro de auditoría'},
        ] as {v:View,l:string}[]).map(item => (
          <div key={item.v} className={`sidebar-nav-item${view===item.v?' active':''}`} onClick={()=>setView(item.v)}>
            {tx(item.l)}
          </div>
        ))}
      </aside>
      <div style={{flex:1,overflowY:'auto'}}>
        {renderContent()}
      </div>
    </div>
  )
}
