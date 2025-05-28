<?php

namespace App\DataFixtures;

use App\Entity\Posts;
use App\Entity\Users;
use App\Entity\Products;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class DefaultFixture extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $user = new Users();
        $user->setEmail('jasper.wesseling@student.nhlstenden.com');
        $user->setRole('ROLE_USER');
        $hashedPassword = $this->passwordHasher->hashPassword($user, 'wesselingjasper');
        $user->setPassword($hashedPassword);
        $user->setFullName('Jasper Wesseling');
        $user->setBio('I am a student at NHL Stenden.');
        $user->setAvatarUrl('https://example.com/avatar.jpg');
        $user->setInterests('coding, music, sports');
        $user->setStudyProgram('Computer Science');
        $user->setLanguage('en');
        $user->setTheme('dark');
        $user->setCreatedAt(new \DateTime('2024-05-13T12:00:00'));
        $user->setUpdatedAt(new \DateTime('2024-05-13T12:00:00'));
        $manager->persist($user);

        $manager->flush(); // Ensure user gets an ID

        $user = $manager->getRepository(Users::class)->findOneBy(['email' => 'jasper.wesseling@student.nhlstenden.com']);

        // Create the product
        $product = new Products();
        $product->setUserId($user);
        $product->setTitle('Introduction to Algorithms');
        $product->setDescription('A comprehensive textbook for learning algorithms.');
        $product->setPrice(25);
        $product->setStudyTag('Computer Science');
        $product->setStatus('available');
        $product->setWishlist(false);
        $product->setPhoto('https://example.com/book.jpg');
        $product->setCreatedAt(new \DateTime('2024-05-15T12:00:00'));
        $product->setUpdatedAt(new \DateTime('2024-05-15T12:00:00'));

        $manager->persist($product);

        $manager->flush();

        $post = new Posts();
        $post->setUserId($user);
        $post->setTitle('Welcome to the Platform');
        $post->setDescription('This is your first post on the platform. Feel free to edit or delete it.');
        $post->setType('Local');
        $post->setStatus('Needs help');
        $post->setCreatedAt(new \DateTime('2024-05-16T12:00:00'));
        $post->setUpdatedAt(new \DateTime('2024-05-16T12:00:00'));

        $manager->persist($post);
        $manager->flush();
    }
}
