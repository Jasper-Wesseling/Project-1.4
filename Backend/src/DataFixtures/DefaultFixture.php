<?php

namespace App\DataFixtures;

use App\Entity\Posts;
use App\Entity\Users;
use App\Entity\Products;
use App\Entity\Forums;
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

        $usersInfo = [
            [
                "email" => "jasper.wesseling@student.nhlstenden.com",
                "fullName" => "Jasper Wesseling",
                "password" => "!JasperWesseling123",
                "bio" => "I am a student at NHL Stenden.",
                "theme" => "light",
                "profileULR" => "/uploads/682729bdd4a8d.jpg",
            ],
            [
                "email" => "luke.boscher@student.nhlstenden.com",
                "fullName" => "Luke Boscher",
                "password" => "X33ghfKI",
                "bio" => "I am a student at NHL Stenden.",
                "theme" => "dark",
                "profileULR" => "/uploads/68272e6e1bda9.jpg",
            ]
        ];
        // users
        for ($i=0; $i < 2; $i++) { 
            $user = new Users();
            $user->setEmail($usersInfo[$i]["email"]);
            $user->setRole('ROLE_USER');
            $hashedPassword = $this->passwordHasher->hashPassword($user, $usersInfo[$i]["password"]);
            $user->setPassword($hashedPassword);
            $user->setFullName($usersInfo[$i]["fullName"]);
            $user->setBio($usersInfo[$i]["bio"]);
            $user->setAvatarUrl($usersInfo[$i]["profileULR"]);
            $user->setInterests('coding, music, sports');
            $user->setStudyProgram('Computer Science');
            $user->setLanguage('en');
            $user->setTheme($usersInfo[$i]["theme"]);
            $user->setCreatedAt(new \DateTime('2024-05-13T12:00:00'));
            $user->setUpdatedAt(new \DateTime('2024-05-13T12:00:00'));
            $manager->persist($user);

            $manager->flush(); // Ensure user gets an ID
        }
        
        $users = [
            $manager->getRepository(Users::class)->findOneBy(['email' => 'jasper.wesseling@student.nhlstenden.com']),
            $manager->getRepository(Users::class)->findOneBy(['email' => 'luke.boscher@student.nhlstenden.com']),
        ]; 
        

        // Dummy data arrays
        $titles = [
            'kaasplankje', 'Clean Code is fictie', 'AAAAHHHHHHHHHH!!!!!', 'was machine ja ',
            'maak mij maar tostie', 'bier', 'bijna weekend',
            ':(', ':P', ':)', ':D', '>:(', '>:)'
        ];
        $descriptions = [
            'wacht even hij heeft mijn school ip nog',
            'Ik heb nog steeds geen backend',
            'AAAAHHHHHHHHHH!!!!!AAAAHHHHHHHHHH!!!!!AAAAHHHHHHHHHH!!!!!AAAAHHHHHHHHHH!!!!!AAAAHHHHHHHHHH!!!!!AAAAHHHHHHHHHH!!!!!AAAAHHHHHHHHHH!!!!!AAAAHHHHHHHHHH!!!!!',
            'Listen to the wind blow Watch the sun rise Run in the shadows Damn your love, damn your lies And if you don\'t love me now You will never love me again I can still hear you saying You would never break the chain (never break the chain) And if you don\'t love me now (you don\'t love me now) You will never love me again I can still hear you saying (hear you saying) You would never break the chain (never break the chain) Listen to the wind blow Down comes the night Run in the shadows Damn your love, damn your lies Break the silence Damn the dark, damn the light And if you don\'t love me now You will never love me again I can still hear you saying You would never break the chain (never break the chain) And if you don\'t love me now (you don\'t love me now) You will never love me again I can still hear you saying You would never break the chain (never break the chain) And if you don\'t love me now (you don\'t love me now) You will never love me again I can still hear you saying (still hear you saying) You would never break the chain (never break the chain) Chain, keep us together (run in the shadow) Chain, keep us together (running in the shadows) Chain, keep us together (running in the shadow) Chain, keep us together (run in the shadow) Chain, keep us together (run in the shadow)',
            'Tips and techniques for pragmatic software development.',
            'A deep dive into software construction.',
            'An introduction to AI concepts and applications.',
            'Learn about data structures using PHP.',
            'A beginner\'s guide to the Symfony framework.',
            'Advanced techniques for working with Doctrine ORM.',
            '12EC is een veel tijd :(',
            'Bijna pizza vrijdag :D'
        ];

        $price = [420, 10000000000, 123000, 321000, 100, 25000, 100, 200, 300, 100, 200, 300, 100, 200, 300, 100, 200, 300,];
        $study = ['Boeken', 'Electra', 'Huis en tuin', 'Computer Science'];
        $status = ['available', 'sold'];
        $photos = ['lol.gif', '682b3d124e7cc.jpg', '682b3fd3a37a9.jpg', '6828e77836564.jpg', '6829e56b75e11.png', '68261c2d11cb8.jpg', '68272e6e1bda9.jpg', '6827819a5e28c.jpg', '68278034339b5.jpg'];
        $dates = [ '2003-02-19', '2025-05-11', '2025-05-12', '2025-05-13', '2025-05-14', '2025-05-15', '2025-05-16', '2025-05-17', '2025-05-18', '2025-05-19' ];


        // Create 25 products with random data
        for ($i = 0; $i < 100; $i++) {
            $product = new Products();
            $product->setUserId($users[array_rand($users)]);
            $product->setTitle($titles[array_rand($titles)]);
            $product->setDescription($descriptions[array_rand($descriptions)]);
            $product->setPrice($price[array_rand($price)]);
            $product->setStudyTag($study[array_rand($study)]);
            $product->setStatus($status[array_rand($status)]);
            $product->setWishlist(false);
            $product->setPhoto('/uploads/' . $photos[array_rand($photos)]);
            $tempdate = $dates[array_rand($dates)];
            $product->setCreatedAt(new \DateTime($tempdate));
            $product->setUpdatedAt(new \DateTime($tempdate));
            $manager->persist($product);
        }

        $manager->flush();

        $post = new Posts();
        $post->setUserId($users[array_rand($users)]);
        $post->setTitle('Welcome to the Platform');
        $post->setDescription('This is your first post on the platform. Feel free to edit or delete it.');
        $post->setType('Local');
        $post->setStatus('Needs help');
        $post->setCreatedAt(new \DateTime('2024-05-16T12:00:00'));
        $post->setUpdatedAt(new \DateTime('2024-05-16T12:00:00'));

        $manager->persist($post);
        $manager->flush();

        $forumCategories = [
            "Plannen",
            "Stress",
            "Vakken",
            "Sociale tips",
            "Huiswerk",
            "Presentaties",
            "Samenwerken",
            "Stage",
            "Overig",
        ];

        // Forum titles and contents per category
        $forumTitles = [
            "Hoe maak jij een goede planning?",
            "Plannen met een app of op papier?",
            "Hoe ga jij om met studiestress?",
            "Tips om te ontspannen tijdens tentamens?",
            "Moeilijkste vak tot nu toe?",
            "Welke vakken zijn het leukst?",
            "Hoe maak je makkelijk nieuwe vrienden?",
            "Tips voor samenwerken in groepen?",
            "Hoeveel tijd besteed jij aan huiswerk?",
            "Beste plek om huiswerk te maken?",
            "Hoe bereid jij je voor op een presentatie?",
            "Tips tegen zenuwen bij presenteren?",
            "Wat maakt een team succesvol?",
            "Hoe verdeel je taken eerlijk?",
            "Hoe vind je een goede stageplek?",
            "Wat heb je geleerd tijdens je stage?",
            "Wat is je favoriete snack?",
            "Vlaflip: recept gezocht!",
            "Aap in de collegezaal?",
            "Tech gadgets 2025",
            "Wie houdt er van kaas?",
            "Banketstaaf of kerststol?",
            "Overig: alles mag hier",
            "Beste studietip ooit",
            "Hoe motiveer jij jezelf?",
        ];

        $forumContents = [
            "Deel jouw beste planningsstrategie!",
            "Wat werkt voor jou het beste: digitaal of papier?",
            "Welke tips heb jij om stress te verminderen?",
            "Wat doe jij om te ontspannen tijdens drukke periodes?",
            "Welk vak vond je het lastigst en waarom?",
            "Welke vakken vind je het leukst en waarom?",
            "Hoe leg jij makkelijk contact met anderen?",
            "Wat zijn jouw tips voor groepswerk?",
            "Hoeveel uur per week besteed jij aan huiswerk?",
            "Waar werk jij het liefst aan je huiswerk?",
            "Hoe bereid jij je voor op een presentatie?",
            "Wat helpt tegen zenuwen voor de klas?",
            "Wat maakt een samenwerking succesvol volgens jou?",
            "Hoe zorg je dat iedereen in het team meedoet?",
            "Hoe heb jij je stage gevonden?",
            "Wat was jouw grootste leermoment tijdens je stage?",
            "Laat hieronder weten wat jouw favoriete snack is!",
            "Wie heeft een goed recept voor vlaflip?",
            "Er liep vandaag een aap door de collegezaal, iemand gezien?",
            "Welke gadgets gebruik jij voor school?",
            "Kaas is leven. Eens of oneens?",
            "Wat vinden jullie lekkerder: banketstaaf of kerststol?",
            "Plaats hier alles wat niet in een andere categorie past.",
            "Deel jouw beste studietip!",
            "Hoe blijf jij gemotiveerd tijdens het studeren?",
        ];

        for ($i = 0; $i < 30; $i++) {
            $forum = new Forums();
            $forum->setUserId($users[array_rand($users)]);
            $forum->setTitle($forumTitles[$i % count($forumTitles)]);
            $forum->setContent($forumContents[$i % count($forumContents)]);
            $forum->setCreatedAt(new \DateTime($dates[array_rand($dates)]));
            $forum->setCategory($forumCategories[$i % count($forumCategories)]);
            $forum->setImage('/uploads/' . $photos[array_rand($photos)]);

            // Forum likes/dislikes (beide users stemmen random)
            $forumLikes = [];
            $forumDislikes = [];
            foreach ($users as $user) {
                if (rand(0, 1)) {
                    $forumLikes[] = $user->getId();
                } else {
                    $forumDislikes[] = $user->getId();
                }
            }

            // Replies met likes/dislikes per reply
            $replies = [];
            for ($r = 0; $r < rand(1, 3); $r++) {
                $replyUser = $users[array_rand($users)];
                $replyUpvotes = [];
                $replyDownvotes = [];
                foreach ($users as $user) {
                    if (rand(0, 1)) {
                        $replyUpvotes[] = $user->getId();
                    } else {
                        $replyDownvotes[] = $user->getId();
                    }
                }
                $replies[] = [
                    'user_name' => $replyUser->getFullName(),
                    'user_id' => $replyUser->getId(),
                    'created_at' => (new \DateTime($dates[array_rand($dates)]))->format('Y-m-d H:i:s'),
                    'content' => 'Reply van ' . $replyUser->getFullName(),
                    'upvotes' => $replyUpvotes,
                    'downvotes' => $replyDownvotes,
                ];
            }

            $forum->setReplies($replies);
            $forum->setLikes($forumLikes);
            $forum->setDislikes($forumDislikes);

            $manager->persist($forum);
        }

        $manager->flush();
    }
}
