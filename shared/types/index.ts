// Competentie als const object + type (geen enum vanwege erasableSyntaxOnly in client)
export const Competentie = {
  KWALITEITEN: 'KWALITEITEN',
  MOTIEVEN: 'MOTIEVEN',
  WERK: 'WERK',
  STURING: 'STURING',
  NETWERKEN: 'NETWERKEN',
} as const

export type Competentie = (typeof Competentie)[keyof typeof Competentie]

export const GeslotenVraagType = {
  WAAR_NIET_WAAR: 'WAAR_NIET_WAAR',
  VIER_OPTIES: 'VIER_OPTIES',
} as const

export type GeslotenVraagType =
  (typeof GeslotenVraagType)[keyof typeof GeslotenVraagType]

export type CorrectAntwoord = 'A' | 'B' | 'C' | 'D'

// --- Entiteiten ---

export interface User {
  id: number
  naam: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface VragenSet {
  id: number
  label: string
  userId: number
  shareToken: string | null
  createdAt: string
  updatedAt: string
}

export interface Vraag {
  id: number
  vraagTekst: string
  competentie: Competentie
  tijdSeconden: number
  vragenSetId: number
  createdAt: string
  updatedAt: string
}

export interface GeslotenVraag {
  id: number
  vraagTekst: string
  type: GeslotenVraagType
  tijdSeconden: number
  optieA: string
  optieB: string
  optieC: string | null
  optieD: string | null
  correctAntwoord: CorrectAntwoord
  vragenSetId: number
  createdAt: string
  updatedAt: string
}

// --- API Request Types ---

export interface CreateUser {
  naam: string
  email: string
}

export interface CreateVragenSet {
  label: string
}

export interface UpdateVragenSet {
  label: string
}

export interface CreateVraag {
  vraagTekst: string
  competentie: Competentie
  tijdSeconden: 30 | 60 | 120
}

export interface UpdateVraag {
  vraagTekst: string
  competentie: Competentie
  tijdSeconden: 30 | 60 | 120
}

export interface CreateGeslotenVraag {
  vraagTekst: string
  type: GeslotenVraagType
  tijdSeconden: 30 | 45 | 60
  optieA: string
  optieB: string
  optieC?: string | null
  optieD?: string | null
  correctAntwoord: CorrectAntwoord
}

export interface UpdateGeslotenVraag {
  vraagTekst: string
  type: GeslotenVraagType
  tijdSeconden: 30 | 45 | 60
  optieA: string
  optieB: string
  optieC?: string | null
  optieD?: string | null
  correctAntwoord: CorrectAntwoord
}

// --- API Response Types ---

export interface VragenSetDetail extends VragenSet {
  _count: {
    vragen: number
    geslotenVragen: number
  }
}

export interface SpelData extends VragenSet {
  vragen: Vraag[]
  geslotenVragen: GeslotenVraag[]
}

export interface ApiError {
  error: string
  details?: { veld: string; melding: string }[]
}

// --- Competentie Metadata ---

export interface CompetentieMeta {
  label: string
  kleur: string
  icoon: string
}

export const COMPETENTIE_META: Record<Competentie, CompetentieMeta> = {
  [Competentie.KWALITEITEN]: {
    label: 'Kwaliteiten',
    kleur: '#FBFB00',
    icoon: '💪',
  },
  [Competentie.MOTIEVEN]: {
    label: 'Motieven',
    kleur: '#8F88FD',
    icoon: '❤️',
  },
  [Competentie.WERK]: { label: 'Werk', kleur: '#DAF2FE', icoon: '🔍' },
  [Competentie.STURING]: {
    label: 'Sturing',
    kleur: '#FD6555',
    icoon: '🧭',
  },
  [Competentie.NETWERKEN]: {
    label: 'Netwerken',
    kleur: '#81FBAE',
    icoon: '🤝',
  },
}
