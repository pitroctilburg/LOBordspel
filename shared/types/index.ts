export enum Competentie {
  KWALITEITEN = 'KWALITEITEN',
  MOTIEVEN = 'MOTIEVEN',
  WERK = 'WERK',
  STURING = 'STURING',
  NETWERKEN = 'NETWERKEN',
}

export enum GeslotenVraagType {
  WAAR_NIET_WAAR = 'WAAR_NIET_WAAR',
  VIER_OPTIES = 'VIER_OPTIES',
}

export interface User {
  id: number
  naam: string
  email: string
}

export interface VragenSet {
  id: number
  label: string
  userId: number
  shareToken: string | null
}

export interface Vraag {
  id: number
  vraagTekst: string
  competentie: Competentie
  tijdSeconden: number
  vragenSetId: number
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
  correctAntwoord: string
  vragenSetId: number
}
