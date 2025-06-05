<?php
namespace App\Controller;

use App\Entity\Companies;
use App\Repository\CompaniesRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/companies')]
class CompaniesController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    #[Route('/get', name: 'api_companies_get', methods: ['GET'])]
    public function getCompanies(Request $request, CompaniesRepository $companiesRepository): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());

        $page = max(1, (int)$request->query->get('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;
        $search = $request->query->get('search', '');

        $qb = $companiesRepository->createQueryBuilder('c')
            ->orderBy('c.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($search) {
            $qb->andWhere('LOWER(c.name) LIKE :search OR LOWER(c.description) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        $companies = $qb->getQuery()->getResult();

        $companiesArray = [];
        foreach ($companies as $company) {
            $companiesArray[] = [
                'id' => $company->getId(),
                'name' => $company->getName(),
                'type' => $company->getType(),
                'location_id' => $company->getLocationId()?->getId(),
                'description' => $company->getDescription(),
                'contact_info' => $company->getContactInfo(),
                'created_at' => $company->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updated_at' => $company->getUpdatedAt()?->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse($companiesArray, 200);
    }

    #[Route('/new', name: 'api_companies_new', methods: ['POST'])]
    public function addCompany(Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? null;
        $type = $data['type'] ?? null;
        $location_id = $data['location_id'] ?? null;

        if (!$name || !$type || !$location_id) {
            return new JsonResponse(['error' => 'Missing required fields'], 400);
        }

        $company = new Companies();
        $company->setName($name);
        $company->setType($type);
        // You may need to fetch the location entity if needed
        // $company->setLocationId($location);
        $company->setDescription($data['description'] ?? null);
        $company->setContactInfo($data['contact_info'] ?? null);
        $company->setCreatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $company->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $entityManager->persist($company);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Successfully added!',
            'id' => $company->getId(),
        ], 201);
    }

    #[Route('/{id}', name: 'api_companies_show', methods: ['GET'])]
    public function showCompany(Companies $company): Response
    {
        return new JsonResponse([
            'id' => $company->getId(),
            'name' => $company->getName(),
            'type' => $company->getType(),
            'location_id' => $company->getLocationId()?->getId(),
            'description' => $company->getDescription(),
            'contact_info' => $company->getContactInfo(),
            'created_at' => $company->getCreatedAt()?->format('Y-m-d H:i:s'),
            'updated_at' => $company->getUpdatedAt()?->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/{id}', name: 'api_companies_update', methods: ['PUT', 'PATCH'])]
    public function updateCompany(Companies $company, Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['name'])) {
            $company->setName($data['name']);
        }
        if (isset($data['type'])) {
            $company->setType($data['type']);
        }
        if (isset($data['location_id'])) {
            // You may need to fetch the location entity if needed
            // $company->setLocationId($location);
        }
        if (isset($data['description'])) {
            $company->setDescription($data['description']);
        }
        if (isset($data['contact_info'])) {
            $company->setContactInfo($data['contact_info']);
        }
        $company->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $entityManager->flush();

        return new JsonResponse(['message' => 'Company updated']);
    }

    #[Route('/{id}', name: 'api_companies_delete', methods: ['DELETE'])]
    public function deleteCompany(Companies $company, EntityManagerInterface $entityManager): Response
    {
        $entityManager->remove($company);
        $entityManager->flush();
        return new JsonResponse(['message' => 'Company deleted']);
    }
}
