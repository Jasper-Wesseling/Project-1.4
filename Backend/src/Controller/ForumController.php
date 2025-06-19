<?php

namespace App\Controller;

use App\Entity\Forums;
use App\Repository\ForumsRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/forums')]
class ForumController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    #[Route('/get', name: 'api_forums_list', methods: ['GET'])]
    public function list(Request $request, ForumsRepository $forumsRepository): JsonResponse
    {
        // JWT check
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $limit = (int) $request->query->get('limit', 10);
        $offset = (int) $request->query->get('offset', 0);

        // Filters
        $criteria = [];
        $category = $request->query->get('category');
        if ($category) {
            $criteria['category'] = $category;
        }

        // Haal eerst ALLE forums op die voldoen aan de criteria (zonder limit/offset)
        $forums = $forumsRepository->findBy($criteria, ['created_at' => 'DESC']);

        // Custom filter: search in title/content
        $search = $request->query->get('search');
        if ($search) {
            $forums = array_filter($forums, function (Forums $forum) use ($search) {
                return stripos($forum->getTitle(), $search) !== false ||
                    stripos($forum->getContent(), $search) !== false;
            });
        }

        // Custom sort
        $sortField = $request->query->get('sort', 'created_at');
        $sortOrder = strtolower($request->query->get('order', 'desc'));
        $forums = is_array($forums) ? $forums : iterator_to_array($forums);

        usort($forums, function ($a, $b) use ($sortField, $sortOrder) {
            if ($sortField === 'likes') {
                $aCount = count($a->getLikes() ?? []);
                $bCount = count($b->getLikes() ?? []);
                if ($aCount === $bCount) {
                    // Sorteer op datum als likes gelijk zijn
                    $aDate = $a->getCreatedAt()?->getTimestamp() ?? 0;
                    $bDate = $b->getCreatedAt()?->getTimestamp() ?? 0;
                    return $sortOrder === 'asc' ? $aDate <=> $bDate : $bDate <=> $aDate;
                }
            } elseif ($sortField === 'created_at') {
                $aCount = $a->getCreatedAt()?->getTimestamp() ?? 0;
                $bCount = $b->getCreatedAt()?->getTimestamp() ?? 0;
            } else {
                $aCount = $a->getId();
                $bCount = $b->getId();
            }
            return $sortOrder === 'asc' ? $aCount <=> $bCount : $bCount <=> $aCount;
        });

        // Pas nu pas limit/offset toe op het gefilterde en gesorteerde resultaat
        $forums = array_slice($forums, $offset, $limit);

        // Map naar array voor JSON output
        $data = array_map(function (Forums $forums) use ($request) {
            $image = $forums->getImage();
            if ($image && !str_starts_with($image, "http")) {
                $image = $request->getSchemeAndHttpHost() . $image;
            }
            $userImg = $forums->getUserId()->getAvatarUrl();
            if ($userImg && !str_starts_with($userImg, "http")) {
                $userImg = $request->getSchemeAndHttpHost() . $userImg;
            }
            return [
                'id' => $forums->getId(),
                'user_id_id' => $forums->getUserId()->getId(),
                'user_name' => $forums->getUserId()->getFullName(),
                'user_img' => $userImg,
                'title' => $forums->getTitle(),
                'content' => $forums->getContent(),
                'created_at' => $forums->getCreatedAt()?->format('Y-m-d H:i:s'),
                'category' => $forums->getCategory(),
                'image' => $image,
                'replies' => $forums->getReplies() ?? [],
                'likes' => $forums->getLikes() ?? [],
                'dislikes' => $forums->getDislikes() ?? [],
            ];
        }, $forums);

        if (empty($data)) {
            return $this->json([]);
        }

        return $this->json(array_values($data));
    }

    #[Route('/new', name: 'api_forums_create', methods: ['POST'])]
    public function create(Request $request, ForumsRepository $forumsRepository, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        // JWT check
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        // Haal data uit form-data
        $title = $request->request->get('title');
        $content = $request->request->get('content');
        $category = $request->request->get('category');
        $imageFile = $request->files->get('image');

        if (empty($title) || empty($content) || empty($category)) {
            return new JsonResponse(['error' => 'Missing fields'], 400);
        }

        $user = $this->getUser();
        $forum = new Forums();
        $forum->setTitle($title);
        $forum->setContent($content);
        $forum->setCategory($category);
        $forum->setUserId($user);
        $forum->setCreatedAt(new \DateTime('Europe/Amsterdam'));
        $forum->setReplies([]);
        $forum->setLikes([]);
        $forum->setDislikes([]);

        // Afbeelding opslaan indien aanwezig
        if ($imageFile) {
            $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads/forums';
            $newFileName = uniqid() . '.' . pathinfo($imageFile->getClientOriginalName(), PATHINFO_EXTENSION);

            try {
                $imageFile->move($uploadsDir, $newFileName);
                $forum->setImage('/uploads/forums/' . $newFileName);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'File upload failed: ' . $e->getMessage()], 400);
            }
        } else {
            $forum->setImage(null);
        }

        $em->persist($forum);
        $em->flush();

        return $this->json(['success' => true, 'id' => $forum->getId()]);
    }

    #[Route('/{id}/reply', name: 'api_forums_reply', methods: ['POST'])]
    public function reply(int $id, Request $request, ForumsRepository $forumsRepository, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $forum = $forumsRepository->find($id);
        if (!$forum) {
            return new JsonResponse(['error' => 'Forum not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['content'])) {
            return new JsonResponse(['error' => 'Missing content'], 400);
        }

        $replies = $forum->getReplies() ?? [];
        $replies[] = [
            'user_name' => $this->getUser()->getFullName(),
            'user_id' => $this->getUser()->getId(), 
            'created_at' => (new \DateTime('Europe/Amsterdam'))->format('Y-m-d H:i:s'),
            'content' => $data['content'],
            'upvotes' => [],
            'downvotes' => []
        ];
        $forum->setReplies($replies);
        $em->flush();

        return $this->json(['success' => true, 'replies' => $replies]);
    }

    #[Route('/{id}/like', name: 'api_forums_like', methods: ['POST'])]
    public function like(int $id, ForumsRepository $forumsRepository, Request $request, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $forum = $forumsRepository->find($id);
        if (!$forum) {
            return new JsonResponse(['error' => 'Forum not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $action = $data['action'] ?? 'like';

        $userId = $this->getUser()->getId();
        $likes = $forum->getLikes() ?? [];
        $dislikes = $forum->getDislikes() ?? [];

        if ($action === 'like') {
            if (!in_array($userId, $likes)) {
                $likes[] = $userId;
                $dislikes = array_diff($dislikes, [$userId]);
            }
        } elseif ($action === 'undo') {
            $likes = array_diff($likes, [$userId]);
        }
        $forum->setLikes(array_values($likes));
        $forum->setDislikes(array_values($dislikes));
        $em->flush();

        return $this->json(['success' => true, 'likes' => $likes]);
    }

    #[Route('/{id}/dislike', name: 'api_forums_dislike', methods: ['POST'])]
    public function dislike(int $id, ForumsRepository $forumsRepository, Request $request, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $forum = $forumsRepository->find($id);
        if (!$forum) {
            return new JsonResponse(['error' => 'Forum not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $action = $data['action'] ?? 'dislike';

        $userId = $this->getUser()->getId();
        $likes = $forum->getLikes() ?? [];
        $dislikes = $forum->getDislikes() ?? [];

        if ($action === 'dislike') {
            if (!in_array($userId, $dislikes)) {
                $dislikes[] = $userId;
                $likes = array_diff($likes, [$userId]);
            }
        } elseif ($action === 'undo') {
            $dislikes = array_diff($dislikes, [$userId]);
        }
        $forum->setLikes(array_values($likes));
        $forum->setDislikes(array_values($dislikes));
        $em->flush();

        return $this->json(['success' => true, 'dislikes' => $dislikes]);
    }

    #[Route('/{id}/reply-vote', name: 'api_forums_reply_vote', methods: ['POST'])]
    public function replyVote(int $id, Request $request, ForumsRepository $forumsRepository, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $forum = $forumsRepository->find($id);
        if (!$forum) {
            return new JsonResponse(['error' => 'Forum not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['reply_index']) || !isset($data['vote'])) {
            return new JsonResponse(['error' => 'Missing fields'], 400);
        }

        $userId = $this->getUser()->getId();
        $voteType = $data['vote']; // 'up', 'down', 'undo-up', 'undo-down'
        $replyIndex = (int)$data['reply_index'];

        $replies = $forum->getReplies() ?? [];
        if (!isset($replies[$replyIndex])) {
            return new JsonResponse(['error' => 'Reply not found'], 404);
        }

        if (!isset($replies[$replyIndex]['upvotes'])) $replies[$replyIndex]['upvotes'] = [];
        if (!isset($replies[$replyIndex]['downvotes'])) $replies[$replyIndex]['downvotes'] = [];

        if ($voteType === 'up') {
            if (!in_array($userId, $replies[$replyIndex]['upvotes'])) {
                $replies[$replyIndex]['upvotes'][] = $userId;
                $replies[$replyIndex]['downvotes'] = array_values(array_diff($replies[$replyIndex]['downvotes'], [$userId]));
            }
        } elseif ($voteType === 'down') {
            if (!in_array($userId, $replies[$replyIndex]['downvotes'])) {
                $replies[$replyIndex]['downvotes'][] = $userId;
                $replies[$replyIndex]['upvotes'] = array_values(array_diff($replies[$replyIndex]['upvotes'], [$userId]));
            }
        } elseif ($voteType === 'undo-up') {
            $replies[$replyIndex]['upvotes'] = array_values(array_diff($replies[$replyIndex]['upvotes'], [$userId]));
        } elseif ($voteType === 'undo-down') {
            $replies[$replyIndex]['downvotes'] = array_values(array_diff($replies[$replyIndex]['downvotes'], [$userId]));
        } else {
            return new JsonResponse(['error' => 'Invalid vote type'], 400);
        }

        $forum->setReplies($replies);
        $em->flush();

        return $this->json(['success' => true, 'replies' => $replies]);
    }

    #[Route('/{id}', name: 'api_forums_get_one', methods: ['GET'])]
    public function getOne(int $id, ForumsRepository $forumsRepository, Request $request): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $forum = $forumsRepository->find($id);
        if (!$forum) {
            return new JsonResponse(['error' => 'Forum not found'], 404);
        }

        $image = $forum->getImage();
        if ($image && !str_starts_with($image, "http")) {
            $image = $request->getSchemeAndHttpHost() . $image;
        }
        $userImg = $forum->getUserId()->getAvatarUrl();
        if ($userImg && !str_starts_with($userImg, "http")) {
            $userImg = $request->getSchemeAndHttpHost() . $userImg;
        }

        $data = [
            'id' => $forum->getId(),
            'user_id_id' => $forum->getUserId()->getId(),
            'user_name' => $forum->getUserId()->getFullName(),
            'user_img' => $userImg,
            'title' => $forum->getTitle(),
            'content' => $forum->getContent(),
            'created_at' => $forum->getCreatedAt()?->format('Y-m-d H:i:s'),
            'category' => $forum->getCategory(),
            'image' => $image,
            'replies' => $forum->getReplies() ?? [],
            'likes' => $forum->getLikes() ?? [],
            'dislikes' => $forum->getDislikes() ?? [],
        ];

        return $this->json($data);
    }
}