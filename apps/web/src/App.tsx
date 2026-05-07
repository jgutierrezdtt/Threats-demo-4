import { useState, useEffect } from 'react'
import FutbolTab from './tabs/futbol'
import HospitalTab from './tabs/hospital'
import SegurosTab from './tabs/seguros'
import TelcoIaCTab from './tabs/telco-iac'
import LinkManagerTab from './tabs/link-manager'
import PortalPublicoTab from './tabs/portal-publico'
import './index.css'

// Minimal SVG icon set — 16x16 stroked icons, 1.5px stroke
const Icon = {
  Ticket: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="14" height="8" rx="1.5"/>
      <line x1="5.5" y1="4" x2="5.5" y2="12"/>
      <line x1="10.5" y1="4" x2="10.5" y2="12"/>
    </svg>
  ),
  Hospital: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="12" rx="1"/>
      <line x1="8" y1="6" x2="8" y2="12"/>
      <line x1="5" y1="9" x2="11" y2="9"/>
    </svg>
  ),
  Shield: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L2.5 4v4c0 3 2.5 5.5 5.5 6 3-0.5 5.5-3 5.5-6V4L8 1.5z"/>
    </svg>
  ),
  Cloud: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a3 3 0 110-6 3.5 3.5 0 017 .5A2.5 2.5 0 0112.5 11H4z"/>
    </svg>
  ),
  Link: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5L7 4"/>
      <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5L9 12"/>
    </svg>
  ),
  Academic: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L1 6l7 4 7-4-7-4z"/>
      <path d="M3.5 8v4a4.5 4.5 0 009 0V8"/>
    </svg>
  ),
}

interface Hint {
  type: 'business-logic' | 'idor' | 'auth' | 'misconfiguration' | 'exposure'
  title: string
  steps: string[]
  cwe: string
}

const HINTS: Record<string, Hint> = {
  futbol: {
    type: 'idor',
    title: 'IDOR via parámetro de URL',
    steps: [
      'Selecciona cualquier partido y fíjate en la URL: aparece ?tab=futbol&match=MATCH_ID',
      'Los partidos marcados como "Exclusivo Socios" tienen un ID. Cópialo de la URL compartible.',
      'Modifica directamente el parámetro ?match= en la barra de direcciones con el ID de un partido restringido.',
      'El sistema carga el partido sin verificar si el usuario tiene rol de socio — acceso completo al flujo de compra.',
    ],
    cwe: 'CWE-639 — Authorization Bypass Through User-Controlled Key',
  },
  hospital: {
    type: 'auth',
    title: 'Acceso cross-paciente via RAG sin control de sesión',
    steps: [
      'El médico "activo" se cambia en cliente sin validación de credenciales (botones en el hero del dashboard).',
      'El Asistente IA responde con datos de cualquier paciente independientemente del médico seleccionado.',
      'Prueba: cambia al médico de Traumatología y pide datos de un paciente de Oncología — se devuelven sin restricción.',
      'El campo assignedDoctor en los datos no se cruza con el médico activo en ningún momento.',
    ],
    cwe: 'CWE-284 — Improper Access Control',
  },
  seguros: {
    type: 'business-logic',
    title: 'Acumulación ilimitada de códigos promocionales',
    steps: [
      'Ve al Cotizador y configura cualquier producto.',
      'Aplica el código VERANO26 (-15%). Luego aplica MAPFRE10 (-10%). Luego SALUD20 (-20%).',
      'No hay límite en el número de códigos ni en el descuento total acumulado.',
      'Sigue aplicando códigos (HOGAR15, DENTAL25, PROMO5, VIP30) — el precio final puede llegar a 0€ o negativo.',
    ],
    cwe: 'CWE-840 — Business Logic Errors',
  },
  telco: {
    type: 'misconfiguration',
    title: 'Misconfiguraciones críticas en Terraform IaC',
    steps: [
      'Abre la vista "Editor HCL" y revisa compute.tf: SSH (puerto 22) abierto a 0.0.0.0/0.',
      'En database.tf: la base de datos tiene publicly_accessible = true y skip_final_snapshot = true.',
      'En iam.tf: el rol tiene Action: "*" y Resource: "*" — privilegios excesivos sin least-privilege.',
      'En vpc.tf: subnet pública con map_public_ip_on_launch = true y ruta 0.0.0.0/0 al Internet Gateway.',
    ],
    cwe: 'CWE-732 — Incorrect Permission Assignment for Critical Resource',
  },
  links: {
    type: 'exposure',
    title: 'Exposición de datos cross-usuario en el estado global',
    steps: [
      'El estado inicial de links se carga con INITIAL_LINKS que contiene posts de múltiples usuarios (user-1, user-2, user-3...).',
      'Ve a "Mis Links" — verás todos los links con un badge naranja "Usuario: user-X" para los que no son tuyos.',
      'Puedes editar, eliminar y gestionar links de otros usuarios sin ninguna verificación de pertenencia.',
      'El filtro CURRENT_USER_ID solo afecta a contadores, no al acceso real a los datos.',
    ],
    cwe: 'CWE-639 — Authorization Bypass Through User-Controlled Key',
  },
  portal: {
    type: 'idor',
    title: 'IDOR en consulta pública de expedientes académicos',
    steps: [
      'Sin autenticarse, haz clic en "Consultar título público".',
      'Introduce cualquier nombre, DNI o número de expediente de otro ciudadano — todos son visibles.',
      'El sistema devuelve el expediente académico completo incluyendo títulos, universidad, año y certificados.',
      'La autenticación protege el dashboard propio, pero la consulta pública accede a TODOS los registros sin restricción.',
    ],
    cwe: 'CWE-284 — Improper Access Control',
  },
}

