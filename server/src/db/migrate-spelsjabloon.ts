import 'dotenv/config'
import mysql from 'mysql2/promise'

async function migrate() {
  const pool = mysql.createPool(process.env.DATABASE_URL!)
  const conn = await pool.getConnection()

  try {
    console.log('Start migratie: Spelsjabloon-entiteit toevoegen...')

    // Stap 1: Nieuwe tabellen aanmaken
    console.log('Stap 1: Tabellen spel_sjablonen en themas aanmaken...')
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS spel_sjablonen (
        id int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        naam varchar(200) NOT NULL,
        created_at timestamp NOT NULL DEFAULT (now()),
        updated_at timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS themas (
        id int AUTO_INCREMENT NOT NULL PRIMARY KEY,
        titel varchar(100) NOT NULL,
        kleur varchar(7) NOT NULL,
        afbeelding_pad varchar(500),
        volgorde int NOT NULL DEFAULT 0,
        spel_sjabloon_id int NOT NULL,
        created_at timestamp NOT NULL DEFAULT (now()),
        updated_at timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT themas_spel_sjabloon_id_fk FOREIGN KEY (spel_sjabloon_id)
          REFERENCES spel_sjablonen(id) ON DELETE CASCADE
      )
    `)

    // Stap 2: Seed het "LOBordspel"-sjabloon
    console.log('Stap 2: LOBordspel-sjabloon seeden...')
    await conn.execute(
      `INSERT INTO spel_sjablonen (id, naam) VALUES (1, 'LOBordspel')
       ON DUPLICATE KEY UPDATE naam = naam`,
    )
    const seedThemas = [
      [1, 'Kwaliteiten', '#FBFB00', 'seed/kwaliteiten.png', 0, 1],
      [2, 'Motieven', '#8F88FD', 'seed/motieven.png', 1, 1],
      [3, 'Werk', '#DAF2FE', 'seed/werk.png', 2, 1],
      [4, 'Sturing', '#FD6555', 'seed/sturing.png', 3, 1],
      [5, 'Netwerken', '#81FBAE', 'seed/netwerken.png', 4, 1],
    ]
    for (const [id, titel, kleur, pad, volgorde, sjabloonId] of seedThemas) {
      await conn.execute(
        `INSERT INTO themas (id, titel, kleur, afbeelding_pad, volgorde, spel_sjabloon_id)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE titel = VALUES(titel)`,
        [id, titel, kleur, pad, volgorde, sjabloonId],
      )
    }

    // Stap 3: Nieuwe kolommen toevoegen (nullable)
    console.log('Stap 3: Kolommen thema_id en spel_sjabloon_id toevoegen...')
    const [vragenCols] = await conn.execute(`SHOW COLUMNS FROM vragen LIKE 'thema_id'`) as any[]
    if (vragenCols.length === 0) {
      await conn.execute(`ALTER TABLE vragen ADD COLUMN thema_id int`)
      await conn.execute(`
        ALTER TABLE vragen ADD CONSTRAINT vragen_thema_id_fk
          FOREIGN KEY (thema_id) REFERENCES themas(id)
      `)
    }

    const [setCols] = await conn.execute(`SHOW COLUMNS FROM vragen_sets LIKE 'spel_sjabloon_id'`) as any[]
    if (setCols.length === 0) {
      await conn.execute(`ALTER TABLE vragen_sets ADD COLUMN spel_sjabloon_id int`)
      await conn.execute(`
        ALTER TABLE vragen_sets ADD CONSTRAINT vragen_sets_spel_sjabloon_id_fk
          FOREIGN KEY (spel_sjabloon_id) REFERENCES spel_sjablonen(id)
      `)
    }

    // Stap 4: Bestaande data migreren
    console.log('Stap 4: Bestaande data migreren...')
    const competentieMap: Record<string, number> = {
      KWALITEITEN: 1,
      MOTIEVEN: 2,
      WERK: 3,
      STURING: 4,
      NETWERKEN: 5,
    }

    const [hasCompetentie] = await conn.execute(`SHOW COLUMNS FROM vragen LIKE 'competentie'`) as any[]
    if (hasCompetentie.length > 0) {
      for (const [comp, themaId] of Object.entries(competentieMap)) {
        await conn.execute(
          `UPDATE vragen SET thema_id = ? WHERE competentie = ? AND thema_id IS NULL`,
          [themaId, comp],
        )
      }
    }

    await conn.execute(
      `UPDATE vragen_sets SET spel_sjabloon_id = 1 WHERE spel_sjabloon_id IS NULL`,
    )

    // Stap 5: Kolommen NOT NULL maken en oude kolom verwijderen
    console.log('Stap 5: Kolommen NOT NULL maken, competentie-kolom verwijderen...')
    const [nullableCheck] = await conn.execute(
      `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'vragen' AND COLUMN_NAME = 'thema_id'
       AND TABLE_SCHEMA = DATABASE()`,
    ) as any[]
    if (nullableCheck.length > 0 && nullableCheck[0].IS_NULLABLE === 'YES') {
      await conn.execute(`ALTER TABLE vragen MODIFY thema_id int NOT NULL`)
    }

    const [nullableCheck2] = await conn.execute(
      `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'vragen_sets' AND COLUMN_NAME = 'spel_sjabloon_id'
       AND TABLE_SCHEMA = DATABASE()`,
    ) as any[]
    if (nullableCheck2.length > 0 && nullableCheck2[0].IS_NULLABLE === 'YES') {
      await conn.execute(`ALTER TABLE vragen_sets MODIFY spel_sjabloon_id int NOT NULL`)
    }

    if (hasCompetentie.length > 0) {
      await conn.execute(`ALTER TABLE vragen DROP COLUMN competentie`)
    }

    console.log('Migratie voltooid!')
  } catch (err) {
    console.error('Migratie mislukt:', err)
    throw err
  } finally {
    conn.release()
    await pool.end()
  }
}

migrate()
