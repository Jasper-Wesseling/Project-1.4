<?php

namespace App\Controller;

use App\Entity\Messages;
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
    public function getMessages(Request $request, MessagesRepository $messagesRepository, UsersRepository $usersRepository): JsonResponse
    {
        $since = new \DateTime('-1 minute', new \DateTimeZone('Europe/Amsterdam')); // since 1 minute ago
        
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $sendUser = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        
        $reciever= $request->query->get('reciever', 1);
        $recieveUser = $usersRepository->findOneBy(['user_id' => $reciever]);

        if (!$recieveUser || !$sendUser) 
        {
            return new JsonResponse(['error' => 'User not found'], 401);
        }


        $qb = $messagesRepository->createQueryBuilder('m')
            ->orderBy('m.timestamp', 'ASC')
            ->andWhere('m.timestamp < :since')
            ->andWhere('
                (m.sender_id = :sendUser AND m.receiver_id = :recieveUser)
                OR
                (m.sender_id = :recieveUser AND m.receiver_id = :sendUser)
            ')
            ->setParameter('since', $since->format('Y-m-d H:i:s'))
            ->setParameter('sendUser', $sendUser->getId())
            ->setParameter('recieveUser', $recieveUser);

        $messages = $qb->getQuery()->getResult();

        // Convert messages to array as needed
        $messagesArray = [];
        foreach ($messages as $message) {
            $messagesArray[] = [
                'content' => $message->getContent(),
                'timestamp' => $message->getTimeStamp()->format('Y-m-d H:i:s'),
                'sender' => $message->getSenderId()->getId(),
            ];
        }

        return new JsonResponse($messagesArray);
    }

    #[Route('/new', name: 'new_message', methods: ['POST'])]
    public function newMessage(Request $request, UsersRepository $usersRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $receiver = $data['receiver'] ?? null;
        $content = $data['content'] ?? null;
        if (!$receiver || !$content)
        {
            return new JsonResponse('No content or reciever', 402);
        }

        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $sendUser = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);


        
        $receiverUser = $usersRepository->findOneBy(['user_id' => $receiver]);

        if (!$receiverUser || !$sendUser) 
        {
            return new JsonResponse(['error' => 'User not found'], 401);
        }


        $message = new Messages();
        $message->setSenderId($sendUser);
        $message->setReceiverId($receiverUser);
        $message->setTimestamp(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $currentContent = $message->getContent();
        if (empty($currentContent)) 
        {
            $currentContent = [];
        }

        $message = $entityManager->getRepository(Messages::class)->findOneBy([
            'sender_id' => $sendUser,
            'receiver_id' => $receiverUser
        ]);

        if (!$message) {
            $message = $entityManager->getRepository(Messages::class)->findOneBy([
                'sender_id' => $receiverUser,
                'receiver_id' => $sendUser
            ]);
        }

        if (!$message) {
            $message = new Messages();
            $message->setSenderId($sendUser);
            $message->setReceiverId($receiverUser);
            $message->setTimestamp(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
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
