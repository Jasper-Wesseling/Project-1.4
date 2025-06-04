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
            } elseif ($sortField === 'created_at') {
                $aCount = $a->getCreatedAt()?->getTimestamp() ?? 0;
                $bCount = $b->getCreatedAt()?->getTimestamp() ?? 0;
            } else {
                // fallback: sorteer op id
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

        $data = json_decode($request->getContent(), true);

        if (
            empty($data['title']) ||
            empty($data['content']) ||
            empty($data['category'])
        ) {
            return new JsonResponse(['error' => 'Missing fields'], 400);
        }

        $user = $this->getUser();
        $forum = new Forums();
        $forum->setTitle($data['title']);
        $forum->setContent($data['content']);
        $forum->setCategory($data['category']);
        $forum->setUserId($user);
        $forum->setCreatedAt(new \DateTime());
        $forum->setReplies([]);
        $forum->setLikes([]);
        $forum->setDislikes([]);
        $forum->setImage($data['image'] ?? null);

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
            'created_at' => (new \DateTime())->format('Y-m-d H:i:s'),
            'content' => $data['content'],
            'upvotes' => [],
            'downvotes' => []
        ];
        $forum->setReplies($replies);
        $em->flush();

        return $this->json(['success' => true, 'replies' => $replies]);
    }

    #[Route('/{id}/like', name: 'api_forums_like', methods: ['POST'])]
    public function like(int $id, ForumsRepository $forumsRepository, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $forum = $forumsRepository->find($id);
        if (!$forum) {
            return new JsonResponse(['error' => 'Forum not found'], 404);
        }

        $userId = $this->getUser()->getId(); 
        $likes = $forum->getLikes() ?? [];
        $dislikes = $forum->getDislikes() ?? [];

        // Voeg toe aan likes als nog niet geliked
        if (!in_array($userId, $likes)) {
            $likes[] = $userId;
            // Verwijder uit dislikes als daar aanwezig
            $dislikes = array_diff($dislikes, [$userId]);
        }
        $forum->setLikes($likes);
        $forum->setDislikes(array_values($dislikes));
        $em->flush();

        return $this->json(['success' => true, 'likes' => $likes]);
    }

    #[Route('/{id}/dislike', name: 'api_forums_dislike', methods: ['POST'])]
    public function dislike(int $id, ForumsRepository $forumsRepository, \Doctrine\ORM\EntityManagerInterface $em): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $forum = $forumsRepository->find($id);
        if (!$forum) {
            return new JsonResponse(['error' => 'Forum not found'], 404);
        }

        $user = $this->getUser();
        if (!$user || !method_exists($user, 'getId')) {
            return new JsonResponse(['error' => 'User not found or invalid'], 401);
        }
        $userId = $user->getId();
        $likes = $forum->getLikes() ?? [];
        $dislikes = $forum->getDislikes() ?? [];

        // Voeg toe aan dislikes als nog niet gedisliked
        if (!in_array($userId, $dislikes)) {
            $dislikes[] = $userId;
            // Verwijder uit likes als daar aanwezig
            $likes = array_diff($likes, [$userId]);
        }
        $forum->setLikes(array_values($likes));
        $forum->setDislikes($dislikes);
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

        // Init arrays als ze niet bestaan
        if (!isset($replies[$replyIndex]['upvotes'])) $replies[$replyIndex]['upvotes'] = [];
        if (!isset($replies[$replyIndex]['downvotes'])) $replies[$replyIndex]['downvotes'] = [];

        // Upvote
        if ($voteType === 'up') {
            if (!in_array($userId, $replies[$replyIndex]['upvotes'])) {
                $replies[$replyIndex]['upvotes'][] = $userId;
                // Verwijder uit downvotes als aanwezig
                $replies[$replyIndex]['downvotes'] = array_values(array_diff($replies[$replyIndex]['downvotes'], [$userId]));
            }
        }
        // Downvote
        elseif ($voteType === 'down') {
            if (!in_array($userId, $replies[$replyIndex]['downvotes'])) {
                $replies[$replyIndex]['downvotes'][] = $userId;
                // Verwijder uit upvotes als aanwezig
                $replies[$replyIndex]['upvotes'] = array_values(array_diff($replies[$replyIndex]['upvotes'], [$userId]));
            }
        } else {
            return new JsonResponse(['error' => 'Invalid vote type'], 400);
        }

        $forum->setReplies($replies);
        $em->flush();

        return $this->json(['success' => true, 'replies' => $replies]);
    }
}