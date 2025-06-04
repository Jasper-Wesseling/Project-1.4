<?php

namespace App\Controller;

use App\Entity\Users;
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
    
    #[Route('/admin/getall', name: 'api_users_admin_getall', methods: ['GET'])]
    public function admin(UsersRepository $usersRepository): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
        
        $users = $usersRepository->findAll();
        if (!$users) {
            return new JsonResponse(['error' => 'No users found'], 404);
        }

        $usersData = [];
        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId() ? $user->getId() : null,
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'role' => $user->getRole(),
                'full_name' => $user->getFullName(),
                'bio' => $user->getBio(),
                'avatar_url' => $user->getAvatarUrl(),
                'interests' => $user->getInterests(),
                'study_program' => $user->getStudyProgram(),
                'language' => $user->getLanguage(),
                'theme' => $user->getTheme(),
                'location_id' => $user->getLocationId() ? $user->getLocationId()->getId() : null,
                'disabled' => $user->isDisabled(),
            ];
        }

        return new JsonResponse($usersData, 200);


    }

    #[Route('/admin/ban', name: 'api_users_admin_ban', methods: ['PUT'])]
    public function adminBan(
        Request $request,
        EntityManagerInterface $entityManager,
        UsersRepository $usersRepository
    ): Response {
        $data = json_decode($request->getContent(), true);


        if (!isset($data['id'])) {
            return new JsonResponse(['error' => 'Missing id'], 400);
        }

        $user = $usersRepository->findOneBy(['id' => $data['id']]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }
        if (user->isBanned()) {
            return new JsonResponse(['error' => 'User is already banned'], 400);
        }
        

        $user->setDisabled(true);
        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User banned successfully'], 200);
    }

    #[Route('/admin/role', name: 'api_users_admin_role', methods: ['PUT'])]
    function setRole(
        Request $request,
        EntityManagerInterface $entityManager,
        UsersRepository $usersRepository
    ): Response {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['id'])) {
            return new JsonResponse(['error' => 'Missing id'], 400);
        }

        $user = $usersRepository->findOneBy(['id' => $data['id']]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $role = $data['role'] ?? null;
        if (!$role || !in_array($role, ['ROLE_USER', 'ROLE_ADMIN'])) {
            return new JsonResponse(['error' => 'Invalid role'], 400);
        }
        if ($role === 'ROLE_ADMIN' && in_array('ROLE_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'User is already an admin'], 400);
        }

        if ($role === 'ROLE_USER') {
            $user->setRoles([]);
        }
        if ($role === 'ROLE_ADMIN') {
            $user->setRoles(['ROLE_ADMIN']);
        }
        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User set as admin successfully'], 200);
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

        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User created'], 201);
    }

    #[Route('/test', name: 'api_users_test', methods: ['GET'])]
    public function test(): Response
    {
        return new JsonResponse(['message' => 'test'], 201);
    }

    #[Route('/get', name: 'api_users_get', methods: ['GET'])]
    public function get(UsersRepository $usersRepository): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 400);
        }
        $usersData = [
            'id' => $user->getId() ? $user->getId() : null,
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'role' => $user->getRole(),
            'full_name' => $user->getFullName(),
            'bio' => $user->getBio(),
            'avatar_url' => $user->getAvatarUrl(),
            'interests' => $user->getInterests(),
            'study_program' => $user->getStudyProgram(),
            'language' => $user->getLanguage(),
            'theme' => $user->getTheme(),
            'location_id' => $user->getLocationId() ? $user->getLocationId()->getId() : null,
        ];

        return new JsonResponse($usersData, 200);
    }


}
