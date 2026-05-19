using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MsRendezVous.Models;

[Table("rendezvous")]
public class RendezVous
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required(ErrorMessage = "L'ID du patient est obligatoire")]
    public int PatientId { get; set; }

    [Required(ErrorMessage = "Le nom du patient est obligatoire")]
    [MaxLength(200)]
    public string PatientNom { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom du médecin est obligatoire")]
    [MaxLength(200)]
    public string MedecinNom { get; set; } = string.Empty;

    [Required(ErrorMessage = "La date du rendez-vous est obligatoire")]
    public DateTime DateRendezVous { get; set; }

    [Required(ErrorMessage = "L'heure de début est obligatoire")]
    public TimeSpan HeureDebut { get; set; }

    [Required(ErrorMessage = "L'heure de fin est obligatoire")]
    public TimeSpan HeureFin { get; set; }

    [MaxLength(50)]
    public string Statut { get; set; } = "planifie"; // planifie, confirme, annule, termine

    [MaxLength(100)]
    public string? Motif { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    [MaxLength(100)]
    public string? Lieu { get; set; }

    [MaxLength(50)]
    public string TypeConsultation { get; set; } = "generale"; // generale, specialiste, urgence, suivi

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
