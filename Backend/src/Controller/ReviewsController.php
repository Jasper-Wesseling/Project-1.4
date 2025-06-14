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
        $user_id = $request->query->get('user');

        $user = $userRepository->find($user_id);

        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }

        // get reviews for the user
        $reviews = $reviewsRepository->findBy(['user' => $user]);
        if (!$reviews) {
            return new JsonResponse(['review_count' => 0, 'review_average' => 0], Response::HTTP_OK);
        }

        $reviewCount = count($reviews);
        $totalRating = 0;

        foreach ($reviews as $review) {
            $totalRating += $review->getRating();
        }

        $reviewAverage = $reviewCount > 0 ? round($totalRating / $reviewCount, 2) : 0;

        return new JsonResponse([
            'review_count' => $reviewCount,
            'review_average' => $reviewAverage
        ], Response::HTTP_OK);

    }

    #[Route('/new', name: 'new_review', methods: ['POST'])]
    public function newReview(Request $request, ReviewsRepository $reviewsRepository, UsersRepository $usersRepository, EntityManagerInterface $entityManager): Response
    {
        $user_id = $request->query->get('user');
        $data = json_decode($request->getContent(), true);


        $user = $usersRepository->findOneBy(['id' => $user_id]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $review = new Reviews();
        $review->setUserId($user);
        $review->setRating((int) $data['rating']);
        $review->setContent(null);
        $review->setDate(new \DateTime());

        $entityManager->persist($review);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Review created successfully'], Response::HTTP_CREATED);
    }
    
}
