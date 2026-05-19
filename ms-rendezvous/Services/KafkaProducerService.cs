using Confluent.Kafka;
using System.Text.Json;

namespace MsRendezVous.Services;

public class KafkaProducerService
{
    private readonly string _bootstrapServers;
    private readonly ILogger<KafkaProducerService>? _logger;

    public KafkaProducerService(string bootstrapServers, ILogger<KafkaProducerService>? logger = null)
    {
        _bootstrapServers = bootstrapServers;
        _logger = logger;
    }

    public async Task ProduceAsync(string topic, string key, object data)
    {
        try
        {
            var config = new ProducerConfig
            {
                BootstrapServers = _bootstrapServers,
                MessageTimeoutMs = 5000
            };

            using var producer = new ProducerBuilder<string, string>(config).Build();

            var message = JsonSerializer.Serialize(new
            {
                key,
                data,
                timestamp = DateTime.UtcNow.ToString("o")
            });

            await producer.ProduceAsync(topic, new Message<string, string>
            {
                Key = key,
                Value = message
            });
        }
        catch (Exception ex)
        {
            _logger?.LogWarning(ex, "Failed to produce message to Kafka topic {Topic}", topic);
        }
    }
}
