export const GeslotenVraagType = {
  WAAR_NIET_WAAR: 'WAAR_NIET_WAAR',
  VIER_OPTIES: 'VIER_OPTIES',
} as const

export type GeslotenVraagType =
  (typeof GeslotenVraagType)[keyof typeof GeslotenVraagType]

export type CorrectAntwoord = 'A' | 'B' | 'C' | 'D'

// --- Spelsjabloon & Thema ---

export interface SpelSjabloon {
  id: number
  naam: string
  createdAt: string
  updatedAt: string
}

export interface Thema {
  id: number
  titel: string
  kleur: string
  afbeeldingUrl: string | null
  volgorde: number
  spelSjabloonId: number
  createdAt: string
  updatedAt: string
}

export interface SpelSjabloonDetail extends SpelSjabloon {
  themas: Thema[]
}

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
  spelSjabloonId: number
  shareToken: string | null
  createdAt: string
  updatedAt: string
}

export interface Vraag {
  id: number
  vraagTekst: string
  themaId: number
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
  spelSjabloonId: number
}

export interface UpdateVragenSet {
  label: string
}

export interface CreateVraag {
  vraagTekst: string
  themaId: number
  tijdSeconden: 30 | 60 | 120
}

export interface UpdateVraag {
  vraagTekst: string
  themaId: number
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

export interface ImporteerVragen {
  bronSetId: number
  vraagIds: number[]
  geslotenVraagIds: number[]
}

// --- API Response Types ---

export interface VragenSetDetail extends VragenSet {
  spelSjabloon: SpelSjabloonDetail
  _count: {
    vragen: number
    geslotenVragen: number
  }
}

export interface SpelData extends VragenSet {
  spelSjabloon: SpelSjabloonDetail
  vragen: Vraag[]
  geslotenVragen: GeslotenVraag[]
}

export interface ImporteerResultaat {
  aantalVragen: number
  aantalGeslotenVragen: number
}

export interface ApiError {
  error: string
  details?: { veld: string; melding: string }[]
}

// --- Spelsjabloon API Types ---

export interface CreateSpelSjabloon {
  naam: string
}

export interface UpdateSpelSjabloon {
  naam: string
}

export interface CreateThema {
  titel: string
  kleur: string
  volgorde?: number
}

export interface UpdateThema {
  titel: string
  kleur: string
  volgorde?: number
}
