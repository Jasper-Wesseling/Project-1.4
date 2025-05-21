<?php

namespace App\Controller;

use App\Entity\Users;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/Users')]
class UsersController extends AbstractController
{
    #[Route('/{id}', methods: ['GET'])]
    public function getUserById(Users $user): JsonResponse
    {
        return $this->json([
            'id' => $user->getId(),
            'full_name' => $user->getFullName(),
        ]);
    }
}
