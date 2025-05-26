<?php

namespace App\Controller;

use App\Entity\Posts;
use App\Repository\PostsRepository;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('api/posts')]
class PostsController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    #[Route('/get', name: 'api_posts_get', methods: ['GET'])]
    public function getPreviewposts(Request $request, PostsRepository $postsRepository, UsersRepository $usersRepository): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        $page = max(1, (int)$request->query->get('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;
        $search = $request->query->get('search', '');
        $type = $request->query->get('type', null);

        $qb = $postsRepository->createQueryBuilder('p')
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($type) {
            $qb->andWhere('p.type = :type')
               ->setParameter('type', $type);
        }
        if ($search) {
            $qb->andWhere('LOWER(p.title) LIKE :search OR LOWER(p.description) LIKE :search')
            ->setParameter('search', '%' . strtolower($search) . '%');
        }

        $posts = $qb->getQuery()->getResult();

        $postsArray = [];
        foreach ($posts as $post) {
            $postsArray[] = [
                'id' => $post->getId(),
                'title' => $post->getTitle(),
                'description' => $post->getDescription(),
                'type' => $post->getType(),
                'status' => $post->getStatus(),
                'created_at' => $post->getCreatedAt() ? $post->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updated_at' => $post->getUpdatedAt() ? $post->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'user_id' => $post->getUserId() ? $post->getUserId()->getId() : null,
            ];
        }

        return new JsonResponse($postsArray, 200);
    }

    #[Route('/new', name: 'api_posts_new', methods: ['POST'])]
    public function addpost(Request $request, EntityManagerInterface $entityManager, UsersRepository $usersRepository) : Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        $data = json_decode($request->getContent(), true);

        // Get fields from FormData
        $title = $data['title'];
        $description = $data['description'];
        $type = $data['type'];

        // Validation (add more as needed)
        if (!$title || !$description || !$type) {
            return new JsonResponse(['error' => 'Missing required fields'], 400);
        }

        $post = new Posts();
        $post->setUserId($user);
        $post->setTitle($title);
        $post->setDescription($description);
        $post->setType($type);
        $post->setStatus('Needs help');
        $post->setCreatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $post->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));


        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Successfully added!',
        ], 201);
    }
}
