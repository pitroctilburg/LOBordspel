import { z } from 'zod'

// --- Users ---

export const createUserSchema = z.object({
  naam: z.string().min(1, 'Naam is verplicht').max(100),
  email: z.string().email('Ongeldig e-mailadres'),
})

// --- VragenSets ---

export const createVragenSetSchema = z.object({
  label: z.string().min(1, 'Label is verplicht').max(200),
})

export const updateVragenSetSchema = z.object({
  label: z.string().min(1, 'Label is verplicht').max(200),
})

// --- Vragen ---

const competentieEnum = z.enum([
  'KWALITEITEN',
  'MOTIEVEN',
  'WERK',
  'STURING',
  'NETWERKEN',
])

const vraagTijdEnum = z.union([z.literal(30), z.literal(60), z.literal(120)])

export const createVraagSchema = z.object({
  vraagTekst: z.string().min(1, 'Vraagtekst is verplicht'),
  competentie: competentieEnum,
  tijdSeconden: vraagTijdEnum,
})

export const updateVraagSchema = z.object({
  vraagTekst: z.string().min(1, 'Vraagtekst is verplicht'),
  competentie: competentieEnum,
  tijdSeconden: vraagTijdEnum,
})

// --- Gesloten Vragen ---

const geslotenVraagTypeEnum = z.enum(['WAAR_NIET_WAAR', 'VIER_OPTIES'])
const geslotenVraagTijdEnum = z.union([
  z.literal(30),
  z.literal(45),
  z.literal(60),
])

const baseGeslotenVraagSchema = z.object({
  vraagTekst: z.string().min(1, 'Vraagtekst is verplicht'),
  type: geslotenVraagTypeEnum,
  tijdSeconden: geslotenVraagTijdEnum,
  optieA: z.string().min(1, 'Optie A is verplicht'),
  optieB: z.string().min(1, 'Optie B is verplicht'),
  optieC: z.string().nullable().optional().default(null),
  optieD: z.string().nullable().optional().default(null),
  correctAntwoord: z.enum(['A', 'B', 'C', 'D']),
})

export const createGeslotenVraagSchema = baseGeslotenVraagSchema.superRefine(
  (data, ctx) => {
    if (data.type === 'WAAR_NIET_WAAR') {
      if (data.correctAntwoord !== 'A' && data.correctAntwoord !== 'B') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['correctAntwoord'],
          message:
            'Bij Waar/Niet waar kan het correcte antwoord alleen A of B zijn',
        })
      }
    }

    if (data.type === 'VIER_OPTIES') {
      if (!data.optieC || data.optieC.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['optieC'],
          message: 'Optie C is verplicht bij Vier opties',
        })
      }
      if (!data.optieD || data.optieD.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['optieD'],
          message: 'Optie D is verplicht bij Vier opties',
        })
      }
    }
  },
)

export const updateGeslotenVraagSchema = createGeslotenVraagSchema
