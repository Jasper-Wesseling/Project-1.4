<?php

namespace App\Controller;

use App\Entity\Messages;
use App\Entity\Posts;
use App\Entity\Products;
use App\Repository\MessagesRepository;
use App\Repository\UsersRepository;
use DateTime;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/messages')]
class MessagesController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    #[Route('/get', name: 'get_messages', methods: ['GET'])]
    public function getMessages(Request $request, MessagesRepository $messagesRepository, UsersRepository $usersRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $sendUser = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        
        $reciever= $request->query->get('reciever', 1);
        $recieveUser = $usersRepository->findOneBy(['id' => $reciever]);

        $productId= $request->query->get('product', 1);
        $bountyId= $request->query->get('bounty', 1);
        $product = $entityManager->getRepository(Products::class)->find($productId);
        $bounty = $entityManager->getRepository(Products::class)->find($bountyId);


        if (!$recieveUser || !$sendUser) 
        {
            return new JsonResponse(['error' => 'User not found'], 401);
        }


        // Determine whether to use product or bounty for the query
        $qb = $messagesRepository->createQueryBuilder('m')
            ->orderBy('m.timestamp', 'ASC')
            ->andWhere('
            (m.sender_id = :sendUser AND m.receiver_id = :recieveUser)
            OR
            (m.sender_id = :recieveUser AND m.receiver_id = :sendUser)
            ')
            ->setParameter('sendUser', $sendUser->getId())
            ->setParameter('recieveUser', $recieveUser);

        if ($bounty) {
            $qb->andWhere('m.post_id = :bounty')
               ->setParameter('bounty', $bounty);
        } elseif ($product) {
            $qb->andWhere('m.product_id = :product')
               ->setParameter('product', $product);
        }

        $message = $qb->getQuery()->getResult();


        return new JsonResponse([
            'messages' => isset($message[0]) ? $message[0]->getContent() : [''],
            'receiver' => $recieveUser->getFullName(),
        ], 200);
    }

    #[Route('/new', name: 'new_message', methods: ['POST'])]
    public function newMessage(Request $request, UsersRepository $usersRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $product = null;
        $bounty = null;
        $data = json_decode($request->getContent(), true);
        $receiver = $data['receiver'] ?? null;
        $content = $data['content'] ?? null;
        $productId = $data['product'] ?? null;
        $bountyId = $data['bounty'] ?? null;
        if ($bountyId) {
            $bounty = $entityManager->getRepository(Posts::class)->find($bountyId);

        }
        if ($productId) {
            $product = $entityManager->getRepository(Products::class)->find($productId);

        }
        if (!$receiver || !$content || (!$product && !$bounty))
        {
            return new JsonResponse('Missing content,reciever or item', 402);
        }

        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $sendUser = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);


        
        $receiverUser = $usersRepository->findOneBy(['id' => $receiver]);

        if (!$receiverUser || !$sendUser)
        {
            return new JsonResponse(['error' => 'User not found'], 401);
        }


        $message = new Messages();
        $message->setSenderId($sendUser);
        $message->setReceiverId($receiverUser);
        $message->setTimestamp(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        if ($bounty) {
            $message->setPostId($bounty);
        }
        if ($product) {
            $message->setProductId($product);
        }
        $currentContent = $message->getContent();
        if (empty($currentContent)) 
        {
            $currentContent = [];
        }

        $criteria = [
            'sender_id' => $sendUser,
            'receiver_id' => $receiverUser,
        ];
        if ($bounty) {
            $criteria['post_id'] = $bounty;
        }
        if ($product) {
            $criteria['product_id'] = $product;
        }

        $message = $entityManager->getRepository(Messages::class)->findOneBy($criteria);

        if (!$message) {
            $criteriaSwapped = [
                'sender_id' => $receiverUser,
                'receiver_id' => $sendUser,
            ];
            if ($bounty) {
                $criteriaSwapped['post_id'] = $bounty;
            }
            if ($product) {
                $criteriaSwapped['product_id'] = $product;
            }
            $message = $entityManager->getRepository(Messages::class)->findOneBy($criteriaSwapped);
        }

        if (!$message) {
            $message = new Messages();
            $message->setSenderId($sendUser);
            $message->setReceiverId($receiverUser);
            $message->setTimestamp(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
            if ($bounty) {
                $message->setPostId($bounty);

            }
            if ($product) {
                $message->setProductId($product);
            }
            $currentContent = [];
        } else {
            $currentContent = $message->getContent();
            if (empty($currentContent)) {
                $currentContent = [];
            }
        }


        $currentContent[] = [
            "content" => $content,
            "timestamp" => (new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')))->format('Y-m-d H:i:s'),
            "sender" => $sendUser->getId(),
        ];




        $message->setContent($currentContent);

        $entityManager->persist($message);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Successfully added!',
        ], 201);
    }

    #[Route('/get_preview', name: 'get_messages_preview', methods: ['GET'])]
    public function getMessagesPreview(Request $request, MessagesRepository $messagesRepository, UsersRepository $usersRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);

        $qb = $messagesRepository->createQueryBuilder('m')
            ->orderBy('m.timestamp', 'ASC')
            ->andWhere('
                (m.sender_id = :user)
                OR
                (m.receiver_id = :user)
            ')
            ->setParameter('user', $user);


        $messages = $qb->getQuery()->getResult();

        $messagesArray = [];
        foreach ($messages as $message) {
            $contentArray = $message->getContent();
            $latestMessage = end($contentArray) ?: null;

            if ($latestMessage) {
            $senderId = $latestMessage['sender'];
            $senderUser = $message->getSenderId();
            $receiverUser = $message->getReceiverId();

            // Determine the other user
            if ($senderUser->getId() == $senderId) {
                $otherUser = $receiverUser;
            } else {
                $otherUser = $senderUser;
            }

            $messagesArray[] = [
                'content' => $latestMessage['content'] ? $latestMessage['content'] : '',
                'sender' => $senderUser->getFullName(),
                'receiver' => $otherUser->getFullName(),
                'sender_id' => $senderUser->getId(),
                'receiver_id' => $receiverUser->getId(),
                'product' => $message->getProductId()->getId(),
                'timestamp' => $latestMessage['timestamp'] ?? $message->getTimestamp()->format('Y-m-d H:i:s'),
                'days_ago' => date_diff(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')), new \DateTime($latestMessage['timestamp']))->days
            ];
            }
        }

        return new JsonResponse($messagesArray, 200);
    }
}
