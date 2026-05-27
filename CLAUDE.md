# CLAUDE.md

Dit bestand geeft richtlijnen aan Claude Code (claude.ai/code) bij het werken in deze repository.

## Projectoverzicht

LOBordspel is een Nederlands educatief bordspel-platform gericht op NT2-leerlingen. Het platform ondersteunt meerdere soorten spellen via **Spelsjablonen** — elk sjabloon definieert een set thema's (met titel, kleur en afbeelding) waarin vragen worden ingedeeld.

Docenten maken spelsjablonen en vragensets via een adminpaneel en delen een spellink met leerlingen die in de browser spelen. Het standaard sjabloon "LOBordspel" bevat de 5 LOB-competentiecategorieën.

## Tech Stack

- **Frontend:** Vite + React (SPA), TypeScript
- **Styling:** Tailwind CSS met CSS Modules voor overrides
- **Backend:** Express.js REST API, TypeScript
- **ORM/DB:** Drizzle ORM + MySQL
- **Auth:** Zonder wachtwoord (naam + e-mail registratie, picker voor inloggen) — wordt later vervangen door een externe auth-service

## Monorepo Structuur

```
/client            — Vite + React SPA
/server            — Express.js API
/server/src/db     — Drizzle schema en DB-verbinding
/server/uploads    — Geüploade thema-afbeeldingen (niet in git)
/server/drizzle    — Drizzle migraties (gegenereerd)
/shared/types      — Gedeelde TypeScript types tussen client en server
/legacy            — Origineel statisch prototype (LOBspel20251216_NT2.html)
```

## Commando's

```bash
# Root (workspace)
pnpm install                      # Installeer alle dependencies
pnpm dev                          # Start client + server parallel
pnpm build                        # Bouw alles

# Client
pnpm --filter client dev          # Start Vite dev server
pnpm --filter client build        # Productie-build

# Server
pnpm --filter server dev          # Start Express dev server (tsx watch)
pnpm --filter server build        # Compileer TypeScript

# Database
pnpm exec drizzle-kit generate                 # Genereer migratie uit schema
pnpm exec drizzle-kit push                     # Push schema naar database
pnpm exec drizzle-kit studio                   # Visuele DB-browser
```

## Spelstructuur

- **Spelsjablonen**: Definiëren welke thema's een spel heeft. Elk thema heeft een titel, kleur en afbeelding. Sjablonen zijn globaal (zichtbaar voor alle docenten).
- **Thema's**: Dynamische categorieën binnen een sjabloon. Het standaard "LOBordspel"-sjabloon bevat:
  - Kwaliteiten (geel `#FBFB00`)
  - Motieven (paars `#8F88FD`)
  - Werk (lichtblauw `#DAF2FE`)
  - Sturing (rood `#FD6555`)
  - Netwerken (groen `#81FBAE`)
- **Gesloten vragen**: Multiple-choice met aangegeven correct antwoord
- **Power Ups**: Willekeurige bonusacties (extra beurt, overslaan, vrije keuze, etc.)
- **Timer**: Afteller per vraag met instelbare duur; speelt geluid af bij aflopen

## Datamodel (kernentiteiten)

- **User** — naam, e-mail (uniek). Zonder wachtwoord (wordt later vervangen door externe auth).
- **SpelSjabloon** — globale speltemplate met een naam. Bevat minimaal 2 thema's. Zichtbaar voor alle docenten.
- **Thema** — categorie binnen een sjabloon. Heeft titel, kleur (hex), afbeelding (geüpload via multer naar `server/uploads/`), en volgorde. Cascade delete met sjabloon.
- **VragenSet** — eigendom van een User, gekoppeld aan een SpelSjabloon (onwijzigbaar na aanmaak). Heeft een tekstlabel + datum, optioneel een share token voor publieke toegang.
- **Vraag** — hoort bij een VragenSet en een Thema (uit het sjabloon van de set). Heeft vraagtekst en een tijd (keuze uit: 30 seconden / 1 minuut / 2 minuten). Minimaal 10 vragen per thema per set.
- **GeslotenVraag** — hoort bij een VragenSet. Minimaal 10 gesloten vragen per set. Twee typen:
  - **Waar/Niet waar** — twee vaste opties
  - **4 custom opties** — docent voert 4 antwoordmogelijkheden in
  - Bij beide typen: het goede antwoord aangeven. Tijd per vraag (keuze uit: 30 / 45 / 60 seconden).

## Belangrijkste Flows

1. **Registratie/Inloggen:** Docent voert naam + e-mail in om te registreren. Inloggen gaat via een eenvoudige gebruikerskiezer (geen wachtwoord). Dit is een tijdelijke oplossing — wordt later vervangen door een externe auth-service.
2. **Spelsjablonen beheren:** Docenten kunnen spelsjablonen aanmaken, bewerken en verwijderen via `/admin/spelsjablonen`. Elk sjabloon bevat thema's met titel, kleur en afbeelding. Thema-afbeeldingen worden geüpload naar de server.
3. **Vragensets beheren:** Bij het aanmaken van een vragenset kiest de docent eerst een spelsjabloon. Daarna kan hij vragen invoeren per thema uit dat sjabloon. Het sjabloon kan na aanmaak niet meer gewijzigd worden.
4. **Delen:** Een vragenset kan gedeeld worden via een unieke link (share token). Iedereen met de link kan spelen.
5. **Spelen:** Speler opent een gedeelde spellink, ziet het bord met dynamische themaknoppen (uit het sjabloon) + Power Up + Gesloten Vragen. Klikken op een thema toont een willekeurige vraag uit die set met een afteltimer. Gesloten vragen tonen multiple-choice met feedback.

## Design Systeem (Yonder merkkleuren)

```
--yonder-rood:       #FD6555
--yonder-paars:      #8F88FD
--yonder-geel:       #FBFB00
--yonder-groen:      #81FBAE
--yonder-lichtblauw: #DAF2FE
--vuurrood:          #FF0000 (voor Power Up en stopknop)
```

## Taal

- Alle UI-tekst en vraaginhoud is in eenvoudig Nederlands (NT2-niveau). Houd taal toegankelijk bij het toevoegen of wijzigen van content.
- Alle code comments en communicatie in het Nederlands.
