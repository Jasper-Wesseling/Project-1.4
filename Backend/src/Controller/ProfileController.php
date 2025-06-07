<?php

namespace App\Controller;

use App\Entity\Profile;
use App\Repository\ProfileRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Serializer\SerializerInterface;

class ProfileController extends AbstractController
{
    #[Route('/api/profile', name: 'api_profile_get', methods: ['GET'])]
    public function getProfile(TokenStorageInterface $tokenStorage, ProfileRepository $repo): JsonResponse
    {
        $user = $tokenStorage->getToken()?->getUser();
        if (!$user || !is_object($user)) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }

        $profile = $repo->findOneBy(['user' => $user]);

        if (!$profile) {
            return new JsonResponse(['message' => 'Profile not found'], 404);
        }

        return $this->json($profile, 200, [], ['groups' => 'profile:read']);
    }

    #[Route('/api/profile', name: 'api_profile_create', methods: ['POST'])]
    public function createProfile(
        Request $request,
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em,
        ProfileRepository $repo
    ): JsonResponse {
        $user = $tokenStorage->getToken()?->getUser();

        if (!$user || !is_object($user)) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }

        if ($repo->findOneBy(['user' => $user])) {
            return new JsonResponse(['message' => 'Profile already exists'], 400);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return new JsonResponse(['message' => 'Invalid JSON payload'], 400);
        }

        $profile = new Profile();
        $profile->setUser($user);
        $profile->setFullName($data['full_name'] ?? '');
        $profile->setAge($data['age'] ?? null);
        $profile->setStudyProgram($data['study_program'] ?? '');
        $profile->setLocation($data['location'] ?? '');
        $profile->setBio($data['bio'] ?? '');

        $em->persist($profile);
        $em->flush();

        return $this->json($profile, 201, [], ['groups' => 'profile:read']);
    }

    #[Route('/api/profile/update', name: 'api_profile_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em,
        ProfileRepository $repo
    ): JsonResponse {
        $user = $tokenStorage->getToken()?->getUser();

        if (!$user || !is_object($user)) {
            return new JsonResponse(['message' => 'User not authenticated'], 401);
        }

        $profile = $repo->findOneBy(['user' => $user]);

        if (!$profile) {
            return new JsonResponse(['message' => 'Profile not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return new JsonResponse(['message' => 'Invalid JSON payload'], 400);
        }

        $allowedFields = ['full_name', 'age', 'study_program', 'location', 'bio'];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $setter = 'set' . str_replace('_', '', ucwords($field, '_'));
                if (method_exists($profile, $setter)) {
                    $profile->$setter($data[$field]);
                }
            }
        }

        $em->flush();

        return $this->json($profile, 200, [], ['groups' => 'profile:read']);
    }
}
