<?php

namespace App\Controller;

use App\Entity\Users;
use App\Entity\Profile;
use App\Repository\LocationsRepository;
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

    function generateSecurePassword(int $length = 12, array $options = []): string 
    {
        if ($length < 8) {
            $length = 8;
        }
        
        // Default options
        $defaults = [
            'min_lowercase' => 1,
            'min_uppercase' => 1,
            'min_digits' => 1,
            'min_special' => 1,
            'exclude_ambiguous' => false, // Exclude 0, O, l, I, etc.
        ];
        
        $options = array_merge($defaults, $options);
        
        // Character sets
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $digits = '0123456789';
        $special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Exclude ambiguous characters if requested
        if ($options['exclude_ambiguous']) {
            $lowercase = str_replace(['l', 'o'], '', $lowercase);
            $uppercase = str_replace(['I', 'O'], '', $uppercase);
            $digits = str_replace(['0', '1'], '', $digits);
            $special = str_replace(['|', '`'], '', $special);
        }
        
        $password = '';
        $usedLength = 0;
        
        // Add minimum required characters
        for ($i = 0; $i < $options['min_lowercase']; $i++) {
            $password .= $lowercase[random_int(0, strlen($lowercase) - 1)];
            $usedLength++;
        }
        
        for ($i = 0; $i < $options['min_uppercase']; $i++) {
            $password .= $uppercase[random_int(0, strlen($uppercase) - 1)];
            $usedLength++;
        }
        
        for ($i = 0; $i < $options['min_digits']; $i++) {
            $password .= $digits[random_int(0, strlen($digits) - 1)];
            $usedLength++;
        }
        
        for ($i = 0; $i < $options['min_special']; $i++) {
            $password .= $special[random_int(0, strlen($special) - 1)];
            $usedLength++;
        }
        
        // Fill remaining length with random characters
        $allChars = $lowercase . $uppercase . $digits . $special;
        for ($i = $usedLength; $i < $length; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        return str_shuffle($password);
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
                'date_of_birth' => $user->getDateOfBirth() ? $user->getDateOfBirth()->format('Y-m-d') : null,
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
        
        if ($data['type'] === false) {
            if (!$user->isDisabled()) {
                return new JsonResponse(['error' => 'User is already enabled'], 400);
            }
            $user->setDisabled($data['type']);
            $entityManager->persist($user);
            $entityManager->flush();
            return new JsonResponse(['message' => 'User unbanned successfully'], 200);
        }
        if ($data['type'] === true) {
            if ($user->isDisabled()) {
                return new JsonResponse(['error' => 'User is already disabled'], 400);
            }
            $user->setDisabled($data['type']);
            $entityManager->persist($user);
            $entityManager->flush();
            return new JsonResponse(['error' => 'User banned successfully'], 200);
        }

        return new JsonResponse(['message' => 'Something went wrong'], 400);
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

    #[Route('/get', name: 'api_users_get', methods: ['GET'])]
    public function get(UsersRepository $usersRepository, Request $request): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $user_id = $request->query->get('user');

        if ($user_id) {
            $user = $usersRepository->find($user_id);
            if (!$user) {
                return new JsonResponse(['error' => 'User not found'], 404);
            }
        } else {
            return new JsonResponse(['error' => 'No user ID provided'], 400);
        }

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
            'location' => $user->getLocationId() ? $user->getLocationId()->getName() : null,
            'date_of_birth' => $user->getDateOfBirth() ? $user->getDateOfBirth()->format('Y-m-d') : null,
        ];

        return new JsonResponse($usersData, 200);
    }

    #[Route('/getbyid', name: 'api_users_get_by_id', methods: ['GET'])]
    public function getById(Request $request, UsersRepository $usersRepository): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        $id = $request->query->get('id');
        if (!$id) {
            return new JsonResponse(['error' => 'No id provided'], 400);
        }

        $user = $usersRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        $location = $user->getLocationId();
        $locationData = null;
        if ($location) {
            $locationData = [
                'id' => $location->getId(),
                'name' => $location->getName(),
                // Add more fields from Locations entity if needed
            ];
        }

        $usersData = [
            'id' => $user->getId(),
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
            'location' => $locationData,
        ];

        return new JsonResponse($usersData, 200);
    }

    #[Route('/register/temp', name: 'api_users_register_temp', methods: ['POST'])]
    public function registerTemp(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): Response {
        $user = new Users();
        $user->setEmail(uniqid('tmp_'));
        $user->setRole('ROLE_TEMP'); // Or use $data['role'] if you want to allow custom roles
        $user->setRoles(['ROLE_TEMP']); // Or use $data['role'] if you want to allow custom roles

        $password = $this->generateSecurePassword(12);
        $hashedPassword = $passwordHasher->hashPassword($user, $password);

        $user->setPassword($hashedPassword);

        $user->setFullName('Temporary User');

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

        return new JsonResponse(['username' => $user->getEmail(), 'password' => $password, 'roles' => $user->getRoles()], 201);
    }    #[Route('/update', name: 'api_users_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em,
        UsersRepository $repo,
        LocationsRepository $locationsRepository
    ): JsonResponse {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
        
        $user = $repo->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return new JsonResponse(['message' => 'Invalid JSON payload'], 400);
        }

        if (!isset($data['full_name']) || !isset($data['study_program']) || !isset($data['location']) || !isset($data['date_of_birth'])) {
            return new JsonResponse(['message' => 'Missing required fields'], 400);
        }

        $newDateOfBirth = \DateTime::createFromFormat('Y-m-d', $data['date_of_birth']);
        if ($user->getDateOfBirth() === null || $user->getDateOfBirth()->format('Y-m-d') !== $data['date_of_birth']) {
            $user->setDateOfBirth($newDateOfBirth);
        }

        if ($user->getFullName() !== $data['full_name']) {
            $user->setFullName($data['full_name'] ?? '');
        }

        if ($user->getStudyProgram() !== $data['study_program']) {
            $user->setStudyProgram($data['study_program'] ?? '');
        }

        $location = $locationsRepository->createQueryBuilder('l')
            ->where('LOWER(l.name) = LOWER(:name)')
            ->setParameter('name', $data['location'])
            ->getQuery()
            ->getOneOrNullResult();

        if ($user->getLocationId() !== $location) {
            $user->setLocationId($location ? $location : null);
        }

        $em->flush();

        return $this->json('Profile updated successfully', 200);
    }
}
