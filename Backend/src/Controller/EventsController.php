<?php

namespace App\Controller;

use App\Entity\Events;
use App\Repository\EventsRepository;
use App\Repository\CompaniesRepository;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/events')]
class EventsController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    #[Route('/get', name: 'api_events_get', methods: ['GET'])]
    public function getEvents(Request $request, EventsRepository $eventsRepository): Response
    {
        // Auth (optional: add user filtering if needed)
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());

        $page = max(1, (int)$request->query->get('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;
        $search = $request->query->get('search', '');
        $company_id = $request->query->get('company_id', null);

        $qb = $eventsRepository->createQueryBuilder('e')
            ->orderBy('e.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($company_id) {
            $qb->andWhere('e.company_id = :company_id')
               ->setParameter('company_id', $company_id);
        }
        if ($search) {
            $qb->andWhere('LOWER(e.title) LIKE :search OR LOWER(e.description) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        $events = $qb->getQuery()->getResult();

        $eventsArray = [];
        foreach ($events as $event) {
            $eventsArray[] = [
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

        return new JsonResponse($eventsArray, 200);
    }

    #[Route('/new', name: 'api_events_new', methods: ['POST'])]
    public function addEvent(
        Request $request,
        EntityManagerInterface $entityManager,
        CompaniesRepository $companiesRepository
    ): Response {
        $data = json_decode($request->getContent(), true);

        // Required fields
        $title = $data['title'] ?? null;
        $date = $data['date'] ?? null;
        $company_id = $data['company_id'] ?? null;

        if (!$title || !$date || !$company_id) {
            return new JsonResponse(['error' => 'Missing required fields'], 400);
        }

        $company = $companiesRepository->find($company_id);
        if (!$company) {
            return new JsonResponse(['error' => 'Company not found'], 404);
        }

        $event = new Events();
        $event->setCompanyId($company);
        $event->setTitle($title);
        $event->setDate(new \DateTime($date));
        $event->setLocation($data['location'] ?? null);
        $event->setDescription($data['description'] ?? null);
        $event->setCreatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $event->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $entityManager->persist($event);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Successfully added!',
            'id' => $event->getId(),
        ], 201);
    }

    #[Route('/{id}', name: 'api_events_show', methods: ['GET'])]
    public function showEvent(Events $event): Response
    {
        return new JsonResponse([
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

    #[Route('/{id}', name: 'api_events_update', methods: ['PUT', 'PATCH'])]
    public function updateEvent(
        Events $event,
        Request $request,
        EntityManagerInterface $entityManager,
        CompaniesRepository $companiesRepository
    ): Response {
        $data = json_decode($request->getContent(), true);

        if (isset($data['company_id'])) {
            $company = $companiesRepository->find($data['company_id']);
            if (!$company) {
                return new JsonResponse(['error' => 'Company not found'], 404);
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
        $event->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $entityManager->flush();

        return new JsonResponse(['message' => 'Event updated']);
    }

    #[Route('/{id}', name: 'api_events_delete', methods: ['DELETE'])]
    public function deleteEvent(Events $event, EntityManagerInterface $entityManager): Response
    {
        $entityManager->remove($event);
        $entityManager->flush();
        return new JsonResponse(['message' => 'Event deleted']);
    }
}
