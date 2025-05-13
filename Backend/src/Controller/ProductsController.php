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
    
    #[Route('/getall', name: 'api_products', methods: ['GET'])]
    public function getAllProducts(ProductsRepository $productsRepository): Response
    {
        $products = $productsRepository->findAll();

        return new JsonResponse($products, 200);
    }
    #[Route('/new', name: 'api_products', methods: ['POST'])]
    public function addProduct(Request $request,EntityManagerInterface $entityManager, ProductsRepository $productsRepository, UsersRepository $usersRepository) : Response
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
        $product->setCreatedAt($data['created_at']);
        $product->setUpdatedAt($data['created_at']);

        $entityManager->persist($product);
        $entityManager->flush();

        return new JsonResponse(['Succesfully added!', 200]);
    }
}