const HINT_COLORS: Record<Hint['type'], { bg: string; border: string; badge: string; text: string }> = {
  'business-logic': { bg: '#FFF7ED', border: '#FED7AA', badge: 'badge--warning', text: '#92400E' },
  'idor':           { bg: '#FEF2F2', border: '#FECACA', badge: 'badge--danger',  text: '#991B1B' },
  'auth':           { bg: '#FEF2F2', border: '#FECACA', badge: 'badge--danger',  text: '#991B1B' },
  'misconfiguration': { bg: '#FFFBEB', border: '#FDE68A', badge: 'badge--warning', text: '#78350F' },
  'exposure':       { bg: '#F5F3FF', border: '#DDD6FE', badge: 'badge--purple',  text: '#4C1D95' },
}

const HINT_TYPE_LABEL: Record<Hint['type'], string> = {
  'business-logic': 'Lógica de negocio',
  'idor': 'IDOR',
  'auth': 'Control de acceso',
  'misconfiguration': 'Misconfiguration',
  'exposure': 'Exposición de datos',
}

const TABS = [
  { id: 'futbol',   label: 'Entradas Fútbol',        IconComp: Icon.Ticket,   accentColor: '#16A34A' },
  { id: 'hospital', label: 'Portal Sanitario',         IconComp: Icon.Hospital, accentColor: '#3B82F6' },
  { id: 'seguros',  label: 'Seguros',                  IconComp: Icon.Shield,   accentColor: '#8B5CF6' },
  { id: 'telco',    label: 'Infraestructura Telco',    IconComp: Icon.Cloud,    accentColor: '#D97706' },
  { id: 'links',    label: 'Gestor de Publicaciones',  IconComp: Icon.Link,     accentColor: '#EC4899' },
  { id: 'portal',   label: 'Registro y Títulos',       IconComp: Icon.Academic, accentColor: '#06B6D4' },
] as const

type TabId = typeof TABS[number]['id']

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('tab') as TabId
    return TABS.find(tab => tab.id === t) ? t : 'futbol'
  })
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('tab', activeTab)
    window.history.replaceState({}, '', `?${params.toString()}`)
    setShowHint(false)
  }, [activeTab])

  const renderTab = () => {
    switch (activeTab) {
      case 'futbol':   return <FutbolTab />
      case 'hospital': return <HospitalTab />
      case 'seguros':  return <SegurosTab />
      case 'telco':    return <TelcoIaCTab />
      case 'links':    return <LinkManagerTab />
      case 'portal':   return <PortalPublicoTab />
    }
  }

  const active = TABS.find(t => t.id === activeTab)!
  const hint = HINTS[activeTab]
  const hintColors = HINT_COLORS[hint.type]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <polygon points="11,1 21,6 21,16 11,21 1,16 1,6" fill="#3B82F6" />
            <polygon points="11,5 17,8 17,14 11,17 5,14 5,8" fill="#1D4ED8" />
          </svg>
          <span className="header-title">PlatformSuite</span>
          <span className="header-version">Enterprise v2.4</span>
        </div>
        <div className="header-right">
          <span className="header-env">PRE-PROD</span>
          <div className="header-user-pill">
            <div className="header-avatar">A</div>
            <span>admin@empresa.es</span>
          </div>
        </div>
      </header>

      <nav className="tab-bar" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-btn${activeTab === tab.id ? ' tab-btn--active' : ''}`}
            style={activeTab === tab.id ? { '--tab-accent': tab.accentColor } as React.CSSProperties : {}}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon" aria-hidden="true"><tab.IconComp /></span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div
        className="tab-accent-bar"
        style={{ background: active.accentColor }}
        aria-hidden="true"
      />

      <main className="app-main" role="tabpanel">
        {renderTab()}
      </main>

      {/* Hint panel */}
      {showHint && (
        <div className="hint-overlay" onClick={() => setShowHint(false)}>
          <div className="hint-panel" style={{ borderColor: hintColors.border, background: hintColors.bg }} onClick={e => e.stopPropagation()}>
            <div className="hint-panel-header">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={hintColors.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="9" r="8"/>
                  <line x1="9" y1="8" x2="9" y2="13"/>
                  <circle cx="9" cy="5.5" r=".75" fill={hintColors.text} stroke="none"/>
                </svg>
                <div>
                  <div className="hint-panel-label" style={{ color: hintColors.text }}>Pista de vulnerabilidad</div>
                  <div className="hint-panel-title" style={{ color: hintColors.text }}>{hint.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${hintColors.badge}`}>{HINT_TYPE_LABEL[hint.type]}</span>
                <button className="hint-close" onClick={() => setShowHint(false)} aria-label="Cerrar pista">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/>
                  </svg>
                </button>
              </div>
            </div>
            <ol className="hint-steps">
              {hint.steps.map((s, i) => (
                <li key={i} className="hint-step">
                  <span className="hint-step-num">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <div className="hint-cwe" style={{ color: hintColors.text }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 1v4l2 2"/><circle cx="6" cy="6" r="5"/>
              </svg>
              {hint.cwe}
            </div>
          </div>
        </div>
      )}

      {/* Floating hint trigger */}
      <button
        className={`hint-fab${showHint ? ' hint-fab--active' : ''}`}
        style={{ '--hint-accent': active.accentColor } as React.CSSProperties}
        onClick={() => setShowHint(v => !v)}
        title="Mostrar pista de vulnerabilidad"
        aria-label="Mostrar pista de vulnerabilidad"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="9"/>
          <path d="M7.5 7.5a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 3.5"/>
          <circle cx="10" cy="15" r=".8" fill="currentColor" stroke="none"/>
        </svg>
        <span>Pista</span>
      </button>
    </div>
  )
}
