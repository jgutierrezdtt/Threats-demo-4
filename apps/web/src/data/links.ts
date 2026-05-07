export interface LinkPost {
  id: string
  userId: string
  title: string
  url: string
  description: string
  tags: string[]
  category: string
  clicks: number
  createdAt: string
  updatedAt: string
  isPublic: boolean
  aiSuggested: boolean
  thumbnail?: string
  platform?: string
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string
  avatar: string
  links: LinkPost[]
  followers: number
  views: number
  plan: 'free' | 'pro' | 'business'
}

export const CATEGORIES = ['Tecnología', 'Diseño', 'Marketing', 'Negocios', 'Salud', 'Educación', 'Entretenimiento', 'Noticias', 'Recursos', 'Otro']

export const ALL_USER_LINKS: LinkPost[] = [
  {
    id: 'lnk-001',
    userId: 'user-me',
    title: 'Mi portafolio de proyectos',
    url: 'https://portafolio.ejemplo.es',
    description: 'Proyectos de desarrollo web y móvil que he creado',
    tags: ['portafolio', 'desarrollo', 'web'],
    category: 'Tecnología',
    clicks: 342,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-04-20T08:30:00Z',
    isPublic: true,
    aiSuggested: false,
    platform: 'Web'
  },
  {
    id: 'lnk-002',
    userId: 'user-me',
    title: 'Canal de YouTube — Tutoriales Dev',
    url: 'https://youtube.com/@devtutoriales-ejemplo',
    description: 'Tutoriales semanales de React, TypeScript y arquitectura',
    tags: ['youtube', 'tutoriales', 'react'],
    category: 'Educación',
    clicks: 1204,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-05-01T12:00:00Z',
    isPublic: true,
    aiSuggested: false,
    platform: 'YouTube'
  },
  {
    id: 'lnk-003',
    userId: 'user-me',
    title: 'Newsletter semanal de tecnología',
    url: 'https://newsletter.ejemplo.es/suscribirse',
    description: 'Cada viernes curado de las mejores noticias de tech',
    tags: ['newsletter', 'tecnologia'],
    category: 'Noticias',
    clicks: 567,
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-05-03T09:15:00Z',
    isPublic: true,
    aiSuggested: true,
    platform: 'Email'
  },
  {
    id: 'lnk-004',
    userId: 'user-me',
    title: 'Última publicación en Blog',
    url: 'https://blog.ejemplo.es/arquitectura-microservicios-2026',
    description: 'Análisis profundo de patrones de microservicios modernos',
    tags: ['blog', 'microservicios', 'arquitectura'],
    category: 'Tecnología',
    clicks: 891,
    createdAt: '2026-04-22T14:00:00Z',
    updatedAt: '2026-04-22T14:00:00Z',
    isPublic: true,
    aiSuggested: false,
    platform: 'Blog'
  },
  {
    id: 'lnk-005',
    userId: 'user-me',
    title: 'Libro recomendado: Clean Architecture',
    url: 'https://amzn.to/clean-arch-ejemplo',
    description: 'Mi recomendación de lectura del mes de mayo',
    tags: ['libro', 'arquitectura', 'recomendacion'],
    category: 'Recursos',
    clicks: 223,
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
    isPublic: false,
    aiSuggested: true,
    platform: 'Amazon'
  },
  // Otros usuarios
  {
    id: 'lnk-006',
    userId: 'user-b',
    title: 'Tienda online de diseño gráfico',
    url: 'https://tienda.disenoejemplo.es',
    description: 'Plantillas y recursos de diseño premium',
    tags: ['diseño', 'tienda', 'recursos'],
    category: 'Diseño',
    clicks: 2891,
    createdAt: '2025-12-01T08:00:00Z',
    updatedAt: '2026-04-15T16:00:00Z',
    isPublic: true,
    aiSuggested: false,
    platform: 'Shopify'
  },
  {
    id: 'lnk-007',
    userId: 'user-c',
    title: 'Consultoría estrategia digital',
    url: 'https://consultor.ejemplo.es/contacto',
    description: 'Reserva una sesión de estrategia gratuita',
    tags: ['consultoría', 'marketing', 'estrategia'],
    category: 'Negocios',
    clicks: 455,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-03-28T11:00:00Z',
    isPublic: true,
    aiSuggested: false,
    platform: 'Calendly'
  },
  {
    id: 'lnk-008',
    userId: 'user-d',
    title: 'Podcast Empresa y Bienestar',
    url: 'https://spotify.com/podcast/ejemplo',
    description: 'Conversaciones sobre salud mental en el trabajo',
    tags: ['podcast', 'bienestar', 'empresa'],
    category: 'Salud',
    clicks: 1678,
    createdAt: '2026-02-14T09:00:00Z',
    updatedAt: '2026-05-02T12:00:00Z',
    isPublic: true,
    aiSuggested: false,
    platform: 'Spotify'
  }
]

