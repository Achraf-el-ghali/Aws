<?php

namespace App\Service;

class KafkaProducerService
{
    private string $brokers;

    public function __construct(string $brokers)
    {
        $this->brokers = $brokers;
    }

    public function produce(string $topic, string $key, array $data): void
    {
        try {
            if (!extension_loaded('rdkafka')) {
                // Log warning but don't fail - Kafka is optional for local dev
                error_log("rdkafka extension not loaded. Event not sent to topic: $topic");
                return;
            }

            $conf = new \RdKafka\Conf();
            $conf->set('metadata.broker.list', $this->brokers);
            $conf->set('socket.timeout.ms', '5000');
            $conf->set('queue.buffering.max.ms', '100');

            $producer = new \RdKafka\Producer($conf);
            $topic_instance = $producer->newTopic($topic);

            $message = json_encode([
                'key' => $key,
                'data' => $data,
                'timestamp' => (new \DateTime())->format('c'),
            ]);

            $topic_instance->produce(RD_KAFKA_PARTITION_UA, 0, $message, $key);
            $producer->flush(5000);
        } catch (\Exception $e) {
            error_log("Kafka producer error: " . $e->getMessage());
        }
    }
}
