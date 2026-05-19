namespace MsRendezVous.Models;

public class CreateRendezVousDto
{
    public int PatientId { get; set; }
    public string PatientNom { get; set; } = string.Empty;
    public string MedecinNom { get; set; } = string.Empty;
    public DateTime DateRendezVous { get; set; }
    public string HeureDebut { get; set; } = string.Empty;
    public string HeureFin { get; set; } = string.Empty;
    public string? Motif { get; set; }
    public string? Notes { get; set; }
    public string? Lieu { get; set; }
    public string TypeConsultation { get; set; } = "generale";
}

public class UpdateRendezVousDto
{
    public string? MedecinNom { get; set; }
    public DateTime? DateRendezVous { get; set; }
    public string? HeureDebut { get; set; }
    public string? HeureFin { get; set; }
    public string? Statut { get; set; }
    public string? Motif { get; set; }
    public string? Notes { get; set; }
    public string? Lieu { get; set; }
    public string? TypeConsultation { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public int? Total { get; set; }
}
