export interface User {
  id: string
  dni: string
  name: string
  email: string
  birthDate: string
  nationality: string
  phone: string
  expedientNumber: string
  registeredAt: string
  titles: AcademicTitle[]
}

export interface AcademicTitle {
  id: string
  userId: string
  type: 'grado' | 'master' | 'doctorado' | 'diplomatura' | 'licenciatura' | 'fp'
  name: string
  university: string
  country: string
  year: number
  expedient: string
  status: 'verificado' | 'pendiente' | 'rechazado' | 'caducado'
  verificationDate?: string
  issueDate: string
  certCode: string
  honors?: string
}

export const REGISTERED_USERS: User[] = [
  {
    id: 'USR-00001',
    dni: '11223344-F',
    name: 'Sofía Morales Vargas',
    email: 'sofia.morales@correo.es',
    birthDate: '1995-03-12',
    nationality: 'Española',
    phone: '+34 611 234 567',
    expedientNumber: 'EXP-2026-00001',
    registeredAt: '2024-09-01',
    titles: [
      {
        id: 'TIT-00001',
        userId: 'USR-00001',
        type: 'grado',
        name: 'Grado en Ingeniería Informática',
        university: 'Universidad Politécnica de Madrid',
        country: 'España',
        year: 2018,
        expedient: 'UPM-INF-2018-04521',
        status: 'verificado',
        verificationDate: '2024-09-15',
        issueDate: '2018-07-10',
        certCode: 'CVS-2018-UPM-A82931',
      },
      {
        id: 'TIT-00002',
        userId: 'USR-00001',
        type: 'master',
        name: 'Máster en Ciberseguridad y Gestión de Riesgos',
        university: 'Universidad Carlos III de Madrid',
        country: 'España',
        year: 2020,
        expedient: 'UC3M-CS-2020-01188',
        status: 'verificado',
        verificationDate: '2024-09-15',
        issueDate: '2020-09-30',
        certCode: 'CVS-2020-UC3M-B55120',
        honors: 'Matrícula de Honor'
      }
    ]
  },
  {
    id: 'USR-00002',
    dni: '22334455-G',
    name: 'Daniel Herrero Fuentes',
    email: 'd.herrero@empresa.es',
    birthDate: '1988-07-23',
    nationality: 'Española',
    phone: '+34 622 345 678',
    expedientNumber: 'EXP-2026-00002',
    registeredAt: '2024-10-05',
    titles: [
      {
        id: 'TIT-00003',
        userId: 'USR-00002',
        type: 'licenciatura',
        name: 'Licenciatura en Derecho',
        university: 'Universidad Complutense de Madrid',
        country: 'España',
        year: 2013,
        expedient: 'UCM-DER-2013-07834',
        status: 'verificado',
        verificationDate: '2024-10-20',
        issueDate: '2013-06-28',
        certCode: 'CVS-2013-UCM-C11209',
      },
      {
        id: 'TIT-00004',
        userId: 'USR-00002',
        type: 'master',
        name: 'Máster en Derecho Digital y Nuevas Tecnologías',
        university: 'IE Law School',
        country: 'España',
        year: 2016,
        expedient: 'IELW-TEC-2016-00390',
        status: 'verificado',
        verificationDate: '2024-10-20',
        issueDate: '2016-11-15',
        certCode: 'CVS-2016-IELW-D07821',
      }
    ]
  },
  {
    id: 'USR-00003',
    dni: '33445566-H',
    name: 'Valentina Castro Ríos',
    email: 'vcastro@universidad.es',
    birthDate: '2000-11-04',
    nationality: 'Colombiana',
    phone: '+34 633 456 789',
    expedientNumber: 'EXP-2026-00003',
    registeredAt: '2025-02-14',
    titles: [
      {
        id: 'TIT-00005',
        userId: 'USR-00003',
        type: 'grado',
        name: 'Grado en Administración y Dirección de Empresas',
        university: 'Universidad de los Andes',
        country: 'Colombia',
        year: 2022,
        expedient: 'UANDES-ADE-2022-09123',
        status: 'pendiente',
        issueDate: '2022-12-15',
        certCode: 'CVS-2022-UAND-E44512',
      }
    ]
  },
  {
    id: 'USR-00004',
    dni: '44556677-I',
    name: 'Marcos Alonso Prieto',
    email: 'malonso@correo.com',
    birthDate: '1982-05-19',
    nationality: 'Española',
    phone: '+34 644 567 890',
    expedientNumber: 'EXP-2026-00004',
    registeredAt: '2025-06-20',
    titles: [
      {
        id: 'TIT-00006',
        userId: 'USR-00004',
        type: 'doctorado',
        name: 'Doctor en Física de Partículas',
        university: 'Universidad Autónoma de Barcelona',
        country: 'España',
        year: 2010,
        expedient: 'UAB-FIS-2010-00334',
        status: 'verificado',
        verificationDate: '2025-07-01',
        issueDate: '2010-03-22',
        certCode: 'CVS-2010-UAB-F00334',
        honors: 'Cum Laude'
      }
    ]
  }
]

export const CURRENT_USER = REGISTERED_USERS[0]

// Array plano de todos los títulos (para búsqueda cross-usuario)
export const ACADEMIC_TITLES: AcademicTitle[] = REGISTERED_USERS.flatMap(u => u.titles)
