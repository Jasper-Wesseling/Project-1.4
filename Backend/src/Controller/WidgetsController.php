<?php

namespace App\Controller;

use App\Entity\Widgets;
use App\Repository\UsersRepository;
use App\Repository\WidgetsRepository;
use Doctrine\ORM\EntityManagerInterface;
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

    /**
     * Constructor - initialiseert JWT services
     */
    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    /**
     * Haalt alle widgets op voor de huidige gebruiker
     */
    #[Route('/get', name: 'api_widgets_get', methods: ['GET'])]
    public function getWidgets(
        Request $request,
        WidgetsRepository $widgetsRepository,
        UsersRepository $usersRepository
    ): Response {
        // Haal user op uit JWT token
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        
        // Controleer of user bestaat
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }

        // Haal widgets op voor deze user
        $widgets = $widgetsRepository->findBy(['user_id' => $user]);
        
        // Zet om naar frontend structuur: { promo: true, recommended: false, ... }
        $widgetsArray = [];
        foreach ($widgets as $widget) {
            $widgetsArray[$widget->getWidget()] = $widget->isEnabled();
        }

        // Standaardwaarden instellen als er nog geen widgets zijn
        if (empty($widgetsArray)) {
            $widgetsArray = [
                'promo' => false,
                'recommended' => false
            ];
        }

        return new JsonResponse($widgetsArray, 200);
    }

    /**
     * Werkt widget instellingen bij voor de huidige gebruiker
     */
    #[Route('/update', name: 'api_widgets_update', methods: ['PUT'])]
    public function updateWidgets(
        Request $request,
        WidgetsRepository $widgetsRepository,
        UsersRepository $usersRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        // Decode JSON request data
        $data = json_decode($request->getContent(), true);

        // Haal user op uit JWT token
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        
        // Controleer of user bestaat
        if (!$user) {
            return $this->json(['error' => 'User not found'], Response::HTTP_UNAUTHORIZED);
        }

        // Loop door alle widgets in de request en werk ze bij
        foreach ($data['widgets'] as $widgetName => $enabled) {
            // Zoek bestaande widget of maak nieuwe aan
            $widget = $widgetsRepository->findOneBy(['user_id' => $user, 'widget' => $widgetName]);
            if (!$widget) {
                // Maak nieuwe widget aan als deze nog niet bestaat
                $widget = new Widgets();
                $widget->setUserId($user);
                $widget->setWidget($widgetName);
            }
            
            // Stel enabled status in
            $widget->setEnabled($enabled);
            $em->persist($widget);
        }
        
        // Sla alle wijzigingen op in database
        $em->flush();

        // Geef de nieuwe widgetstatussen terug
        return $this->json($data['widgets']);
    }
}