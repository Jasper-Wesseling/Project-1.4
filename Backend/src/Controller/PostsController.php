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

        $posts = $qb->getQuery()->getResult();        $postsArray = [];
        foreach ($posts as $post) {
            $postUser = $post->getUserId();
            $postsArray[] = [
                'id' => $post->getId(),
                'title' => $post->getTitle(),
                'description' => $post->getDescription(),
                'type' => $post->getType(),
                'status' => $post->getStatus(),
                'created_at' => $post->getCreatedAt() ? $post->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updated_at' => $post->getUpdatedAt() ? $post->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'user_id' => $postUser ? $postUser->getId() : null,
                'post_user_id' => $postUser ? $postUser->getId() : null,
                'post_user_name' => $postUser ? $postUser->getFullName() : null,
                'post_user_avatar' => $postUser ? $postUser->getAvatarUrl() : null,
                'days_ago' => date_diff(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')), $post->getUpdatedAt())->days
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
    #[Route('/edit', name: 'api_posts_edit', methods: ['PUT'])]
    public function editPost(Request $request, PostsRepository $postsRepository, UsersRepository $usersRepository, EntityManagerInterface $entityManager): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        // get post
        $id = $request->query->get('id');
        if (!$id) {
            return new JsonResponse(['error' => 'Post ID missing'], 400);
        }
        $post = $postsRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);        }

        // check if post owner is the same as the user making the request
        $postUser = $post->getUserId();
        if (!$postUser || $postUser->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }

        $data = json_decode($request->getContent(), true);

        // change the fields that are changed
        if (isset($data['title'])) {
            $post->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $post->setDescription($data['description']);
        }
        if (isset($data['type'])) {
            $post->setType($data['type']);
        }

        $post->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $entityManager->persist($post);
        $entityManager->flush();

        return new JsonResponse("Post updated", 200);
    }

    #[Route('/delete', name: 'api_posts_delete', methods: ['DELETE'])]
    public function deletePost(Request $request, PostsRepository $postsRepository, UsersRepository $usersRepository, EntityManagerInterface $entityManager): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        // get post
        $id = $request->query->get('id');
        if (!$id) {
            return new JsonResponse(['error' => 'Post ID missing'], 400);
        }
        $post = $postsRepository->find($id);
        if (!$post) {
            return new JsonResponse(['error' => 'Post not found'], 404);        }

        // check if post owner is the same as the user making the request
        $postUser = $post->getUserId();
        if (!$postUser || $postUser->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }

        $entityManager->remove($post);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Post deleted'], 200);
    }    #[Route('/get/fromCurrentUser', name: 'api_posts_get_from_current_user', methods: ['GET'])]
    public function getPostsFromUser( Request $request, PostsRepository $postsRepository, UsersRepository $usersRepository ): Response {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        $search = $request->query->get('search', '');

        // Get posts from current user
        $qb = $postsRepository->createQueryBuilder('p')
            ->where('p.user_id = :user')
            ->setParameter('user', $user->getId())
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($search) {
            $qb->andWhere('LOWER(p.title) LIKE :search OR LOWER(p.description) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        $posts = $qb->getQuery()->getResult();        $postsArray = [];
        $now = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
        
        foreach ($posts as $post) {
            $postUser = $post->getUserId();
            $postsArray[] = [
                'id' => $post->getId(),
                'title' => $post->getTitle(),
                'description' => $post->getDescription(),
                'type' => $post->getType(),
                'status' => $post->getStatus(),
                'created_at' => $post->getCreatedAt() ? $post->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updated_at' => $post->getUpdatedAt() ? $post->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'user_id' => $postUser ? $postUser->getId() : null,
                'post_user_id' => $postUser ? $postUser->getId() : null,
                'post_user_name' => $postUser ? $postUser->getFullName() : null,
                'post_user_avatar' => $postUser ? $postUser->getAvatarUrl() : null,
                'days_ago' => $post->getUpdatedAt() ? $now->diff($post->getUpdatedAt())->days : null
            ];
        }

        return new JsonResponse($postsArray, 200);
    }
}
