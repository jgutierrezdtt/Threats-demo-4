export interface Patient {
  id: string
  nhc: string
  name: string
  dob: string
  age: number
  dni: string
  gender: 'M' | 'F'
  bloodType: string
  allergies: string[]
  diagnoses: Diagnosis[]
  medications: Medication[]
  assignedDoctor: string
  ward: string
  admissionDate?: string
  phone: string
  address: string
  emergencyContact: string
}

export interface Diagnosis {
  code: string
  description: string
  date: string
  severity: 'leve' | 'moderado' | 'grave' | 'crítico'
  notes: string
}

export interface Medication {
  name: string
  dose: string
  frequency: string
  since: string
  prescribedBy: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
}

export const PATIENTS: Patient[] = [
  {
    id: 'PAT-001',
    nhc: '100234567',
    name: 'María González Rodríguez',
    dob: '1968-04-15',
    age: 58,
    dni: '12345678-A',
    gender: 'F',
    bloodType: 'A+',
    phone: '+34 612 345 678',
    address: 'C/ Mayor 23, 3º A, 28001 Madrid',
    emergencyContact: 'Pedro González (hijo) — +34 698 111 222',
    allergies: ['Penicilina', 'AAS'],
    assignedDoctor: 'Dr. Javier Moreno López',
    ward: 'Cardiología - Planta 4',
    admissionDate: '2026-04-28',
    diagnoses: [
      { code: 'I25.10', description: 'Enfermedad coronaria sin angina', date: '2026-04-28', severity: 'moderado', notes: 'Estenosis LAD 65%. Pendiente revisión intervencionista.' },
      { code: 'E11.9',  description: 'Diabetes mellitus tipo 2 sin complicaciones', date: '2023-06-10', severity: 'moderado', notes: 'HbA1c 7.8 en última revisión. Control con metformina.' },
      { code: 'I10',    description: 'Hipertensión arterial esencial', date: '2018-02-22', severity: 'leve', notes: 'Controlada con Losartán 50mg/día.' },
    ],
    medications: [
      { name: 'Metformina 850mg', dose: '850mg', frequency: '2 veces/día', since: '2023-06-15', prescribedBy: 'Dra. Ana Ruiz' },
      { name: 'Losartán',        dose: '50mg',  frequency: '1 vez/día',    since: '2018-03-01', prescribedBy: 'Dr. Luis Sanz' },
      { name: 'Atorvastatina',   dose: '40mg',  frequency: '1 vez/noche',  since: '2026-04-28', prescribedBy: 'Dr. Javier Moreno López' },
      { name: 'AAS',             dose: '100mg', frequency: '1 vez/día',    since: '2026-04-28', prescribedBy: 'Dr. Javier Moreno López' },
    ]
  },
  {
    id: 'PAT-002',
    nhc: '100765432',
    name: 'Carlos Pérez Martínez',
    dob: '1952-11-30',
    age: 73,
    dni: '87654321-B',
    gender: 'M',
    bloodType: 'O-',
    phone: '+34 634 567 890',
    address: 'Av. Libertad 7, 1º B, 41001 Sevilla',
    emergencyContact: 'Lucía Pérez (hija) — +34 677 888 999',
    allergies: ['Sulfamidas', 'Contraste yodado'],
    assignedDoctor: 'Dra. Carmen Vega Ruiz',
    ward: 'Neurología - Planta 5',
    admissionDate: '2026-05-01',
    diagnoses: [
      { code: 'G35',   description: 'Esclerosis múltiple', date: '2015-09-14', severity: 'grave', notes: 'Forma remitente-recurrente. En tratamiento con interferón beta-1a.' },
      { code: 'M81.0', description: 'Osteoporosis postmenopáusica', date: '2020-03-08', severity: 'leve', notes: 'T-Score -2.8. Calcio y vitamina D.' },
    ],
    medications: [
      { name: 'Interferón beta-1a', dose: '30mcg', frequency: 'Semanal IM', since: '2016-01-10', prescribedBy: 'Dra. Carmen Vega Ruiz' },
      { name: 'Calcio + Vitamina D3', dose: '1000mg/800UI', frequency: '1 vez/día', since: '2020-03-15', prescribedBy: 'Dra. Pilar Torres' },
      { name: 'Baclofeno', dose: '10mg', frequency: '3 veces/día', since: '2021-07-22', prescribedBy: 'Dra. Carmen Vega Ruiz' },
    ]
  },
  {
    id: 'PAT-003',
    nhc: '100399111',
    name: 'Elena Navarro Castillo',
    dob: '1990-07-22',
    age: 35,
    dni: '33445566-C',
    gender: 'F',
    bloodType: 'B+',
    phone: '+34 655 321 099',
    address: 'C/ Ronda 88, 5º C, 08001 Barcelona',
    emergencyContact: 'Marcos Navarro (hermano) — +34 611 000 111',
    allergies: ['Látex'],
    assignedDoctor: 'Dr. Roberto Fuentes Díaz',
    ward: 'Oncología - Planta 6',
    admissionDate: '2026-04-10',
    diagnoses: [
      { code: 'C50.9', description: 'Carcinoma de mama sin especificación', date: '2026-02-14', severity: 'grave', notes: 'Estadio IIA. ER+/PR+/HER2-. Protocolo TC x4 iniciado.' },
      { code: 'F32.1', description: 'Episodio depresivo moderado', date: '2026-03-01', severity: 'moderado', notes: 'Iniciado tras diagnóstico oncológico. Apoyo psicológico y farmacológico.' },
    ],
    medications: [
      { name: 'Docetaxel', dose: '75mg/m²', frequency: 'Cada 21 días IV', since: '2026-03-05', prescribedBy: 'Dr. Roberto Fuentes Díaz' },
      { name: 'Ciclofosfamida', dose: '600mg/m²', frequency: 'Cada 21 días IV', since: '2026-03-05', prescribedBy: 'Dr. Roberto Fuentes Díaz' },
      { name: 'Sertralina', dose: '50mg', frequency: '1 vez/día', since: '2026-03-02', prescribedBy: 'Dra. Sara Lozano' },
    ]
  },
  {
    id: 'PAT-004',
    nhc: '100455891',
    name: 'Antonio Jiménez García',
    dob: '1975-03-08',
    age: 51,
    dni: '55667788-D',
    gender: 'M',
    bloodType: 'AB+',
    phone: '+34 622 456 789',
    address: 'Pza. España 4, 2º D, 50001 Zaragoza',
    emergencyContact: 'Rosa Jiménez (esposa) — +34 616 777 888',
    allergies: [],
    assignedDoctor: 'Dr. Javier Moreno López',
    ward: 'Traumatología - Planta 3',
    admissionDate: '2026-05-03',
    diagnoses: [
      { code: 'M16.1', description: 'Coxartrosis primaria unilateral', date: '2024-11-20', severity: 'moderado', notes: 'Cadera derecha. Indicación quirúrgica. Prótesis total programada.' },
      { code: 'E66.9', description: 'Obesidad sin especificación', date: '2022-01-10', severity: 'moderado', notes: 'IMC 33.2. Dieta y ejercicio pautados.' },
    ],
    medications: [
      { name: 'Ibuprofeno', dose: '600mg', frequency: 'Cada 8h con alimentos', since: '2024-12-01', prescribedBy: 'Dr. Javier Moreno López' },
      { name: 'Omeprazol',  dose: '20mg',  frequency: '1 vez/día en ayunas',   since: '2024-12-01', prescribedBy: 'Dr. Javier Moreno López' },
    ]
  },
  {
    id: 'PAT-005',
    nhc: '100588234',
    name: 'Laura Blanco Serrano',
    dob: '2001-12-05',
    age: 24,
    dni: '77889900-E',
    gender: 'F',
    bloodType: 'A-',
    phone: '+34 699 012 345',
    address: 'C/ Las Flores 15, 4º A, 18001 Granada',
    emergencyContact: 'Inés Blanco (madre) — +34 666 333 444',
    allergies: ['Amoxicilina', 'Ibuprofeno'],
    assignedDoctor: 'Dra. Carmen Vega Ruiz',
    ward: 'Medicina Interna - Planta 2',
    admissionDate: '2026-05-06',
    diagnoses: [
      { code: 'K50.0', description: 'Enfermedad de Crohn del intestino delgado', date: '2022-08-30', severity: 'moderado', notes: 'Brote activo leve-moderado. Colonoscopia pendiente.' },
      { code: 'D50.9', description: 'Anemia por déficit de hierro sin especificación', date: '2026-05-06', severity: 'leve', notes: 'Hemoglobina 9.8 g/dL. Ferritina 8. Hierro IV pautado.' },
    ],
    medications: [
      { name: 'Azatioprina', dose: '100mg', frequency: '1 vez/día', since: '2022-10-15', prescribedBy: 'Dr. Hugo Palacios' },
      { name: 'Mesalazina',  dose: '800mg', frequency: '3 veces/día', since: '2022-09-01', prescribedBy: 'Dr. Hugo Palacios' },
      { name: 'Hierro sacarato IV', dose: '200mg', frequency: 'Según pauta', since: '2026-05-07', prescribedBy: 'Dra. Carmen Vega Ruiz' },
    ]
  }
]

