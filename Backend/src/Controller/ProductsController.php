<?php

namespace App\Controller;

use App\Entity\Products;
use App\Repository\ProductsRepository;
use App\Repository\UserRepository;
use App\Repository\UsersRepository;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
    public function getPreviewProducts(Request $request, ProductsRepository $productsRepository): Response
    {
        $page = max(1, (int)$request->query->get('page', 1));
        $limit = 20;
        $offset = ($page - 1) * $limit;

        $products = $productsRepository->findBy([], null, $limit, $offset);

        $productsArray = [];
        foreach ($products as $product) {
            $productsArray[] = [
                'id' => $product->getId(),
                'title' => $product->getTitle(),
                'description' => $product->getDescription(),
                'price' => $product->getPrice(),
                'study_tag' => $product->getStudyTag(),
                'status' => $product->getStatus(),
                'wishlist' => $product->isWishlist(),
                'photo' => $product->getPhoto(),
                'created_at' => $product->getCreatedAt() ? $product->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updated_at' => $product->getUpdatedAt() ? $product->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'user_id' => $product->getUserId() ? $product->getUserId()->getId() : null,
            ];
        }

        return new JsonResponse($productsArray, 200);
    }
    #[Route('/new', name: 'api_products_new', methods: ['POST'])]
    public function addProduct(Request $request, EntityManagerInterface $entityManager, UsersRepository $usersRepository) : Response
    {
        $data = json_decode($request->getContent(), true);
        #validatie voor alle velden!!!

        // $product = new Products();
        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        $product = new Products();
        $product->setUserId($user);

        $product->setTitle($data['title']);
        $product->setDescription($data['description']);
        $product->setPrice($data['price']);
        $product->setStudyTag($data['study_tag']);
        $product->setStatus($data['status']);
        $product->setWishlist($data['wishlist']);
        $product->setPhoto($data['photo']);
        $product->setCreatedAt(new \Datetime($data['created_at'], new \DateTimeZone('Europe/Amsterdam')));
        $product->setUpdatedAt(new \Datetime($data['created_at'], new \DateTimeZone('Europe/Amsterdam')));

        $entityManager->persist($product);
        $entityManager->flush();

        return new JsonResponse(['Succesfully added!', 200]);
    }
}
