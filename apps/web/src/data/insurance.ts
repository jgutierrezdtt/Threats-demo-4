export interface AddOn {
  id: string
  name: string
  price: number
}

export interface InsuranceProduct {
  id: string
  name: string
  category: 'salud' | 'hogar' | 'auto' | 'vida' | 'dental'
  tagline: string
  description: string
  basePrice: number
  features: string[]
  coverages: string[]
  addOns: AddOn[]
  popular: boolean
  coverageLimit: number
}

export interface PolicyQuote {
  productId: string
  holderName: string
  holderDni: string
  holderDob: string
  holderEmail: string
  holderPhone: string
  address?: string
  vehiclePlate?: string
  vehicleValue?: number
  vehicleYear?: number
  smoker?: boolean
  capital?: number
  factors: QuoteFactor[]
  basePrice: number
  finalPrice: number
  discount: number
  startDate: string
  paymentMode: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  promoCode?: string
}

export interface QuoteFactor {
  key: string
  label: string
  value: number | boolean | string
  priceImpact: number
  description: string
}

export interface Policy {
  id: string
  number: string
  product: string
  productName: string
  category: string
  holderName: string
  startDate: string
  endDate: string
  premium: number
  monthlyPremium: number
  paymentMode: string
  status: 'activa' | 'suspendida' | 'vencida' | 'tramitacion'
  coverages: Coverage[]
  documents: string[]
}

export interface Coverage {
  name: string
  limit: string
  included: boolean
}

export interface Claim {
  id: string
  policyId: string
  description: string
  date: string
  status: 'pendiente' | 'en_revision' | 'aprobado' | 'rechazado' | 'pagado'
  amount?: number
  type: string
}

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: 'SALUD-PLUS',
    name: 'Salud Completo Plus',
    category: 'salud',
    tagline: 'Cobertura total sin copago con los mejores especialistas',
    description: 'La cobertura más completa del mercado, sin copagos y con acceso a más de 15.000 especialistas.',
    basePrice: 89.90,
    coverageLimit: 600000,
    popular: true,
    features: ['Sin copago en consultas', 'Cuadro médico 15.000+ especialistas', 'Urgencias 24h', 'Hospitalización privada', 'Pruebas diagnósticas', 'Segunda opinión médica'],
    coverages: ['Consultas especialistas', 'Hospitalización', 'Urgencias 24h', 'Pruebas diagnósticas', 'Cirugía ambulatoria'],
    addOns: [
      { id: 'dental', name: 'Módulo Dental', price: 8.50 },
      { id: 'psicologia', name: 'Psicología clínica', price: 6.00 },
      { id: 'fisio', name: 'Fisioterapia', price: 7.50 },
    ]
  },
  {
    id: 'SALUD-ECO',
    name: 'Salud Esencial',
    category: 'salud',
    tagline: 'Asistencia sanitaria de calidad al mejor precio',
    description: 'Cobertura sanitaria esencial con copago reducido y amplia red de especialistas.',
    basePrice: 39.90,
    coverageLimit: 300000,
    popular: false,
    features: ['Copago reducido €5/consulta', '8.000 especialistas', 'Urgencias 24h', 'Hospitalización básica'],
    coverages: ['Consultas con copago', 'Urgencias 24h', 'Hospitalización básica'],
    addOns: [
      { id: 'dental', name: 'Módulo Dental', price: 8.50 },
    ]
  },
  {
    id: 'HOGAR-TOTAL',
    name: 'Hogar Total',
    category: 'hogar',
    tagline: 'Protege tu vivienda de todos los imprevistos',
    description: 'Protección integral para tu hogar: daños, robo, responsabilidad civil y asistencia 24h.',
    basePrice: 22.50,
    coverageLimit: 120000,
    popular: true,
    features: ['Daños por agua e incendio', 'Robo y vandalismo', 'Responsabilidad civil 300k€', 'Asistencia 24h hogar', 'Lluvia y granizo', 'Daños eléctricos'],
    coverages: ['Daños por agua', 'Incendio y explosión', 'Robo y expoliación', 'Responsabilidad civil'],
    addOns: [
      { id: 'electrodomesticos', name: 'Protección electrodomésticos', price: 4.00 },
      { id: 'joyas', name: 'Joyas y objetos de valor', price: 5.50 },
    ]
  },
  {
    id: 'AUTO-COMPLETO',
    name: 'Auto Todo Riesgo',
    category: 'auto',
    tagline: 'Protección total para tu vehículo',
    description: 'Cobertura todo riesgo sin franquicia con asistencia en carretera 24h.',
    basePrice: 54.00,
    coverageLimit: 50000,
    popular: false,
    features: ['Daños propios sin franquicia', 'Terceros ampliado', 'Robo total y parcial', 'Asistencia en carretera 24h', 'Vehículo sustitución', 'Defensa jurídica'],
    coverages: ['Daños propios', 'Terceros ampliado', 'Robo', 'Asistencia 24h'],
    addOns: [
      { id: 'cristales', name: 'Cristales y óptica', price: 3.00 },
      { id: 'ocupantes', name: 'Accidentes ocupantes', price: 4.50 },
    ]
  },
  {
    id: 'VIDA-FAMILIAR',
    name: 'Vida y Familia',
    category: 'vida',
    tagline: 'Protege el futuro de los que más quieres',
    description: 'Capital asegurado para fallecimiento e invalidez con cobertura de enfermedades graves.',
    basePrice: 18.00,
    coverageLimit: 250000,
    popular: false,
    features: ['Capital en caso de fallecimiento', 'Invalidez permanente', 'Enfermedades graves', 'Doble capital accidente', 'Beneficiarios personalizables'],
    coverages: ['Fallecimiento', 'Invalidez permanente', 'Enfermedades graves'],
    addOns: [
      { id: 'invalidez-total', name: 'Invalidez absoluta extra', price: 5.00 },
    ]
  },
  {
    id: 'DENTAL-PREMIUM',
    name: 'Dental Premium',
    category: 'dental',
    tagline: 'Sonríe sin límites con las mejores clínicas dentales',
    description: 'Revisiones, empastes y ortodoncia en más de 200 clínicas dentales en España.',
    basePrice: 12.90,
    coverageLimit: 5000,
    popular: false,
    features: ['Revisiones y limpiezas gratuitas', 'Empastes sin coste', 'Ortodoncia con descuento 40%', 'Implantes con descuento 30%', '+200 clínicas en España'],
    coverages: ['Revisiones anuales', 'Empastes', 'Extracciones', 'Ortodoncia (40% dto.)'],
    addOns: [
      { id: 'implantes', name: 'Implantes (descuento extra)', price: 4.00 },
    ]
  }
]

