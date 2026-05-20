using Microsoft.EntityFrameworkCore;
using MsRendezVous.Data;
using MsRendezVous.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<RendezVousDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Kafka
builder.Services.AddSingleton<KafkaProducerService>(sp =>
    new KafkaProducerService(builder.Configuration["Kafka:BootstrapServers"] ?? "localhost:9092"));

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Auto-migrate database
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<RendezVousDbContext>();
        db.Database.Migrate();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Database migration warning: {ex.Message}. App will continue...");
    // Try EnsureCreated as fallback
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<RendezVousDbContext>();
            db.Database.EnsureCreated();
        }
    }
    catch (Exception ex2)
    {
        Console.WriteLine($"Database EnsureCreated also failed: {ex2.Message}");
    }
}

app.Run();
