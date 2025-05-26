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
        // $userIDReciever = max(1, (int)$request->query->get('reciever', 1));

        $decodedJwtToken = $this->jwtManager->decode($this->tokenStorageInterface->getToken());
        $user = $usersRepository->findOneBy(['email' => $decodedJwtToken["username"]]);
        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 401);
        }

        $category = $request->query->get('category', null);
        $search = $request->query->get('search', '');

        $qb = $productsRepository->createQueryBuilder('p')
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($category) {
            $qb->andWhere('p.study_tag = :category')
               ->setParameter('category', $category);
        }
        if ($search) {
            $qb->andWhere('LOWER(p.title) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        

        $products = $qb->getQuery()->getResult();

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
                'days_ago' => date_diff(new \DateTime('now', new \DateTimeZone('Europe/Amsterdam')), $product->getUpdatedAt())->days
            ];
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
}