export const PROMO_CODES: Record<string, { discount: number; description: string }> = {
  'VERANO26':   { discount: 15, description: 'Descuento de verano 2026' },
  'NUEVO50':    { discount: 50, description: 'Bienvenida nuevos clientes' },
  'VIP2026':    { discount: 30, description: 'Cliente VIP 2026' },
  'FAMILIA':    { discount: 20, description: 'Plan familiar' },
  'ONLINE10':   { discount: 10, description: 'Contratación online' },
  'FIDELIDAD':  { discount: 25, description: 'Programa fidelización' },
  'EMPLEADO40': { discount: 40, description: 'Empleados del grupo' },
}

export const SAMPLE_POLICIES: Policy[] = [
  {
    id: 'POL-001',
    number: '2024-SAL-78432',
    product: 'SALUD-PLUS',
    productName: 'Salud Completo Plus',
    category: 'salud',
    holderName: 'Alejandro Torres Vidal',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    premium: 89.90,
    monthlyPremium: 89.90,
    paymentMode: 'mensual',
    status: 'activa',
    documents: ['Poliza_2024-SAL-78432.pdf', 'Condiciones_Generales_Salud.pdf'],
    coverages: [
      { name: 'Consultas especialistas', limit: 'Ilimitado', included: true },
      { name: 'Hospitalización', limit: '600.000€/año', included: true },
      { name: 'Urgencias 24h', limit: 'Ilimitado', included: true },
      { name: 'Pruebas diagnósticas', limit: '5.000€/año', included: true },
      { name: 'Cirugía ambulatoria', limit: '30.000€/año', included: true },
      { name: 'Odontología básica', limit: 'No incluida', included: false },
    ]
  },
  {
    id: 'POL-002',
    number: '2025-HOG-22119',
    product: 'HOGAR-TOTAL',
    productName: 'Hogar Total',
    category: 'hogar',
    holderName: 'Alejandro Torres Vidal',
    startDate: '2025-03-15',
    endDate: '2026-03-14',
    premium: 22.50,
    monthlyPremium: 22.50,
    paymentMode: 'anual',
    status: 'activa',
    documents: ['Poliza_2025-HOG-22119.pdf'],
    coverages: [
      { name: 'Daños por agua', limit: '30.000€', included: true },
      { name: 'Incendio y explosión', limit: '120.000€', included: true },
      { name: 'Robo y expoliación', limit: '15.000€', included: true },
      { name: 'Responsabilidad civil', limit: '300.000€', included: true },
      { name: 'Daños estéticos', limit: 'No incluido', included: false },
    ]
  }
]

export const SAMPLE_CLAIMS: Claim[] = [
  {
    id: 'SIN-2025-001244',
    policyId: 'POL-002',
    description: 'Rotura de tubería en baño principal con daños en suelo y pared',
    date: '2025-11-18',
    status: 'pagado',
    amount: 1840,
    type: 'Daños por agua'
  },
  {
    id: 'SIN-2026-000387',
    policyId: 'POL-001',
    description: 'Intervención quirúrgica hernia inguinal - Hospital Quirónsalud Madrid',
    date: '2026-02-20',
    status: 'aprobado',
    amount: 4200,
    type: 'Cirugía'
  }
]
