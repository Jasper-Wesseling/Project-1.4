<?php

namespace App\Controller;

use App\Entity\Reviews;
use App\Repository\ReviewsRepository;
use App\Repository\UserRepository;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/reviews', name: 'api_reviews')]
class ReviewsController extends AbstractController
{

    #[Route('/get', name: 'get_reviews', methods: ['GET'])]
    public function getReviews(Request $request, UserRepository $userRepository, ReviewsRepository $reviewsRepository): Response
    {
        // Haal de user_id uit de query parameters
        $user_id = $request->query->get('user');

        // Zoek de gebruiker op basis van het ID
        $user = $userRepository->find($user_id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }

        // Haal alle reviews op voor deze gebruiker
        $reviews = $reviewsRepository->findBy(['user' => $user]);
        if (!$reviews) {
            return new JsonResponse(['review_count' => 0, 'review_average' => 0], Response::HTTP_OK);
        }

        // Bereken het aantal reviews en de totale beoordeling
        $reviewCount = count($reviews);
        $totalRating = 0;

        // Loop door alle reviews om de totale beoordeling te berekenen
        foreach ($reviews as $review) {
            $totalRating += $review->getRating();
        }

        // Bereken het gemiddelde (afgerond op 2 decimalen)
        $reviewAverage = $reviewCount > 0 ? round($totalRating / $reviewCount, 2) : 0;

        return new JsonResponse([
            'review_count' => $reviewCount,
            'review_average' => $reviewAverage
        ], Response::HTTP_OK);

    }

    #[Route('/new', name: 'new_review', methods: ['POST'])]
    public function newReview(Request $request, ReviewsRepository $reviewsRepository, UsersRepository $usersRepository, EntityManagerInterface $entityManager): Response
    {
        // Haal de user_id uit de query parameters
        $user_id = $request->query->get('user');
        // Decodeer de JSON data uit de request body
        $data = json_decode($request->getContent(), true);

        // Zoek de gebruiker op basis van het ID
        $user = $usersRepository->findOneBy(['id' => $user_id]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        // Maak een nieuwe review aan
        $review = new Reviews();
        $review->setUserId($user);
        $review->setRating((int) $data['rating']);
        $review->setContent(null);
        $review->setDate(new \DateTime());

        // Sla de review op in de database
        $entityManager->persist($review);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Review created successfully'], Response::HTTP_CREATED);
    }
    
}
