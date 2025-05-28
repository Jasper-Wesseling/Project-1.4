<?php

namespace App\Controller;

use App\Entity\Messages;
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
        $product = $entityManager->getRepository(Products::class)->find($productId);


        if (!$recieveUser || !$sendUser) 
        {
            return new JsonResponse(['error' => 'User not found'], 401);
        }


        $qb = $messagesRepository->createQueryBuilder('m')
            ->orderBy('m.timestamp', 'ASC')
            ->andWhere('
                (m.sender_id = :sendUser AND m.receiver_id = :recieveUser)
                OR
                (m.sender_id = :recieveUser AND m.receiver_id = :sendUser)
            ')
            ->andWhere('m.product_id = :product')
            ->setParameter('sendUser', $sendUser->getId())
            ->setParameter('product', $product)
            ->setParameter('recieveUser', $recieveUser);

        $messages = $qb->getQuery()->getResult();

        // Convert messages to array as needed
        $messagesArray = [];
        foreach ($messages as $message) {
            $messagesArray[] = [
                'content' => $message->getContent(),
            ];
        }

        return new JsonResponse($message->getContent(), 200);
    }

    #[Route('/new', name: 'new_message', methods: ['POST'])]
    public function newMessage(Request $request, UsersRepository $usersRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $receiver = $data['receiver'] ?? null;
        $content = $data['content'] ?? null;
        $productId = $data['product'] ?? null;
        $product = $entityManager->getRepository(Products::class)->find($productId);

        if (!$receiver || !$content || !$product)
        {
            return new JsonResponse('Missing content,reciever or product', 402);
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
        $message->setProductId($product);
        $currentContent = $message->getContent();
        if (empty($currentContent)) 
        {
            $currentContent = [];
        }

        $message = $entityManager->getRepository(Messages::class)->findOneBy([
            'sender_id' => $sendUser,
            'receiver_id' => $receiverUser,
            'product_id' => $product
        ]);

        if (!$message) {
            $message = $entityManager->getRepository(Messages::class)->findOneBy([
                'sender_id' => $receiverUser,
                'receiver_id' => $sendUser,
                'product_id' => $product
            ]);
        }

        if (!$message) {
            $message = new Messages();
            $message->setSenderId($sendUser);
            $message->setReceiverId($receiverUser);
            $message->setTimestamp(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
            $message->setProductId($product);
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
}
