<?php

namespace App\Controller;

use App\Entity\Products;
use App\Repository\ProductsRepository;
use App\Repository\UsersRepository;
use DatePeriod;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\Id;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

#[Route('api/products')]
class ProductsController extends AbstractController
{
    private $jwtManager;
    private $tokenStorageInterface;

    public function __construct(TokenStorageInterface $tokenStorageInterface, JWTTokenManagerInterface $jwtManager)
    {
        $this->jwtManager = $jwtManager;
        $this->tokenStorageInterface = $tokenStorageInterface;
    }

    #[Route('/get', name: 'api_products_get', methods: ['GET'])]
    public function getPreviewProducts(Request $request, ProductsRepository $productsRepository, UsersRepository $usersRepository): Response
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        $category = $request->query->get('category', null);
        $search = $request->query->get('search', '');

        $productsArray = $productsRepository->findPreviewProductsExcludingUser($user->getId(), $category, $search, $limit, $offset);

        $now = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
        foreach ($productsArray as &$product) {
            $updatedAt = $product['updated_at'] ? $product['updated_at'] : null;
            $product['days_ago'] = $updatedAt ? $now->diff($updatedAt)->days : null;
        }

        return new JsonResponse($productsArray, 200);
    }


    #[Route('/get/fromCurrentUser', name: 'api_products_get_from_current_user', methods: ['GET'])]
    public function getPreviewProductsFromUser( Request $request, ProductsRepository $productsRepository, UsersRepository $usersRepository ): Response {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        $search = $request->query->get('search', '');

        // Use custom repository method for efficiency
        $productsArray = $productsRepository->findProductsByUserAsArray($user->getId(), $search, $limit, $offset);

        // Add days_ago and product_username fields
        $now = new \DateTime('now', new \DateTimeZone('Europe/Amsterdam'));
        foreach ($productsArray as &$product) {
            $updatedAt = $product['updated_at'] ? $product['updated_at'] : null;
            $product['days_ago'] = $updatedAt ? $now->diff($updatedAt)->days : null;
        }

        return new JsonResponse($productsArray, 200);
    }

    #[Route('/new', name: 'api_products_new', methods: ['POST'])]
    public function addProduct(Request $request, EntityManagerInterface $entityManager, UsersRepository $usersRepository) : Response
    {
        // Get user from JWT
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        // Get fields from FormData
        $title = $request->request->get('title');
        $description = $request->request->get('description');
        $studyTag = $request->request->get('studyTag');
        $price = $request->request->get('price');
        $photo = $request->files->get('photo');

        // Validation (add more as needed)
        if (!$title || !$description || !$studyTag || !$price) {
            return new JsonResponse(['error' => 'Missing required fields'], 400);
        }

        $product = new Products();
        $product->setUserId($user);
        $product->setTitle($title);
        $product->setDescription($description);
        $product->setPrice($price);
        $product->setStudyTag($studyTag);
        $product->setStatus('Te koop');
        $product->setWishlist(false);
        $product->setCreatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));
        $product->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        if ($photo) {
            $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
            $newFileName = uniqid() . '.' . pathinfo($photo->getClientOriginalName(), PATHINFO_EXTENSION);

            try {
                $photo->move($uploadsDir, $newFileName);
                $product->setPhoto('/uploads/' . $newFileName);
            } catch (FileException $e) {
                return new JsonResponse(['error' => 'File upload failed'], 400);
            }
        }

        $entityManager->persist($product);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Successfully added!',
            'id' => $product->getId(),
            'photo' => $product->getPhoto()
        ], 201);
    }


    #[Route('/edit', name: 'api_products_edit', methods: ['PUT'])]
    public function editProduct(Request $request, ProductsRepository $productsRepository, UsersRepository $usersRepository, EntityManagerInterface $entityManager): Response
    {
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        // get product
        $id = $request->query->get('id');
        if (!$id) {
            return new JsonResponse(['error' => 'Product ID missing'], 400);
        }
        $product = $productsRepository->find($id);
        if (!$product) {
            return new JsonResponse(['error' => 'Product not found'], 404);
        }

        // check if product owner is the same as the user making the request
        if ($product->getUserId()->getId() !== $user->getId()) {
            return new JsonResponse(['error' => 'Unauthorized'], 403);
        }

        $data = json_decode($request->getContent(), true);

        // change the fields that are changed
        if (isset($data['title'])) {
            $product->setTitle($data['title']);
        }
        if (isset($data['description'])) {
            $product->setDescription($data['description']);
        }
        if (isset($data['price'])) {
            $product->setPrice($data['price']);
        }

        dump($data['title']);
        $product->setUpdatedAt(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')));

        $entityManager->persist($product);
        $entityManager->flush();

        return new JsonResponse([
            'message' => 'Product updated!',
            'id' => $product->getId(),
            'title' => $product->getTitle(),
            'description' => $product->getDescription(),
            'price' => $product->getPrice()
        ], 200);
    }
}
