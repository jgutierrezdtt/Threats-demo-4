export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeShield: string
  awayShield: string
  competition: string
  date: string
  time: string
  stadium: string
  city: string
  categories: MatchCategory[]
  sociOnly: boolean
  sociToken: string
  status: 'available' | 'almostSold' | 'soldOut'
}

export interface MatchCategory {
  name: string
  price: number
  available: number
  total: number
  description: string
}

export interface Ticket {
  id: string
  matchId: string
  match: string
  date: string
  stadium: string
  seat: string
  category: string
  price: number
  buyerEmail: string
  code: string
  status: 'valid' | 'used' | 'refunded'
}

export const MATCHES: Match[] = [
  {
    id: 'RM-FCB-001',
    homeTeam: 'Real Madrid CF',
    awayTeam: 'FC Barcelona',
    homeShield: '⚪',
    awayShield: '🔵',
    competition: 'LaLiga EA Sports',
    date: '2026-05-24',
    time: '21:00',
    stadium: 'Santiago Bernabéu',
    city: 'Madrid',
    sociOnly: true,
    sociToken: 'soci-rm-fcb-2026-clásico',
    status: 'almostSold',
    categories: [
      { name: 'Grada Norte Animación', price: 75,  available: 120, total: 2400, description: 'Zona de animación, ambiente intenso' },
      { name: 'Tribuna Lateral',        price: 140, available: 80,  total: 8000, description: 'Visibilidad lateral media' },
      { name: 'Tribuna Preferente',     price: 220, available: 35,  total: 3500, description: 'Visibilidad preferente' },
      { name: 'Palco VIP',              price: 490, available: 12,  total: 400,  description: 'Palco con catering incluido' },
    ]
  },
  {
    id: 'ATM-SEV-002',
    homeTeam: 'Atlético de Madrid',
    awayTeam: 'Sevilla FC',
    homeShield: '🔴',
    awayShield: '⚪',
    competition: 'LaLiga EA Sports',
    date: '2026-05-30',
    time: '20:00',
    stadium: 'Cívitas Metropolitano',
    city: 'Madrid',
    sociOnly: false,
    sociToken: '',
    status: 'available',
    categories: [
      { name: 'Fondo',             price: 45,  available: 600, total: 4000, description: 'Gradas de fondo, bulliciosas' },
      { name: 'Lateral Baja',      price: 85,  available: 340, total: 6000, description: 'Lateral sector bajo' },
      { name: 'Lateral Alta',      price: 65,  available: 280, total: 5000, description: 'Lateral sector alto' },
      { name: 'Preferente',        price: 160, available: 90,  total: 2000, description: 'Visión central superior' },
    ]
  },
  {
    id: 'VCF-VIL-003',
    homeTeam: 'Valencia CF',
    awayTeam: 'Villarreal CF',
    homeShield: '🦇',
    awayShield: '🟡',
    competition: 'LaLiga EA Sports',
    date: '2026-06-07',
    time: '18:30',
    stadium: 'Mestalla',
    city: 'Valencia',
    sociOnly: false,
    sociToken: '',
    status: 'available',
    categories: [
      { name: 'Fondos',            price: 38,  available: 900, total: 5000, description: 'Gradas fondos' },
      { name: 'Lateral General',   price: 65,  available: 550, total: 7000, description: 'Visibilidad lateral' },
      { name: 'Preferente',        price: 110, available: 200, total: 2500, description: 'Vista central' },
    ]
  },
  {
    id: 'RBE-RMA-004',
    homeTeam: 'Real Betis',
    awayTeam: 'Real Madrid CF',
    homeShield: '🟢',
    awayShield: '⚪',
    competition: 'Copa del Rey',
    date: '2026-06-14',
    time: '21:30',
    stadium: 'Estadio Benito Villamarín',
    city: 'Sevilla',
    sociOnly: true,
    sociToken: 'soci-betis-copa-semifinal',
    status: 'almostSold',
    categories: [
      { name: 'Fondo Gol Norte',   price: 55,  available: 80,  total: 2000, description: 'Fondo norte exclusivo' },
      { name: 'General',           price: 90,  available: 45,  total: 5000, description: 'General' },
      { name: 'VIP Acceso Especial',price: 380, available: 8,   total: 200,  description: 'Con hospitalidad' },
    ]
  },
  {
    id: 'FCB-AJX-005',
    homeTeam: 'FC Barcelona',
    awayTeam: 'Ajax Amsterdam',
    homeShield: '🔵',
    awayShield: '⚫',
    competition: 'UEFA Champions League',
    date: '2026-06-21',
    time: '21:00',
    stadium: 'Estadi Olímpic Lluís Companys',
    city: 'Barcelona',
    sociOnly: true,
    sociToken: 'soci-fcb-ucl-semis-2026',
    status: 'almostSold',
    categories: [
      { name: 'Gol Sur',           price: 95,  available: 50,  total: 3000, description: 'Gol sur animación' },
      { name: 'Lateral',           price: 165, available: 30,  total: 6000, description: 'Lateral' },
      { name: 'Tribuna',           price: 280, available: 15,  total: 2500, description: 'Tribuna central' },
      { name: 'Business Club',     price: 650, available: 5,   total: 300,  description: 'Business con catering y parking' },
    ]
  },
  {
    id: 'OSA-GIR-006',
    homeTeam: 'CA Osasuna',
    awayTeam: 'Girona FC',
    homeShield: '🔴',
    awayShield: '🟥',
    competition: 'LaLiga EA Sports',
    date: '2026-07-05',
    time: '19:00',
    stadium: 'El Sadar',
    city: 'Pamplona',
    sociOnly: false,
    sociToken: '',
    status: 'available',
    categories: [
      { name: 'General',           price: 28,  available: 1200, total: 4000, description: 'General' },
      { name: 'Preferente',        price: 55,  available: 400,  total: 2000, description: 'Preferente' },
    ]
  }
]

export const SAMPLE_TICKETS: Ticket[] = [
  {
    id: 'TK-2026-89412',
    matchId: 'ATM-SEV-002',
    match: 'Atlético de Madrid vs Sevilla FC',
    date: '2026-05-30 · 20:00h',
    stadium: 'Cívitas Metropolitano, Madrid',
    seat: 'Sec. G3 · Fila 12 · Asiento 44',
    category: 'Lateral Baja',
    price: 85,
    buyerEmail: 'usuario@ejemplo.es',
    code: 'ATM24-G3-1244-X7Q9',
    status: 'valid'
  },
  {
    id: 'TK-2026-67223',
    matchId: 'VCF-VIL-003',
    match: 'Valencia CF vs Villarreal CF',
    date: '2026-06-07 · 18:30h',
    stadium: 'Mestalla, Valencia',
    seat: 'Sec. P1 · Fila 5 · Asiento 18',
    category: 'Preferente',
    price: 110,
    buyerEmail: 'usuario@ejemplo.es',
    code: 'VCF24-P1-0518-B3M2',
    status: 'valid'
  }
]
