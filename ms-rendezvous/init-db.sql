-- Auto-create rendezvous table if it doesn't exist
CREATE TABLE IF NOT EXISTS "rendezvous" (
    "Id" SERIAL PRIMARY KEY,
    "PatientId" INTEGER NOT NULL,
    "PatientNom" VARCHAR(200) NOT NULL,
    "MedecinNom" VARCHAR(200) NOT NULL,
    "DateRendezVous" TIMESTAMP WITH TIME ZONE NOT NULL,
    "HeureDebut" INTERVAL NOT NULL,
    "HeureFin" INTERVAL NOT NULL,
    "Statut" VARCHAR(50) NOT NULL DEFAULT 'planifie',
    "Motif" VARCHAR(100),
    "Notes" VARCHAR(500),
    "Lieu" VARCHAR(100),
    "TypeConsultation" VARCHAR(50) NOT NULL DEFAULT 'generale',
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "IX_rendezvous_PatientId" ON "rendezvous" ("PatientId");
CREATE INDEX IF NOT EXISTS "IX_rendezvous_DateRendezVous" ON "rendezvous" ("DateRendezVous");
CREATE INDEX IF NOT EXISTS "IX_rendezvous_Statut" ON "rendezvous" ("Statut");
CREATE INDEX IF NOT EXISTS "IX_rendezvous_MedecinNom" ON "rendezvous" ("MedecinNom");

-- EF Migrations history
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" VARCHAR(150) NOT NULL PRIMARY KEY,
    "ProductVersion" VARCHAR(32) NOT NULL
);
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20240101000000_InitialCreate', '8.0.0')
ON CONFLICT DO NOTHING;
