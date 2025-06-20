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

    // Constructor: zet JWT en TokenStorage klaar
    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    // Haal het huidige thema van de gebruiker op
    #[Route('/gettheme', methods: ['GET'])]
    public function getTheme(UsersRepository $usersRepository): JsonResponse
    {
        // Haal gebruiker op via JWT token
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken['username']]);

        // Geef het thema terug
        return $this->json(['theme' => $user->getTheme()]);
    }

    // Zet het thema van de gebruiker
    #[Route('/settheme', methods: ['PUT'])]
    public function setTheme(UsersRepository $usersRepository, Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Haal gebruiker op via JWT token
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken['username']]);
        if (!$user) {
            // Gebruiker niet gevonden
            return $this->json(['error' => 'User not found'], 404);
        }

        // Haal nieuw thema uit de request
        $data = json_decode($request->getContent(), true);
        $theme = $data['theme'] ?? null;
        if (!in_array($theme, ['light', 'dark', null], true)) {
            // Ongeldig thema
            return $this->json(['error' => 'Invalid theme'], 400);
        }
        // Zet het thema en sla op
        $user->setTheme($theme);
        $em->flush();
        // Geef het nieuwe thema terug
        return $this->json(['theme' => $user->getTheme()]);
    }
}
