using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace MsRendezVous.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "rendezvous",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                PatientId = table.Column<int>(type: "integer", nullable: false),
                PatientNom = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                MedecinNom = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                DateRendezVous = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                HeureDebut = table.Column<TimeSpan>(type: "interval", nullable: false),
                HeureFin = table.Column<TimeSpan>(type: "interval", nullable: false),
                Statut = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                Motif = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                Lieu = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                TypeConsultation = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_rendezvous", x => x.Id);
            });

        migrationBuilder.CreateIndex(name: "IX_rendezvous_PatientId", table: "rendezvous", column: "PatientId");
        migrationBuilder.CreateIndex(name: "IX_rendezvous_DateRendezVous", table: "rendezvous", column: "DateRendezVous");
        migrationBuilder.CreateIndex(name: "IX_rendezvous_Statut", table: "rendezvous", column: "Statut");
        migrationBuilder.CreateIndex(name: "IX_rendezvous_MedecinNom", table: "rendezvous", column: "MedecinNom");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "rendezvous");
    }
}
