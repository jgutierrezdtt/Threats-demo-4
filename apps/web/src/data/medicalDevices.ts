export interface MedicalDevice {
  id: string
  serial: string
  model: string
  family: 'infusion' | 'dialysis' | 'surgical' | 'nutrition'
  ward: string
  patient?: string
  status: 'online' | 'maintenance' | 'alarm' | 'offline'
  firmware: string
  lastCalibration: string
  nextCalibration: string
  riskClass: 'IIa' | 'IIb' | 'III'
  infusionRate?: number
  maxRate?: number
  drugLibrary?: string
}

export interface TherapyOrder {
  id: string
  deviceId: string
  drug: string
  concentration: string
  orderedRate: number
  maxRecommendedRate: number
  patientWeight: number
  status: 'draft' | 'pending_review' | 'active' | 'paused'
  orderedBy: string
  cosignedBy?: string
}

export interface SafetyNotice {
  id: string
  severity: 'critical' | 'major' | 'minor'
  title: string
  affectedModels: string[]
  publishedAt: string
  dueAt: string
  openDevices: number
  status: 'open' | 'in_progress' | 'closed'
}

export const MEDICAL_DEVICES: MedicalDevice[] = [
  {
    id: 'DEV-INF-0142',
    serial: 'INF-26-8A19-0142',
    model: 'InfuCare VP700',
    family: 'infusion',
    ward: 'UCI Este',
    patient: 'NHC-100455891',
    status: 'online',
    firmware: '4.8.2',
    lastCalibration: '2026-02-18',
    nextCalibration: '2026-06-19',
    riskClass: 'IIb',
    infusionRate: 18,
    maxRate: 20,
    drugLibrary: 'ICU-adult-v12'
  },
  {
    id: 'DEV-INF-0188',
    serial: 'INF-26-8A19-0188',
    model: 'InfuCare VP700',
    family: 'infusion',
    ward: 'Hospital de día Oncología',
    patient: 'NHC-100399111',
    status: 'alarm',
    firmware: '4.8.1',
    lastCalibration: '2025-12-04',
    nextCalibration: '2026-06-10',
    riskClass: 'IIb',
    infusionRate: 42,
    maxRate: 35,
    drugLibrary: 'oncology-v9'
  },
  {
    id: 'DEV-DIA-0027',
    serial: 'DIA-26-44C0-0027',
    model: 'RenalFlow HD90',
    family: 'dialysis',
    ward: 'Unidad de Diálisis',
    patient: 'NHC-100765432',
    status: 'online',
    firmware: '2.14.0',
    lastCalibration: '2026-04-04',
    nextCalibration: '2026-07-04',
    riskClass: 'III'
  },
  {
    id: 'DEV-SRG-0009',
    serial: 'SRG-25-11B7-0009',
    model: 'AstraCut Laparoscopy Tower',
    family: 'surgical',
    ward: 'Quirófano 3',
    status: 'maintenance',
    firmware: '6.2.3',
    lastCalibration: '2026-01-14',
    nextCalibration: '2026-06-12',
    riskClass: 'IIb'
  },
  {
    id: 'DEV-NUT-0061',
    serial: 'NUT-26-90F2-0061',
    model: 'NutriMix Compounder',
    family: 'nutrition',
    ward: 'Sala limpia Farmacia',
    status: 'online',
    firmware: '3.5.7',
    lastCalibration: '2026-05-22',
    nextCalibration: '2026-08-22',
    riskClass: 'IIa'
  }
]

export const THERAPY_ORDERS: TherapyOrder[] = [
  {
    id: 'ORD-77821',
    deviceId: 'DEV-INF-0142',
    drug: 'Noradrenalina',
    concentration: '8 mg / 250 ml',
    orderedRate: 18,
    maxRecommendedRate: 20,
    patientWeight: 72,
    status: 'active',
    orderedBy: 'Dr. R. Medina',
    cosignedBy: 'Nurse Lead M. Costa'
  },
  {
    id: 'ORD-77844',
    deviceId: 'DEV-INF-0188',
    drug: 'Citarabina',
    concentration: '100 mg / ml',
    orderedRate: 42,
    maxRecommendedRate: 35,
    patientWeight: 64,
    status: 'pending_review',
    orderedBy: 'Dr. L. Weber'
  }
]

export const SAFETY_NOTICES: SafetyNotice[] = [
  {
    id: 'FSN-2026-041',
    severity: 'critical',
    title: 'Deriva del sensor de presión de infusión por encima de 40 ml/h',
    affectedModels: ['InfuCare VP700'],
    publishedAt: '2026-06-02',
    dueAt: '2026-06-20',
    openDevices: 2,
    status: 'open'
  },
  {
    id: 'FSN-2026-032',
    severity: 'major',
    title: 'Lote de cartuchos de diálisis pendiente de inspección visual',
    affectedModels: ['RenalFlow HD90'],
    publishedAt: '2026-05-18',
    dueAt: '2026-06-30',
    openDevices: 1,
    status: 'in_progress'
  }
]
