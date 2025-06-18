<?php

namespace App\Repository;

use App\Entity\Products;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Products>
 */
class ProductsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Products::class);
    }

    //    /**
    //     * @return Products[] Returns an array of Products objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('p.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Products
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    // notes
    // moving this query from controller to repository keeps the controller clean and leverages Doctrine's query caching.
    public function findProductsByUserAsArray($userId, $search = '', $limit = 20, $offset = 0)
    {
        $qb = $this->createQueryBuilder('p')
            ->select('p.id, p.title, p.description, p.price, p.study_tag, p.status, p.wishlist, p.photo, p.created_at, p.updated_at, IDENTITY(p.user_id) as product_user_id, u.full_name as product_username')
            ->join('p.user_id', 'u')
            ->where('p.user_id = :user')
            ->setParameter('user', $userId)
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($search) {
            $qb->andWhere('LOWER(p.title) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function findPreviewProductsExcludingUser($userId, $category = null, $search = '', $limit = 20, $offset = 0)
    {
        $qb = $this->createQueryBuilder('p')
            ->select('p.id, p.title, p.description, p.price, p.study_tag, p.status, p.wishlist, p.photo, p.created_at, p.updated_at, u.full_name as product_username, u.id as product_user_id')
            ->join('p.user_id', 'u')
            ->where('p.user_id != :user')
            ->setParameter('user', $userId)
            ->orderBy('p.created_at', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit);

        if ($category) {
            $categories = array_map('trim', explode(',', $category));
            $categories = array_filter($categories, function($cat) {
                return !empty($cat);
            });

            if (!empty($categories)) {
                $qb->andWhere('p.study_tag IN (:categories)')
                   ->setParameter('categories', $categories);
            }
        }
        if ($search) {
            $qb->andWhere('LOWER(p.title) LIKE :search')
               ->setParameter('search', '%' . strtolower($search) . '%');
        }

        return $qb->getQuery()->getArrayResult();
    }
}
