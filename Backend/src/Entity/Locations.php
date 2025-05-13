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

    public function __construct()
    {
        $this->location_users = new ArrayCollection();
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
}
