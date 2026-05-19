using Microsoft.EntityFrameworkCore;
using MsRendezVous.Models;

namespace MsRendezVous.Data;

public class RendezVousDbContext : DbContext
{
    public RendezVousDbContext(DbContextOptions<RendezVousDbContext> options) : base(options) { }

    public DbSet<RendezVous> RendezVous { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RendezVous>(entity =>
        {
            entity.HasIndex(e => e.PatientId);
            entity.HasIndex(e => e.DateRendezVous);
            entity.HasIndex(e => e.Statut);
            entity.HasIndex(e => e.MedecinNom);
        });
    }
}
