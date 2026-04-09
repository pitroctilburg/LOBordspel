# LOBordspel

Educatieve bordspel-webapp voor **loopbaanoriëntatie en -begeleiding (LOB)**, gericht op NT2-leerlingen. Ontwikkeld voor [Yonder](https://www.yonder.nl) (MBO/VMBO Tilburg).

Spelers beantwoorden challenges in vijf competentiecategorieën om loopbaanbewustzijn te ontwikkelen. Docenten maken vragensets via een adminpaneel en delen een spellink met leerlingen die in de browser spelen.

## Competentiecategorieën

| Categorie | Icoon | Kleur |
|-----------|-------|-------|
| Kwaliteiten | 💪 | Geel `#FBFB00` |
| Motieven | ❤️ | Paars `#8F88FD` |
| Werkexploratie | 🔍 | Lichtblauw `#DAF2FE` |
| Loopbaansturing | 🧭 | Rood `#FD6555` |
| Netwerken | 🤝 | Groen `#81FBAE` |

Daarnaast zijn er **gesloten vragen** (multiple-choice kennisvragen) en **Power Ups** (willekeurige bonusacties).

## Tech stack

- **Frontend:** Vite + React 19, TypeScript, Tailwind CSS
- **Backend:** Express 5 REST API, TypeScript
- **Database:** MySQL met Drizzle ORM
- **Monorepo:** pnpm workspaces

## Projectstructuur

```
client/            → Vite + React SPA
server/            → Express.js API
server/src/db/     → Drizzle schema en DB-verbinding
server/drizzle/    → Drizzle migraties (gegenereerd)
shared/types/      → Gedeelde TypeScript types
legacy/            → Origineel statisch prototype
import/            → Word-documenten en SQL-import voor vragensets
```

## Aan de slag

### Vereisten

- Node.js ≥ 20
- pnpm
- MySQL-database

### Installatie

```bash
# Dependencies installeren
pnpm install

# Database-configuratie: maak een .env-bestand in /server
echo "DATABASE_URL=mysql://gebruiker:wachtwoord@localhost:3306/lobordspel" > server/.env

# Schema naar database pushen
cd server && pnpm exec drizzle-kit push

# (Optioneel) Voorbeeldvragen importeren
mysql -u gebruiker -p lobordspel < import/import_vragen.sql
```

### Ontwikkelen

```bash
# Start client + server tegelijk
pnpm dev

# Of apart:
pnpm dev:client          # Vite dev server (standaard :5173)
pnpm dev:server          # Express API (standaard :3000)
```

### Bouwen voor productie

```bash
pnpm build
cd server && node dist/index.js
```

## Database

Het project gebruikt Drizzle ORM. Handige commando's:

```bash
cd server
pnpm exec drizzle-kit generate    # Migratie genereren uit schema
pnpm exec drizzle-kit push        # Schema direct naar database pushen
pnpm exec drizzle-kit studio      # Visuele DB-browser openen
```

### Datamodel

- **User** — naam + e-mail (zonder wachtwoord, wordt later vervangen door externe auth)
- **VragenSet** — eigendom van een docent, optioneel deelbaar via een unieke link
- **Vraag** — competentievraag met instelbare timer (30s / 60s / 120s)
- **GeslotenVraag** — multiple-choice (waar/niet-waar of 4 opties) met correct antwoord

## Hoe het werkt

1. **Docent registreert** zich met naam en e-mail
2. **Docent maakt een vragenset** aan via het adminpaneel — minimaal 10 vragen per competentie en 10 gesloten vragen
3. **Docent deelt** de set via een unieke spellink
4. **Leerling opent** de link en speelt: klik op een categorie, beantwoord de vraag binnen de tijd

## Taal

Alle UI-tekst is in eenvoudig Nederlands (NT2-niveau).