export const RAG_RESPONSES: Record<string, string[]> = {
  alergia: [
    'Según los registros disponibles, la paciente María González presenta alergia documentada a **Penicilina** y **AAS** (ácido acetilsalicílico).',
    'El paciente Carlos Pérez tiene reacciones adversas registradas a **Sulfamidas** y **Contraste yodado**. Se debe evitar cualquier procedimiento con contraste sin premedicación.',
  ],
  medicacion: [
    'El paciente está recibiendo **Metformina 850mg** dos veces al día, **Losartán 50mg** una vez al día y **Atorvastatina 40mg** nocturna.',
    'El tratamiento actual incluye **Interferón beta-1a 30mcg** semanal intramuscular más **Baclofeno 10mg** tres veces al día.',
  ],
  diagnostico: [
    'El diagnóstico principal registrado es **I25.10 - Enfermedad coronaria sin angina** con estenosis LAD del 65%. Diagnósticos secundarios: DM2 e HTA.',
    'Diagnóstico principal: **G35 - Esclerosis múltiple** forma remitente-recurrente. Evolución desde 2015.',
  ],
  generico: [
    'He consultado todos los expedientes disponibles. Los datos indican que actualmente hay **5 pacientes ingresados** con diagnósticos activos. ¿Desea que filtre por planta, diagnóstico o médico responsable?',
    'Según los registros de todos los pacientes, los diagnósticos más frecuentes en cartera actual son: enfermedades cardiovasculares (40%), neurológicas (20%) y oncológicas (20%).',
    'En la unidad de Oncología, la paciente Elena Navarro (NHC 100399111) está en el **ciclo 3 de TC** para carcinoma de mama ER+/PR+. El siguiente ciclo está previsto para el día 26.',
  ]
}
