using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MsRendezVous.Data;
using MsRendezVous.Models;
using MsRendezVous.Services;

namespace MsRendezVous.Controllers;

[ApiController]
[Route("api/rendezvous")]
public class RendezVousController : ControllerBase
{
    private readonly RendezVousDbContext _context;
    private readonly KafkaProducerService _kafkaProducer;

    public RendezVousController(RendezVousDbContext context, KafkaProducerService kafkaProducer)
    {
        _context = context;
        _kafkaProducer = kafkaProducer;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RendezVous>>>> GetAll(
        [FromQuery] int? patientId,
        [FromQuery] string? statut,
        [FromQuery] DateTime? date)
    {
        var query = _context.RendezVous.AsQueryable();

        if (patientId.HasValue)
            query = query.Where(r => r.PatientId == patientId.Value);

        if (!string.IsNullOrEmpty(statut))
            query = query.Where(r => r.Statut == statut);

        if (date.HasValue)
            query = query.Where(r => r.DateRendezVous.Date == date.Value.Date);

        var rendezvous = await query.OrderByDescending(r => r.DateRendezVous)
                                     .ThenBy(r => r.HeureDebut)
                                     .ToListAsync();

        return Ok(new ApiResponse<List<RendezVous>>
        {
            Success = true,
            Data = rendezvous,
            Total = rendezvous.Count
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RendezVous>>> GetById(int id)
    {
        var rdv = await _context.RendezVous.FindAsync(id);

        if (rdv == null)
            return NotFound(new ApiResponse<RendezVous>
            {
                Success = false,
                Message = "Rendez-vous non trouvé"
            });

        return Ok(new ApiResponse<RendezVous>
        {
            Success = true,
            Data = rdv
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RendezVous>>> Create([FromBody] CreateRendezVousDto dto)
    {
        var rdv = new RendezVous
        {
            PatientId = dto.PatientId,
            PatientNom = dto.PatientNom,
            MedecinNom = dto.MedecinNom,
            DateRendezVous = dto.DateRendezVous,
            HeureDebut = TimeSpan.Parse(dto.HeureDebut),
            HeureFin = TimeSpan.Parse(dto.HeureFin),
            Motif = dto.Motif,
            Notes = dto.Notes,
            Lieu = dto.Lieu,
            TypeConsultation = dto.TypeConsultation,
            Statut = "planifie",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.RendezVous.Add(rdv);
        await _context.SaveChangesAsync();

        await _kafkaProducer.ProduceAsync("rendezvous.events", "rendezvous.created", rdv);

        return CreatedAtAction(nameof(GetById), new { id = rdv.Id }, new ApiResponse<RendezVous>
        {
            Success = true,
            Message = "Rendez-vous créé avec succès",
            Data = rdv
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<RendezVous>>> Update(int id, [FromBody] UpdateRendezVousDto dto)
    {
        var rdv = await _context.RendezVous.FindAsync(id);

        if (rdv == null)
            return NotFound(new ApiResponse<RendezVous>
            {
                Success = false,
                Message = "Rendez-vous non trouvé"
            });

        if (!string.IsNullOrEmpty(dto.MedecinNom)) rdv.MedecinNom = dto.MedecinNom;
        if (dto.DateRendezVous.HasValue) rdv.DateRendezVous = dto.DateRendezVous.Value;
        if (!string.IsNullOrEmpty(dto.HeureDebut)) rdv.HeureDebut = TimeSpan.Parse(dto.HeureDebut);
        if (!string.IsNullOrEmpty(dto.HeureFin)) rdv.HeureFin = TimeSpan.Parse(dto.HeureFin);
        if (!string.IsNullOrEmpty(dto.Statut)) rdv.Statut = dto.Statut;
        if (dto.Motif != null) rdv.Motif = dto.Motif;
        if (dto.Notes != null) rdv.Notes = dto.Notes;
        if (dto.Lieu != null) rdv.Lieu = dto.Lieu;
        if (!string.IsNullOrEmpty(dto.TypeConsultation)) rdv.TypeConsultation = dto.TypeConsultation;
        rdv.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _kafkaProducer.ProduceAsync("rendezvous.events", "rendezvous.updated", rdv);

        return Ok(new ApiResponse<RendezVous>
        {
            Success = true,
            Message = "Rendez-vous mis à jour avec succès",
            Data = rdv
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int id)
    {
        var rdv = await _context.RendezVous.FindAsync(id);

        if (rdv == null)
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = "Rendez-vous non trouvé"
            });

        _context.RendezVous.Remove(rdv);
        await _context.SaveChangesAsync();

        await _kafkaProducer.ProduceAsync("rendezvous.events", "rendezvous.cancelled", rdv);

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Rendez-vous supprimé avec succès"
        });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<object>>> GetStats()
    {
        var total = await _context.RendezVous.CountAsync();
        var planifies = await _context.RendezVous.CountAsync(r => r.Statut == "planifie");
        var confirmes = await _context.RendezVous.CountAsync(r => r.Statut == "confirme");
        var annules = await _context.RendezVous.CountAsync(r => r.Statut == "annule");
        var termines = await _context.RendezVous.CountAsync(r => r.Statut == "termine");

        return Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new
            {
                totalRendezVous = total,
                planifies,
                confirmes,
                annules,
                termines
            }
        });
    }
}
