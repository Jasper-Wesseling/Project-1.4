<?php

namespace App\Controller;

use App\Entity\Events;
use App\Repository\EventsRepository;
use App\Repository\CompaniesRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/events')]
class EventsController extends AbstractController
{
    #[Route('', name: 'api_events_index', methods: ['GET'])]
    public function index(EventsRepository $eventsRepository): JsonResponse
    {
        $events = $eventsRepository->findAll();
        $data = [];
        foreach ($events as $event) {
            $data[] = [
                'id' => $event->getId(),
                'company_id' => $event->getCompanyId()?->getId(),
                'title' => $event->getTitle(),
                'date' => $event->getDate()?->format('Y-m-d'),
                'location' => $event->getLocation(),
                'description' => $event->getDescription(),
                'created_at' => $event->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updated_at' => $event->getUpdatedAt()?->format('Y-m-d H:i:s'),
            ];
        }
        return $this->json($data);
    }

    #[Route('/{id}', name: 'api_events_show', methods: ['GET'])]
    public function show(Events $event): JsonResponse
    {
        return $this->json([
            'id' => $event->getId(),
            'company_id' => $event->getCompanyId()?->getId(),
            'title' => $event->getTitle(),
            'date' => $event->getDate()?->format('Y-m-d'),
            'location' => $event->getLocation(),
            'description' => $event->getDescription(),
            'created_at' => $event->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updated_at' => $event->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('', name: 'api_events_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CompaniesRepository $companiesRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $event = new Events();
        if (isset($data['company_id'])) {
            $company = $companiesRepository->find($data['company_id']);
            if (!$company) {
                return $this->json(['error' => 'Company not found'], 404);
            }
            $event->setCompanyId($company);
        }
        $event->setTitle($data['title'] ?? null);
        $event->setDate(isset($data['date']) ? new \DateTime($data['date']) : null);
        $event->setLocation($data['location'] ?? null);
        $event->setDescription($data['description'] ?? null);
        $event->setCreatedAt(new \DateTime());
        $event->setUpdatedAt(new \DateTime());

        $em->persist($event);
        $em->flush();

        return $this->json(['id' => $event->getId()], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_events_update', methods: ['PUT', 'PATCH'])]
    public function update(
        Events $event,
        Request $request,
        EntityManagerInterface $em,
        CompaniesRepository $companiesRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (isset($data['company_id'])) {
            $company = $companiesRepository->find($data['company_id']);
            if (!$company) {
                return $this->json(['error' => 'Company not found'], 404);
            }
            $event->setCompanyId($company);
        }
        if (isset($data['title'])) {
            $event->setTitle($data['title']);
        }
        if (isset($data['date'])) {
            $event->setDate(new \DateTime($data['date']));
        }
        if (isset($data['location'])) {
            $event->setLocation($data['location']);
        }
        if (isset($data['description'])) {
            $event->setDescription($data['description']);
        }
        $event->setUpdatedAt(new \DateTime());

        $em->flush();

        return $this->json(['message' => 'Event updated']);
    }

    #[Route('/{id}', name: 'api_events_delete', methods: ['DELETE'])]
    public function delete(Events $event, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($event);
        $em->flush();
        return $this->json(['message' => 'Event deleted']);
    }
}
