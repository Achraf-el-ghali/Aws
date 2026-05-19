using Microsoft.AspNetCore.Mvc;

namespace MsRendezVous.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet("/health")]
    public IActionResult Health()
    {
        return Ok(new
        {
            status = "healthy",
            service = "ms-rendezvous",
            timestamp = DateTime.UtcNow.ToString("o")
        });
    }
}
