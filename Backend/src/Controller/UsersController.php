<?php

namespace App\Controller;

use App\Entity\Users;
use App\Entity\Profile;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('api/users')]
class UsersController extends AbstractController
{

    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }
    
    #[Route('/register', name: 'api_users_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): Response {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email']) || !isset($data['password']) || !isset($data['full_name'])) {
            return new JsonResponse(['error' => 'Missing email or password'], 400);
        }

        // Check if user with this email already exists
        $existingUser = $entityManager->getRepository(Users::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email already in use'], 409);
        }

        $user = new Users();
        $user->setEmail($data['email']);
        $user->setRole('ROLE_USER'); // Or use $data['role'] if you want to allow custom roles

        // Password strength check before hashing
        $password = $data['password'];
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
            return new JsonResponse([
                'error' => 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
            ], 400);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $user->setFullName($data['full_name']);

        // Optional fields
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['avatar_url'])) {
            $user->setAvatarUrl($data['avatar_url']);
        }
        if (isset($data['interests'])) {
            $user->setInterests($data['interests']);
        }
        if (isset($data['study_program'])) {
            $user->setStudyProgram($data['study_program']);
        }
        if (isset($data['language'])) {
            $user->setLanguage($data['language']);
        }
        if (isset($data['theme'])) {
            $user->setTheme($data['theme']);
        }
        // if (isset($data['location_id'])) {
        //     // You need to fetch the Locations entity from the database
        //     $location = $entityManager->getRepository(\App\Entity\Locations::class)->find($data['location_id']);
        //     if ($location) {
        //         $user->setLocationId($location);
        //     }
        // }
        if (isset($data['created_at'])) {
            $user->setCreatedAt(new \DateTime($data['created_at']));
        }
        if (isset($data['updated_at'])) {
            $user->setUpdatedAt(new \DateTime($data['updated_at']));
        }

        $errors = $validator->validate($user);

        if (count($errors) > 0) {
            $violations = [];

            foreach ($errors as $error) {
                $violations[] = [
                    'propertyPath' => $error->getPropertyPath(),
                    'message' => $error->getMessage(),
                ];
            }

            return new JsonResponse(['violations' => $violations], JsonResponse::HTTP_BAD_REQUEST);
        }
        $profile = new Profile();
        $profile->setUser($user);
        $profile->setFullName('');
        $profile->setAge(null);
        $profile->setStudyProgram('');
        $profile->setLocation('');
        $profile->setBio('');

        $entityManager->persist($user);
        $entityManager->persist($profile);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User created'], 201);
    }

    #[Route('/test', name: 'api_users_test', methods: ['GET'])]
    public function test(): Response
    {
        return new JsonResponse(['message' => 'test'], 201);
    }

    #[Route('/get', name: 'api_users_get', methods: ['GET'])]
    public function get(UsersRepository $usersRepository, Request $request): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 400);
        }

        $avatarUrl = $user->getAvatarUrl();
        if ($avatarUrl && str_starts_with($avatarUrl, '/')) {
            $avatarUrl = $request->getSchemeAndHttpHost() . $avatarUrl;
        } elseif (!$avatarUrl) {
            $avatarUrl = $request->getSchemeAndHttpHost() . '/uploads/avatar-placeholder.png';
        }

        $usersData = [
            'id' => $user->getId() ? $user->getId() : null,
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'role' => $user->getRole(),
            'full_name' => $user->getFullName(),
            'bio' => $user->getBio(),
            'avatar_url' => $avatarUrl,
            'interests' => $user->getInterests(),
            'study_program' => $user->getStudyProgram(),
            'language' => $user->getLanguage(),
            'theme' => $user->getTheme(),
            'location_id' => $user->getLocationId() ? $user->getLocationId()->getId() : null,
        ];

        return new JsonResponse($usersData, 200);
    }

    #[Route('/getbyid/{id}', name: 'api_users_getbyid', methods: ['GET'])]
    public function getById(UsersRepository $usersRepository, int $id, Request $request): Response
    {
        $user = $usersRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $avatarUrl = $user->getAvatarUrl();
        if ($avatarUrl && str_starts_with($avatarUrl, '/')) {
            $avatarUrl = $request->getSchemeAndHttpHost() . $avatarUrl;
        } elseif (!$avatarUrl) {
            $avatarUrl = $request->getSchemeAndHttpHost() . '/uploads/avatar-placeholder.png';
        }

        $usersData = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'role' => $user->getRole(),
            'full_name' => $user->getFullName(),
            'bio' => $user->getBio(),
            'avatar_url' => $avatarUrl,
            'interests' => $user->getInterests(),
            'study_program' => $user->getStudyProgram(),
            'language' => $user->getLanguage(),
            'theme' => $user->getTheme(),
            'location_id' => $user->getLocationId() ? $user->getLocationId()->getId() : null,
        ];

        return new JsonResponse($usersData, 200);
    }
}
