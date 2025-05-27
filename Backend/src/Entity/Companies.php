<?php

namespace App\Entity;

use App\Repository\CompaniesRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: CompaniesRepository::class)]
class Companies
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $type = null;

    #[ORM\ManyToOne(inversedBy: 'description')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Locations $location_id = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $contact_info = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $created_at = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updated_at = null;

    /**
     * @var Collection<int, Events>
     */
    #[ORM\OneToMany(targetEntity: Events::class, mappedBy: 'company_id', orphanRemoval: true)]
    private Collection $events_company;

    public function __construct()
    {
        $this->events_company = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getContactInfo(): ?string
    {
        return $this->contact_info;
    }

    public function setContactInfo(?string $contact_info): static
    {
        $this->contact_info = $contact_info;

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
     * @return Collection<int, Events>
     */
    public function getEventsCompany(): Collection
    {
        return $this->events_company;
    }

    public function addEventsCompany(Events $eventsCompany): static
    {
        if (!$this->events_company->contains($eventsCompany)) {
            $this->events_company->add($eventsCompany);
            $eventsCompany->setCompanyId($this);
        }

        return $this;
    }

    public function removeEventsCompany(Events $eventsCompany): static
    {
        if ($this->events_company->removeElement($eventsCompany)) {
            // set the owning side to null (unless already changed)
            if ($eventsCompany->getCompanyId() === $this) {
                $eventsCompany->setCompanyId(null);
            }
        }

        return $this;
    }
}
