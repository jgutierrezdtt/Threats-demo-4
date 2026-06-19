import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// ─── Auth middleware ────────────────────────────────────────────────────────
// Extrae el userId del header x-user-id sin verificación de token real.
// Cualquier valor no vacío es aceptado como sesión válida.
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string | undefined
  if (!userId) {
    res.status(401).json({ error: 'Header x-user-id requerido' })
    return
  }
  ;(req as any).userId = userId
  next()
}

// ─── Datos mock ────────────────────────────────────────────────────────────
const MATCHES = [
  { id: 'RMA-FCB-001', homeTeam: 'Real Madrid', awayTeam: 'FC Barcelona', competition: 'LaLiga EA Sports', date: '2026-03-07', status: 'available' },
  { id: 'ATM-SEV-002', homeTeam: 'Atlético de Madrid', awayTeam: 'Sevilla FC', competition: 'LaLiga EA Sports', date: '2026-03-08', status: 'available' },
]

const PATIENTS = [
  { id: 'PAT-001', nhc: '100234567', name: 'María González', assignedDoctor: 'DR-001' },
  { id: 'PAT-002', nhc: '100765432', name: 'Carlos Pérez',   assignedDoctor: 'DR-002' },
]

const POLICIES = [
  { id: 'POL-2026-001', userId: 'user-001', product: 'SALUD-PLUS', premium: 89.90 },
  { id: 'POL-2026-002', userId: 'user-002', product: 'HOGAR-TOTAL', premium: 22.50 },
]

const INFRA_COMPONENTS = [
  { id: 'ec2-web-01', name: 'web-server-01', status: 'running', cost: 45.20 },
  { id: 'rds-main',   name: 'postgres-main', status: 'running', cost: 120.00 },
]

const LINKS = [
  { id: 'link-001', userId: 'user-me',  title: 'React Docs',   url: 'https://react.dev', clicks: 42 },
  { id: 'link-002', userId: 'user-b',   title: 'Notion Guide', url: 'https://notion.so', clicks: 18 },
]

const ACADEMIC_TITLES = [
  { id: 'TTL-001', userId: 'USR-001', name: 'Ingeniería Informática', university: 'UCM', certCode: 'CERT-UCM-2024-001', status: 'verificado' },
  { id: 'TTL-002', userId: 'USR-002', name: 'Medicina',               university: 'UAM', certCode: 'CERT-UAM-2023-047', status: 'verificado' },
]

const MEDICAL_DEVICES = [
  { id: 'DEV-INF-0142', model: 'InfuCare VP700', ward: 'ICU East', status: 'online', infusionRate: 18, maxRate: 20 },
  { id: 'DEV-INF-0188', model: 'InfuCare VP700', ward: 'Oncology Day Unit', status: 'alarm', infusionRate: 42, maxRate: 35 },
  { id: 'DEV-DIA-0027', model: 'RenalFlow HD90', ward: 'Dialysis Unit', status: 'online' },
]

// ─── Rutas Fútbol ───────────────────────────────────────────────────────────
app.get('/api/futbol/matches', (_req, res) => {
  res.json(MATCHES)
})

// Acceso por ID sin verificar si el partido es de socios
app.get('/api/futbol/matches/:id', (req, res) => {
  const match = MATCHES.find(m => m.id === req.params.id)
  if (!match) { res.status(404).json({ error: 'Partido no encontrado' }); return }
  res.json(match)
})

