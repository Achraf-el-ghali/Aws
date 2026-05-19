using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using MsRendezVous.Data;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace MsRendezVous.Migrations;

[DbContext(typeof(RendezVousDbContext))]
partial class RendezVousDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasAnnotation("ProductVersion", "8.0.0")
            .HasAnnotation("Relational:MaxIdentifierLength", 63)
            .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

        modelBuilder.Entity("MsRendezVous.Models.RendezVous", b =>
        {
            b.Property<int>("Id").ValueGeneratedOnAdd().HasColumnType("integer");
            b.Property<int>("PatientId").HasColumnType("integer");
            b.Property<string>("PatientNom").IsRequired().HasMaxLength(200);
            b.Property<string>("MedecinNom").IsRequired().HasMaxLength(200);
            b.Property<DateTime>("DateRendezVous").HasColumnType("timestamp with time zone");
            b.Property<TimeSpan>("HeureDebut").HasColumnType("interval");
            b.Property<TimeSpan>("HeureFin").HasColumnType("interval");
            b.Property<string>("Statut").IsRequired().HasMaxLength(50);
            b.Property<string>("Motif").HasMaxLength(100);
            b.Property<string>("Notes").HasMaxLength(500);
            b.Property<string>("Lieu").HasMaxLength(100);
            b.Property<string>("TypeConsultation").IsRequired().HasMaxLength(50);
            b.Property<DateTime>("CreatedAt").HasColumnType("timestamp with time zone");
            b.Property<DateTime>("UpdatedAt").HasColumnType("timestamp with time zone");
            b.HasKey("Id");
            b.HasIndex("PatientId");
            b.HasIndex("DateRendezVous");
            b.HasIndex("Statut");
            b.HasIndex("MedecinNom");
            b.ToTable("rendezvous");
        });
    }
}
