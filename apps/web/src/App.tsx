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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('tab', activeTab)
    window.history.replaceState({}, '', `?${params.toString()}`)
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
    </div>
  )
}