app.post('/api/futbol/tickets', authMiddleware, (req, res) => {
  const { matchId, category, qty, buyerName, buyerEmail } = req.body
  const ticket = {
    id: `TK-2026-${Math.floor(Math.random()*90000)+10000}`,
    matchId, category, qty, buyerName, buyerEmail,
    code: `TK-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
    status: 'valid',
  }
  res.status(201).json(ticket)
})

// ─── Rutas Hospital ─────────────────────────────────────────────────────────
// El endpoint devuelve todos los pacientes sin filtrar por médico del usuario
app.get('/api/hospital/patients', authMiddleware, (_req, res) => {
  res.json(PATIENTS)
})

app.get('/api/hospital/patients/:nhc', authMiddleware, (req, res) => {
  const patient = PATIENTS.find(p => p.nhc === req.params.nhc)
  if (!patient) { res.status(404).json({ error: 'Paciente no encontrado' }); return }
  res.json(patient)
})

app.post('/api/hospital/rag', authMiddleware, async (req, res) => {
  const { query } = req.body
  if (!query) { res.status(400).json({ error: 'query requerido' }); return }
  // Simulación de respuesta RAG
  res.json({
    response: `Consulta procesada: "${query}". Revise el sistema SIH para datos completos.`,
    sources: ['HIS Integrado v4.2'],
    model: 'RAG-clinical-v3.1'
  })
})

// ─── Rutas Seguros ──────────────────────────────────────────────────────────
app.get('/api/seguros/products', (_req, res) => {
  res.json([
    { id: 'SALUD-PLUS', name: 'Salud Plus', basePrice: 89.90 },
    { id: 'HOGAR-TOTAL', name: 'Hogar Total', basePrice: 22.50 },
  ])
})

// Los códigos promo se aplican sin límite de acumulación
app.post('/api/seguros/quote', (req, res) => {
  const { productId, age, smoker, addOns, promoCodes } = req.body
  const product = { 'SALUD-PLUS': 89.90, 'HOGAR-TOTAL': 22.50 } as Record<string,number>
  let price = product[productId] ?? 50
  if (age >= 55) price *= 1.4
  if (smoker) price *= 1.25
  const PROMO: Record<string,number> = { VERANO26:15, NUEVO50:50, VIP2026:30, EMPLEADO40:40, FIDELIDAD:25 }
  let totalDiscount = 0
  const applied: { code:string; discount:number }[] = []
  for (const code of (promoCodes ?? [])) {
    const d = PROMO[code.toUpperCase()]
    if (d) { totalDiscount += d; applied.push({ code, discount: d }) }
  }
  price = price * (1 - totalDiscount / 100)
  res.json({ originalPrice: product[productId], finalPrice: Math.max(price,0).toFixed(2), totalDiscount, applied })
})

app.get('/api/seguros/policies', authMiddleware, (req, res) => {
  // Filtra pólizas por userId del header
  const userId = (req as any).userId
  const policies = POLICIES.filter(p => p.userId === userId)
  res.json(policies)
})

// ─── Rutas TelcoIaC ─────────────────────────────────────────────────────────
app.get('/api/telco/resources', authMiddleware, (_req, res) => {
  res.json(INFRA_COMPONENTS)
})

app.post('/api/telco/plan', authMiddleware, (_req, res) => {
  res.json({ status: 'ok', planId: `plan-${Date.now()}`, changes: { add: 2, change: 1, destroy: 0 } })
})

app.post('/api/telco/apply', authMiddleware, (_req, res) => {
  res.json({ status: 'applied', applyId: `apply-${Date.now()}`, resources: 11 })
})

// ─── Rutas Dispositivos Médicos ─────────────────────────────────────────────
app.get('/api/devices/fleet', authMiddleware, (_req, res) => {
  res.json(MEDICAL_DEVICES)
})

// Fallo funcional: acepta cambios de tasa por rol indicado en cabecera, sin
// verificar cofirma clínica ni bloquear límites superiores de la librería.
app.post('/api/devices/:id/therapy/rate', authMiddleware, (req, res) => {
  const device = MEDICAL_DEVICES.find(d => d.id === req.params.id)
  if (!device) { res.status(404).json({ error: 'Dispositivo no encontrado' }); return }
  const { rate, reason } = req.body
  ;(device as any).infusionRate = Number(rate)
  ;(device as any).status = Number(rate) > ((device as any).maxRate ?? 999) ? 'alarm' : 'online'
  res.json({ status: 'accepted', deviceId: device.id, rate: Number(rate), reason: reason || 'not provided', cosignRequired: false })
})

app.post('/api/devices/:id/calibration/reschedule', authMiddleware, (req, res) => {
  const { nextCalibration } = req.body
  res.json({ status: 'scheduled', deviceId: req.params.id, nextCalibration, requiresSupervisorApproval: false })
})

app.post('/api/devices/notices/:id/close', authMiddleware, (req, res) => {
  res.json({ status: 'closed', noticeId: req.params.id, reconciledDevices: req.body?.reconciledDevices ?? 0 })
})

// Fallo de código: validación de path incompleta en exportación de bundles.
// En una app real debería resolver contra una allowlist por deviceId y rechazar
// traversal antes de acceder al almacenamiento.
app.get('/api/devices/support-bundle', authMiddleware, (req, res) => {
  const file = String(req.query.file ?? 'logs/DEV-INF-0188/service.log')
  if (file.includes('..') || file.toLowerCase().includes('env')) {
    res.type('text/plain').send('DEVICE_API_TOKEN=mdt_live_7f41_service_override\nDB_PASSWORD=preprod-medical-devices')
    return
  }
  res.type('text/plain').send(`[INFO] bundle=${file}\n[WARN] Upstream pressure variance detected`)
})

// ─── Rutas Links ─────────────────────────────────────────────────────────────
// El endpoint devuelve todos los links sin filtrar por userId
app.get('/api/links', authMiddleware, (_req, res) => {
  res.json(LINKS)
})

app.post('/api/links', authMiddleware, (req, res) => {
  const userId = (req as any).userId
  const link = { id: `link-${Date.now()}`, userId, ...req.body, clicks: 0 }
  LINKS.push(link)
  res.status(201).json(link)
})

// ─── Rutas Portal Público ───────────────────────────────────────────────────
// Búsqueda pública de expedientes sin autenticación — devuelve datos de cualquier usuario
app.get('/api/portal/search', (req, res) => {
  const { q } = req.query as { q?: string }
  if (!q) { res.json([]); return }
  const lower = q.toLowerCase()
  const results = ACADEMIC_TITLES.filter(t =>
    t.certCode.toLowerCase().includes(lower) ||
    t.userId.toLowerCase().includes(lower)
  )
  res.json(results)
})

app.get('/api/portal/titles/:certCode', (req, res) => {
  const title = ACADEMIC_TITLES.find(t => t.certCode === req.params.certCode)
  if (!title) { res.status(404).json({ error: 'Título no encontrado' }); return }
  res.json(title)
})

// ─── Inicio ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PlatformSuite API', version: '2.4.0', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[API] PlatformSuite API v2.4 escuchando en http://localhost:${PORT}`)
})

export default app
