<?php

namespace App\Entity;

use App\Repository\UsersRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UsersRepository::class)]
class Users implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Regex(
        pattern: '/@(student\.)?nhlstenden\.com$|^tmp$|^info@/',
        message: 'Only emails ending with @nhlstenden.com or @student.nhlstenden.com are allowed.'
    )]
    private ?string $email = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $role = null;




    #[ORM\Column(length: 255)]
    private ?string $full_name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar_url = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $interests = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $study_program = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $language = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $theme = null;

    #[ORM\ManyToOne(inversedBy: 'location_users')]
    private ?Locations $location_id = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $created_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updated_at = null;


    /**
     * @var Collection<int, Products>
     */
    #[ORM\OneToMany(targetEntity: Products::class, mappedBy: 'user_id', orphanRemoval: true)]
    private Collection $products_user;
     
    /**
     * @var Collection<int, Posts>
     */
    #[ORM\OneToMany(mappedBy: 'user_id', targetEntity: Posts::class)]
    private Collection $posts;

    // #[ORM\ManyToOne(targetEntity: Users::class, inversedBy: 'posts')]
    // private ?Users $user_id = null;

    /**
     * @var Collection<int, Reviews>
     */
    #[ORM\OneToMany(targetEntity: Reviews::class, mappedBy: 'user_id', orphanRemoval: true)]
    private Collection $reviews_user;

    /**
     * @var Collection<int, UserEvents>
     */
    #[ORM\OneToMany(targetEntity: UserEvents::class, mappedBy: 'user_id', orphanRemoval: true)]
    private Collection $events_user;

    /**
     * @var Collection<int, Tips>
     */
    #[ORM\OneToMany(targetEntity: Tips::class, mappedBy: 'user_id', orphanRemoval: true)]
    private Collection $tips_user;

    /**
     * @var Collection<int, Messages>
     */
    #[ORM\OneToMany(targetEntity: Messages::class, mappedBy: 'sender_id', orphanRemoval: true)]
    private Collection $messages_user;

    /**
     * @var Collection<int, Messages>
     */
    #[ORM\OneToMany(targetEntity: Messages::class, mappedBy: 'receiver_id', orphanRemoval: true)]
    private Collection $messages_receiver;

    /**
     * @var Collection<int, Widgets>
     */
    #[ORM\OneToMany(targetEntity: Widgets::class, mappedBy: 'user_id', orphanRemoval: true)]
    private Collection $widgets_user;
    
    #[ORM\ManyToOne(inversedBy: 'users')]
    private ?Companies $company_id = null;


    /**
     * @var Collection<int, Forums>
     */
    #[ORM\OneToMany(targetEntity: Forums::class, mappedBy: 'user_id', orphanRemoval: true)]
    private Collection $forums_user;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTime $date_of_birth = null;


    public function __construct()
    {
        $this->products_user = new ArrayCollection();
        $this->reviews_user = new ArrayCollection();
        $this->events_user = new ArrayCollection();
        $this->tips_user = new ArrayCollection();
        $this->messages_user = new ArrayCollection();
        $this->messages_receiver = new ArrayCollection();
        $this->forums_user = new ArrayCollection();
        $this->posts = new ArrayCollection();
    }

    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Posts $post): static
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setUserId($this);
        }

        return $this;
    }

    public function removePost(Posts $post): static
    {
        if ($this->posts->removeElement($post)) {
            if ($post->getUserId() === $this) {
                $post->setUserId(null);
            }
        }

        return $this;
    }


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getFullName(): ?string
    {
        return $this->full_name;
    }

    public function setFullName(string $full_name): static
    {
        $this->full_name = $full_name;

        return $this;
    }

    public function getFirstName(): ?string
    {
        return explode(' ', $this->full_name)[0];
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatar_url;
    }

    public function setAvatarUrl(?string $avatar_url): static
    {
        $this->avatar_url = $avatar_url;

        return $this;
    }

    public function getInterests(): ?string
    {
        return $this->interests;
    }

    public function setInterests(?string $interests): static
    {
        $this->interests = $interests;

        return $this;
    }

    public function getStudyProgram(): ?string
    {
        return $this->study_program;
    }

    public function setStudyProgram(?string $study_program): static
    {
        $this->study_program = $study_program;

        return $this;
    }

    public function getLanguage(): ?string
    {
        return $this->language;
    }

    public function setLanguage(?string $language): static
    {
        $this->language = $language;

        return $this;
    }

    public function getTheme(): ?string
    {
        return $this->theme;
    }

    public function setTheme(?string $theme): static
    {
        $this->theme = $theme;

        return $this;
    }

    public function getLocationId(): ?Locations
    {
        return $this->location_id;
    }

    public function setLocationId(?Locations $location_id): static
    {
        $this->location_id = $location_id;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->created_at;
    }

    public function setCreatedAt(?\DateTime $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(?\DateTime $updated_at): static
    {
        $this->updated_at = $updated_at;

        return $this;
    }

    /**
     * @return Collection<int, Products>
     */
    public function getProductsUser(): Collection
    {
        return $this->products_user;
    }

    public function addProductsUser(Products $productsUser): static
    {
        if (!$this->products_user->contains($productsUser)) {
            $this->products_user->add($productsUser);
            $productsUser->setUserId($this);
        }

        return $this;
    }

    public function removeProductsUser(Products $productsUser): static
    {
        if ($this->products_user->removeElement($productsUser)) {
            // set the owning side to null (unless already changed)
            if ($productsUser->getUserId() === $this) {
                $productsUser->setUserId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Reviews>
     */
    public function getReviewsUser(): Collection
    {
        return $this->reviews_user;
    }

    public function addReviewsUser(Reviews $reviewsUser): static
    {
        if (!$this->reviews_user->contains($reviewsUser)) {
            $this->reviews_user->add($reviewsUser);
            $reviewsUser->setUserId($this);
        }

        return $this;
    }

    public function removeReviewsUser(Reviews $reviewsUser): static
    {
        if ($this->reviews_user->removeElement($reviewsUser)) {
            // set the owning side to null (unless already changed)
            if ($reviewsUser->getUserId() === $this) {
                $reviewsUser->setUserId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, UserEvents>
     */
    public function getEventsUser(): Collection
    {
        return $this->events_user;
    }

    public function addEventsUser(UserEvents $eventsUser): static
    {
        if (!$this->events_user->contains($eventsUser)) {
            $this->events_user->add($eventsUser);
            $eventsUser->setUserId($this);
        }

        return $this;
    }

    public function removeEventsUser(UserEvents $eventsUser): static
    {
        if ($this->events_user->removeElement($eventsUser)) {
            // set the owning side to null (unless already changed)
            if ($eventsUser->getUserId() === $this) {
                $eventsUser->setUserId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Tips>
     */
    public function getTipsUser(): Collection
    {
        return $this->tips_user;
    }

    public function addTipsUser(Tips $tipsUser): static
    {
        if (!$this->tips_user->contains($tipsUser)) {
            $this->tips_user->add($tipsUser);
            $tipsUser->setUserId($this);
        }

        return $this;
    }

    public function removeTipsUser(Tips $tipsUser): static
    {
        if ($this->tips_user->removeElement($tipsUser)) {
            // set the owning side to null (unless already changed)
            if ($tipsUser->getUserId() === $this) {
                $tipsUser->setUserId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Messages>
     */
    public function getMessagesUser(): Collection
    {
        return $this->messages_user;
    }

    public function addMessagesUser(Messages $messagesUser): static
    {
        if (!$this->messages_user->contains($messagesUser)) {
            $this->messages_user->add($messagesUser);
            $messagesUser->setSenderId($this);
        }

        return $this;
    }

    public function removeMessagesUser(Messages $messagesUser): static
    {
        if ($this->messages_user->removeElement($messagesUser)) {
            // set the owning side to null (unless already changed)
            if ($messagesUser->getSenderId() === $this) {
                $messagesUser->setSenderId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Messages>
     */
    public function getMessagesReceiver(): Collection
    {
        return $this->messages_receiver;
    }

    public function addMessagesReceiver(Messages $messagesReceiver): static
    {
        if (!$this->messages_receiver->contains($messagesReceiver)) {
            $this->messages_receiver->add($messagesReceiver);
            $messagesReceiver->setReceiverId($this);
        }

        return $this;
    }

    public function removeMessagesReceiver(Messages $messagesReceiver): static
    {
        if ($this->messages_receiver->removeElement($messagesReceiver)) {
            // set the owning side to null (unless already changed)
            if ($messagesReceiver->getReceiverId() === $this) {
                $messagesReceiver->setReceiverId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Widgets>
     */
    public function getWidgetsUser(): Collection
    {
        return $this->widgets_user;
    }

    public function addWidgetsUser(Widgets $widgetsUser): static
    {
        if (!$this->widgets_user->contains($widgetsUser)) {
            $this->widgets_user->add($widgetsUser);
            $widgetsUser->setUserId($this);
        }

        return $this;
    }

    public function removeWidgetsUser(Widgets $widgetsUser): static
    {
        if ($this->widgets_user->removeElement($widgetsUser)) {
            // set the owning side to null (unless already changed)
            if ($widgetsUser->getUserId() === $this) {
                $widgetsUser->setUserId(null);
            }
        }

        return $this;
    }

    public function getCompanyId(): ?Companies
    {
        return $this->company_id;
    }

    public function setCompanyId(?Companies $company_id): static
    {
        $this->company_id = $company_id;

        return $this;
    }

    public function getForumsUser(): Collection
    {
        return $this->forums_user;
    }

    public function addForumsUser(Forums $forumsUser): static
    {
        if (!$this->forums_user->contains($forumsUser)) {
            $this->forums_user->add($forumsUser);
            $forumsUser->setUserId($this);
        }

        return $this;
    }

    public function removeForumsUser(Forums $forumsUser): static
    {
        if ($this->forums_user->removeElement($forumsUser)) {
            // set the owning side to null (unless already changed)
            if ($forumsUser->getUserId() === $this) {
                $forumsUser->setUserId(null);
            }
        }

        return $this;
    }

    public function getDateOfBirth(): ?\DateTime
    {
        return $this->date_of_birth;
    }

    public function setDateOfBirth(?\DateTime $date_of_birth): static
    {
        $this->date_of_birth = $date_of_birth;

        return $this;
    }
}
