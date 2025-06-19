<?php

namespace App\Controller;

use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('/api/lightdark')]
class LightDarkController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    #[Route('/gettheme', methods: ['GET'])]
    public function getTheme(UsersRepository $usersRepository): JsonResponse
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken['username']]);
        
        return $this->json(['theme' => $user->getTheme()]);
    }

    #[Route('/settheme', methods: ['PUT'])]
    public function setTheme(UsersRepository $usersRepository, Request $request, EntityManagerInterface $em): JsonResponse 
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken['username']]);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $theme = $data['theme'] ?? null;
        if (!in_array($theme, ['light', 'dark', null], true)) {
            return $this->json(['error' => 'Invalid theme'], 400);
        }
        $user->setTheme($theme);
        $em->flush();
        return $this->json(['theme' => $user->getTheme()]);
    }
}
