<?php

namespace App\Entity;

use App\Repository\LocationsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LocationsRepository::class)]
class Locations
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    /**
     * @var Collection<int, Users>
     */
    #[ORM\OneToMany(targetEntity: Users::class, mappedBy: 'location_id')]
    private Collection $location_users;

    /**
     * @var Collection<int, Companies>
     */
    #[ORM\OneToMany(targetEntity: Companies::class, mappedBy: 'location_id', orphanRemoval: true)]
    private Collection $description;

    public function __construct()
    {
        $this->location_users = new ArrayCollection();
        $this->description = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return Collection<int, Users>
     */
    public function getLocationUsers(): Collection
    {
        return $this->location_users;
    }

    public function addLocationUser(Users $locationUser): static
    {
        if (!$this->location_users->contains($locationUser)) {
            $this->location_users->add($locationUser);
            $locationUser->setLocationId($this);
        }

        return $this;
    }

    public function removeLocationUser(Users $locationUser): static
    {
        if ($this->location_users->removeElement($locationUser)) {
            // set the owning side to null (unless already changed)
            if ($locationUser->getLocationId() === $this) {
                $locationUser->setLocationId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Companies>
     */
    public function getDescription(): Collection
    {
        return $this->description;
    }

    public function addDescription(Companies $description): static
    {
        if (!$this->description->contains($description)) {
            $this->description->add($description);
            $description->setLocationId($this);
        }

        return $this;
    }

    public function removeDescription(Companies $description): static
    {
        if ($this->description->removeElement($description)) {
            // set the owning side to null (unless already changed)
            if ($description->getLocationId() === $this) {
                $description->setLocationId(null);
            }
        }

        return $this;
    }
}
