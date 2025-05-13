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
        pattern: '/@(student\.)?nhlstenden\.com$/',
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

    #[ORM\ManyToOne(targetEntity: Users::class, inversedBy: 'posts')]
    private ?Users $user_id = null;

    public function __construct()
    {
        $this->products_user = new ArrayCollection();
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
}
