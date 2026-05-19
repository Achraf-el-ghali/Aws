<?php

namespace App\Controller;

use App\Entity\Patient;
use App\Repository\PatientRepository;
use App\Service\KafkaProducerService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/patients')]
class PatientController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private PatientRepository $patientRepository,
        private ValidatorInterface $validator,
        private KafkaProducerService $kafkaProducer,
    ) {}

    #[Route('', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        $search = $request->query->get('search');

        if ($search) {
            $patients = $this->patientRepository->findBySearchCriteria($search);
        } else {
            $patients = $this->patientRepository->findAll();
        }

        $data = array_map(fn(Patient $patient) => $patient->toArray(), $patients);

        return $this->json([
            'success' => true,
            'data' => $data,
            'total' => count($data),
        ]);
    }

    #[Route('/{id}', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $patient = $this->patientRepository->find($id);

        if (!$patient) {
            return $this->json([
                'success' => false,
                'message' => 'Patient non trouvé',
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'success' => true,
            'data' => $patient->toArray(),
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides',
            ], Response::HTTP_BAD_REQUEST);
        }

        $patient = new Patient();
        $this->hydratePatient($patient, $data);

        $errors = $this->validator->validate($patient);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $errorMessages,
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($patient);
        $this->entityManager->flush();

        // Publish event to Kafka
        $this->kafkaProducer->produce('patient.events', 'patient.created', $patient->toArray());

        return $this->json([
            'success' => true,
            'message' => 'Patient créé avec succès',
            'data' => $patient->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $patient = $this->patientRepository->find($id);

        if (!$patient) {
            return $this->json([
                'success' => false,
                'message' => 'Patient non trouvé',
            ], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Données invalides',
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->hydratePatient($patient, $data);

        $errors = $this->validator->validate($patient);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $errorMessages,
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        // Publish event to Kafka
        $this->kafkaProducer->produce('patient.events', 'patient.updated', $patient->toArray());

        return $this->json([
            'success' => true,
            'message' => 'Patient mis à jour avec succès',
            'data' => $patient->toArray(),
        ]);
    }

    #[Route('/{id}', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $patient = $this->patientRepository->find($id);

        if (!$patient) {
            return $this->json([
                'success' => false,
                'message' => 'Patient non trouvé',
            ], Response::HTTP_NOT_FOUND);
        }

        $patientData = $patient->toArray();
        $this->entityManager->remove($patient);
        $this->entityManager->flush();

        // Publish event to Kafka
        $this->kafkaProducer->produce('patient.events', 'patient.deleted', $patientData);

        return $this->json([
            'success' => true,
            'message' => 'Patient supprimé avec succès',
        ]);
    }

    #[Route('/stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $total = $this->patientRepository->count([]);

        return $this->json([
            'success' => true,
            'data' => [
                'totalPatients' => $total,
            ],
        ]);
    }

    #[Route('/{id}/exists', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function exists(int $id): JsonResponse
    {
        $patient = $this->patientRepository->find($id);
        return $this->json([
            'exists' => $patient !== null,
            'patient' => $patient?->toArray(),
        ]);
    }

    private function hydratePatient(Patient $patient, array $data): void
    {
        if (isset($data['nom'])) $patient->setNom($data['nom']);
        if (isset($data['prenom'])) $patient->setPrenom($data['prenom']);
        if (isset($data['dateNaissance'])) $patient->setDateNaissance(new \DateTime($data['dateNaissance']));
        if (array_key_exists('sexe', $data)) $patient->setSexe($data['sexe']);
        if (array_key_exists('adresse', $data)) $patient->setAdresse($data['adresse']);
        if (isset($data['telephone'])) $patient->setTelephone($data['telephone']);
        if (isset($data['email'])) $patient->setEmail($data['email']);
        if (array_key_exists('numeroSecuriteSociale', $data)) $patient->setNumeroSecuriteSociale($data['numeroSecuriteSociale']);
        if (array_key_exists('groupeSanguin', $data)) $patient->setGroupeSanguin($data['groupeSanguin']);
        if (array_key_exists('allergies', $data)) $patient->setAllergies($data['allergies']);
        if (array_key_exists('medecinTraitant', $data)) $patient->setMedecinTraitant($data['medecinTraitant']);
    }
}
