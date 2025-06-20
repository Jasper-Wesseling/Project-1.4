<?php

namespace App\Controller;

use App\Entity\Users;
use App\Entity\Profile;
use App\Entity\Companies;
use App\Entity\Locations;
use App\Repository\LocationsRepository;
use App\Repository\ReviewsRepository;

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

    /**
     * Genereert een veilig wachtwoord met configureerbare opties
     * 
     * @param int $length Lengte van het wachtwoord (minimum 8)
     * @param array $options Configuratie opties voor wachtwoord generatie
     * @return string Het gegenereerde wachtwoord
     */
    function generateSecurePassword(int $length = 12, array $options = []): string 
    {
        // Minimale lengte van 8 karakters afdwingen
        if ($length < 8) {
            $length = 8;
        }
        
        // Standaard opties
        $defaults = [
            'min_lowercase' => 1,
            'min_uppercase' => 1,
            'min_digits' => 1,
            'min_special' => 1,
            'exclude_ambiguous' => false, // Ambigue karakters uitsluiten (0, O, l, I, etc.)
        ];
        
        $options = array_merge($defaults, $options);
        
        // Karakter sets
        $lowercase = 'abcdefghijklmnopqrstuvwxyz';
        $uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $digits = '0123456789';
        $special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Ambigue karakters uitsluiten indien gewenst
        if ($options['exclude_ambiguous']) {
            $lowercase = str_replace(['l', 'o'], '', $lowercase);
            $uppercase = str_replace(['I', 'O'], '', $uppercase);
            $digits = str_replace(['0', '1'], '', $digits);
            $special = str_replace(['|', '`'], '', $special);
        }
        
        $password = '';
        $usedLength = 0;
        
        // Minimum vereiste karakters toevoegen
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
        
        // Resterende lengte vullen met willekeurige karakters
        $allChars = $lowercase . $uppercase . $digits . $special;
        for ($i = $usedLength; $i < $length; $i++) {
            $password .= $allChars[random_int(0, strlen($allChars) - 1)];
        }
        
        // Wachtwoord karakters door elkaar husselen
        return str_shuffle($password);
    }
    
    /**
     * Admin endpoint om alle gebruikers op te halen
     */
    #[Route('/admin/getall', name: 'api_users_admin_getall', methods: ['GET'])]
    public function admin(UsersRepository $usersRepository): Response
    {
        // JWT token valideren
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
        
        // Alle gebruikers ophalen
        $users = $usersRepository->findAll();
        if (!$users) {
            return new JsonResponse(['error' => 'No users found'], 404);
        }

        // Gebruikersdata formatteren voor response
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
                'disabled' => $user->getRoles() ? in_array('ROLE_DISABLED', $user->getRoles()) : false,
                'date_of_birth' => $user->getDateOfBirth() ? $user->getDateOfBirth()->format('Y-m-d') : null,
            ];
        }

        return new JsonResponse($usersData, 200);
    }

    /**
     * Admin endpoint om gebruiker te bannen/ontbannen
     */
    #[Route('/admin/ban', name: 'api_users_admin_ban', methods: ['PUT'])]
    public function adminBan(
        Request $request,
        EntityManagerInterface $entityManager,
        UsersRepository $usersRepository
    ): Response {
        $data = json_decode($request->getContent(), true);

        // Controleren of ID aanwezig is
        if (!isset($data['id'])) {
            return new JsonResponse(['error' => 'Missing id'], 400);
        }

        // Gebruiker ophalen
        $user = $usersRepository->findOneBy(['id' => $data['id']]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }
        
        // Gebruiker ontbannen
        if ($data['type'] === false) {
            if (!in_array('ROLE_DISABLED', $user->getRoles())) {
                return new JsonResponse(['error' => 'User is already enabled'], 400);
            }
            $user->setRoles(array_diff($user->getRoles(), ['ROLE_DISABLED']));
            $entityManager->persist($user);
            $entityManager->flush();
            return new JsonResponse(['message' => 'User unbanned successfully'], 200);
        }
        
        // Gebruiker bannen
        if ($data['type'] === true) {
            if (in_array('ROLE_DISABLED', $user->getRoles())) {
                return new JsonResponse(['error' => 'User is already disabled'], 400);
            }
            $user->setRoles(['ROLE_DISABLED']);
            $entityManager->persist($user);
            $entityManager->flush();
            return new JsonResponse(['error' => 'User banned successfully'], 200);
        }

        return new JsonResponse(['message' => 'Something went wrong'], 400);
    }

    /**
     * Admin endpoint om gebruikersrol in te stellen
     */
    #[Route('/admin/role', name: 'api_users_admin_role', methods: ['PUT'])]
    function setRole(
        Request $request,
        EntityManagerInterface $entityManager,
        UsersRepository $usersRepository
    ): Response {
        $data = json_decode($request->getContent(), true);

        // Controleren of ID aanwezig is
        if (!isset($data['id'])) {
            return new JsonResponse(['error' => 'Missing id'], 400);
        }

        // Gebruiker ophalen
        $user = $usersRepository->findOneBy(['id' => $data['id']]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        // Rol valideren
        $role = $data['role'] ?? null;
        if (!$role || !in_array($role, ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_TEMP'])) {
            return new JsonResponse(['error' => 'Invalid role'], 400);
        }
        if (in_array($role, $user->getRoles())) {
            return new JsonResponse(['error' => 'User already has this role'], 400);
        }

        // Rol instellen
        if ($role === 'ROLE_USER') {
            $user->setRoles([]);
        }
        if ($role === 'ROLE_ADMIN' || $role === 'ROLE_TEMP') {
            $user->setRoles([$role]);
        }
        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User set as admin successfully'], 200);
    }

    /**
     * Registratie endpoint voor nieuwe gebruikers
     */
    #[Route('/register', name: 'api_users_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): Response {
        $data = json_decode($request->getContent(), true);

        // Verplichte velden controleren
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['full_name'])) {
            return new JsonResponse(['error' => 'Missing email or password'], 400);
        }

        // Controleren of e-mail al bestaat
        $existingUser = $entityManager->getRepository(Users::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email already in use'], 409);
        }

        // Nieuwe gebruiker aanmaken
        $user = new Users();
        $user->setEmail($data['email']);
        $user->setRole('ROLE_USER');

        // Wachtwoord valideren en hashen
        $password = $data['password'];
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
            return new JsonResponse([
                'error' => 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
            ], 400);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $user->setFullName($data['full_name']);

        // Optionele velden instellen
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
        if (isset($data['created_at'])) {
            $user->setCreatedAt(new \DateTime($data['created_at']));
        }
        if (isset($data['updated_at'])) {
            $user->setUpdatedAt(new \DateTime($data['updated_at']));
        }

        // Validatie uitvoeren
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

        // Gebruiker opslaan
        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['message' => 'User created'], 201);
    }

    /**
     * Huidige gebruiker ophalen op basis van JWT token
     */
    #[Route('/get', name: 'api_users_get', methods: ['GET'])]
    public function get(UsersRepository $usersRepository, Request $request): Response
    {
        // JWT token valideren
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        // Gebruiker ophalen
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 400);
        }

        // Avatar URL formatteren
        $avatarUrl = $user->getAvatarUrl();
        if ($avatarUrl && str_starts_with($avatarUrl, '/')) {
            $avatarUrl = $request->getSchemeAndHttpHost() . $avatarUrl;
        } elseif (!$avatarUrl) {
            $avatarUrl = $request->getSchemeAndHttpHost() . '/uploads/avatar-placeholder.png';
        }

        // Gebruikersdata formatteren
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

    /**
     * Gebruiker ophalen op basis van ID met reviews
     */
    #[Route('/getbyid', name: 'api_users_get_by_id', methods: ['GET'])]
    public function getById(Request $request, UsersRepository $usersRepository, ReviewsRepository $reviewsRepository): Response
    {
        // JWT token valideren
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }

        // ID parameter ophalen
        $id = $request->query->get('id');
        if (!$id) {
            return new JsonResponse(['error' => 'No id provided'], 400);
        }

        // Gebruiker ophalen
        $user = $usersRepository->find($id);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        // Locatie data formatteren
        $location = $user->getLocationId();
        $locationData = null;
        if ($location) {
            $locationData = [
                'id' => $location->getId(),
                'name' => $location->getName(),
            ];
        }

        // Reviews berekenen
        $reviews = $reviewsRepository->findBy(['user_id' => $user]);
        if (!$reviews) {
            $reviewCount = 0;
            $reviewAverage = 0;
        } else {
            $reviewCount = count($reviews);
            $totalRating = 0;
    
            foreach ($reviews as $review) {
                $totalRating += $review->getRating();
            }
    
            $reviewAverage = $reviewCount > 0 ? round($totalRating / $reviewCount, 2) : 0;
        }

        // Gebruikersdata formatteren
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
            'review_count' => $reviewCount,
            'review_average' => $reviewAverage,
            'date_of_birth' => $user->getDateOfBirth() ? $user->getDateOfBirth()->format('Y-m-d') : null,
        ];

        return new JsonResponse($usersData, 200);
    }

    /**
     * Tijdelijke gebruiker aanmaken met automatisch gegenereerd wachtwoord
     */
    #[Route('/register/temp', name: 'api_users_register_temp', methods: ['POST'])]
    public function registerTemp(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): Response {
        // Tijdelijke gebruiker aanmaken
        $user = new Users();
        $user->setEmail(uniqid('tmp_')); // Unieke tijdelijke e-mail
        $user->setRole('ROLE_TEMP');
        $user->setRoles(['ROLE_TEMP']);

        // Veilig wachtwoord genereren
        $password = $this->generateSecurePassword(12);
        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);
        $user->setFullName('Temporary User');

        // Gebruiker opslaan
        $entityManager->persist($user);
        $entityManager->flush();

        return new JsonResponse(['username' => $user->getEmail(), 'password' => $password, 'roles' => $user->getRoles()], 201);
    }    
    
    /**
     * Gebruikersprofiel bijwerken
     */
    #[Route('/update', name: 'api_users_update', methods: ['PUT'])]
    public function updateProfile(
        Request $request,
        TokenStorageInterface $tokenStorage,
        EntityManagerInterface $em,
        UsersRepository $repo,
        LocationsRepository $locationsRepository
    ): JsonResponse {
        // JWT token valideren
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        if (!$decodedJwtToken || !isset($decodedJwtToken["username"])) {
            return new JsonResponse(['error' => 'Invalid token'], 401);
        }
        
        // Gebruiker ophalen
        $user = $repo->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['message' => 'User not found'], 404);
        }

        // JSON data valideren
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return new JsonResponse(['message' => 'Invalid JSON payload'], 400);
        }

        // Geboortedatum bijwerken indien gewijzigd
        $newDateOfBirth = \DateTime::createFromFormat('Y-m-d', $data['date_of_birth']);
        if ($user->getDateOfBirth() === null || $user->getDateOfBirth()->format('Y-m-d') !== $data['date_of_birth']) {
            $user->setDateOfBirth($newDateOfBirth);
        }

        // Volledige naam bijwerken indien gewijzigd
        if ($user->getFullName() !== $data['full_name']) {
            $user->setFullName($data['full_name'] ?? '');
        }

        // Studie programma bijwerken indien gewijzigd
        if ($user->getStudyProgram() !== $data['study_program']) {
            $user->setStudyProgram($data['study_program'] ?? '');
        }

        // Locatie zoeken en bijwerken
        $location = $locationsRepository->createQueryBuilder('l')
            ->where('LOWER(l.name) = LOWER(:name)')
            ->setParameter('name', $data['location'])
            ->getQuery()
            ->getOneOrNullResult();

        if ($user->getLocationId() !== $location) {
            $user->setLocationId($location ? $location : null);
        }

        // Wijzigingen opslaan
        $em->flush();

        return $this->json('Profile updated successfully', 200);
    }

    /**
     * Bedrijfsgebruiker aanmaken
     */
    #[Route('/bussiness/new', name: 'api_users_bussiness_new', methods: ['POST'])]
    public function bussinessNew(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        ValidatorInterface $validator
    ): Response {
        $data = json_decode($request->getContent(), true);

        // Verplichte velden controleren
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['full_name'])) {
            return new JsonResponse(['error' => 'Missing email or password'], 400);
        }

        // Controleren of e-mail al bestaat
        $existingUser = $entityManager->getRepository(Users::class)->findOneBy(['email' => $data['email']]);
        if ($existingUser) {
            return new JsonResponse(['error' => 'Email already in use'], 409);
        }

        // Bedrijfsgebruiker aanmaken
        $user = new Users();
        $user->setEmail($data['email']);
        $user->setRoles(['ROLE_BUSSINESS']);
        $user->setRole('ROLE_BUSSINESS');
        $user->setCompanyId($entityManager->getRepository(Companies::class)->findOneBy(['name' => $data['name'] ?? 'Business User']));
        $user->setCreatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $user->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $user->setTheme('light');

        // Wachtwoord valideren en hashen
        $password = $data['password'];
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
            return new JsonResponse([
                'error' => 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
            ], 400);
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $user->setFullName($data['full_name']);
        $user->setLanguage('en');

        // Optionele velden instellen
        if (isset($data['bio'])) {
            $user->setBio($data['bio']);
        }
        if (isset($data['name'])) {
            $user->setFullName($data['name']);
        }
        if (isset($data['interests'])) {
            $user->setInterests($data['interests']);
        }

        // Bedrijf entiteit aanmaken
        $company = new Companies();
        $company->setName($data['name'] ?? 'Business User');
        $company->setDescription($data['bio'] ?? '');
        $company->setType($data['interests'] ?? 'General');
        $company->setContactInfo($data['email']);
        $location = $entityManager->getRepository(Locations::class)->findOneBy(['name' => 'emmen']);
        $company->setLocationId($location);
        $company->setCreatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $company->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        // Beide entiteiten opslaan
        $entityManager->persist($user);
        $entityManager->persist($company);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Business user created'], 201);
    }
}