export const AI_SUGGESTIONS = [
  { id: 'ai-1', title: 'Agrega tu perfil de LinkedIn', description: 'Los creadores de tecnología que añaden LinkedIn incrementan su tasa de conversión un 34%', category: 'Tecnología', url: 'https://linkedin.com', tags: ['linkedin', 'networking', 'profesional'] },
  { id: 'ai-2', title: 'Comparte tus últimas estadísticas de GitHub', description: 'Tus publicaciones de tecnología tienen alta tasa de clics — el contenido técnico de GitHub convierte bien', category: 'Tecnología', url: 'https://github.com', tags: ['github', 'opensource', 'codigo'] },
  { id: 'ai-3', title: 'Añade un link a tu Calendly', description: 'Basado en el patrón de tus seguidores, muchos visitan perfiles de consultoría', category: 'Negocios', url: 'https://calendly.com', tags: ['reuniones', 'agenda', 'consultoría'] },
  { id: 'ai-4', title: 'Incluye el link a tu repositorio principal', description: 'Contenido de código abierto en tu categoría genera 2.1x más clics', category: 'Recursos', url: 'https://github.com', tags: ['repo', 'open-source'] },
  { id: 'ai-5', title: 'Agrega link a tu tienda de recursos digitales', description: 'Tu audiencia tiene perfil de comprador de recursos educativos premium', category: 'Educación', url: 'https://gumroad.com', tags: ['recursos', 'digital', 'educacion'] },
]

export const ANALYTICS_DATA = {
  totalClicks: 3227,
  uniqueVisitors: 1845,
  ctr: 4.2,
  weeklyClicks: [
    { week: 'Sem 1', clicks: 180 },
    { week: 'Sem 2', clicks: 220 },
    { week: 'Sem 3', clicks: 195 },
    { week: 'Sem 4', clicks: 310 },
    { week: 'Sem 5', clicks: 275 },
    { week: 'Sem 6', clicks: 388 },
    { week: 'Sem 7', clicks: 420 },
  ],
  topLinks: ['lnk-002', 'lnk-004', 'lnk-001'],
  sources: [
    { name: 'Instagram', pct: 38 },
    { name: 'Twitter/X', pct: 28 },
    { name: 'LinkedIn', pct: 18 },
    { name: 'Directo', pct: 12 },
    { name: 'Otros', pct: 4 },
  ],
  countries: [
    { country: 'España', flag: '🇪🇸', pct: 62 },
    { country: 'México', flag: '🇲🇽', pct: 14 },
    { country: 'Argentina', flag: '🇦🇷', pct: 10 },
    { country: 'Colombia', flag: '🇨🇴', pct: 8 },
    { country: 'Otros', flag: '🌍', pct: 6 },
  ],
  deviceBreakdown: { 'Móvil': 68, 'Escritorio': 24, 'Tablet': 8 },
}
