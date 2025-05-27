<?php

namespace App\Controller;

use App\Repository\UsersRepository;
use App\Repository\WidgetsRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('api/widgets')]
class WidgetsController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }
    
    // Simuleer data ophalen
    #[Route('/get', name: 'api_widgets_get', methods: ['GET'])]
    public function getWidgets(WidgetsRepository $widgetsRepository, UsersRepository $usersRepository): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }

        $widgets = $widgetsRepository->findBy(['enabled' => true, 'user' => $user]);
        if (!$widgets) {
            return $this->json(['error' => 'No widgets found'], Response::HTTP_NOT_FOUND);
        }

        foreach ($widgets as $widget) {
            $widgetsArray[] = [
                'enabled' => $widget->isEnabled(),
            ];
        }
        
        return new JsonResponse($widgetsArray, 200);
    }

    // Simuleer data opslaan
    #[Route('/{id}', methods: ['PUT'])]
    public function updateWidgets(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Hier zou je normaal je Entity ophalen en updaten

        // Simuleer opslaan en geef terug wat er is opgeslagen
        return $this->json([
            'promo' => $data['promo'] ?? false,
            'recommended' => $data['recommended'] ?? false
        ]);
    }
}
