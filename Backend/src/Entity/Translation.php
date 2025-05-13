<?php

namespace App\Entity;

use App\Repository\TranslationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: TranslationRepository::class)]
class Translation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?Uuid $id = null;

    #[ORM\Column(length: 255)]
    private ?string $language = null;

    #[ORM\Column(length: 255)]
    private ?string $content_type = null;

    #[ORM\Column(type: 'uuid')]
    private ?Uuid $content_id = null;

    #[ORM\Column(length: 255)]
    private ?string $field = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $translated_text = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(Uuid $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getLanguage(): ?string
    {
        return $this->language;
    }

    public function setLanguage(string $language): static
    {
        $this->language = $language;

        return $this;
    }

    public function getContentType(): ?string
    {
        return $this->content_type;
    }

    public function setContentType(string $content_type): static
    {
        $this->content_type = $content_type;

        return $this;
    }

    public function getContentId(): ?Uuid
    {
        return $this->content_id;
    }

    public function setContentId(Uuid $content_id): static
    {
        $this->content_id = $content_id;

        return $this;
    }

    public function getField(): ?string
    {
        return $this->field;
    }

    public function setField(string $field): static
    {
        $this->field = $field;

        return $this;
    }

    public function getTranslatedText(): ?string
    {
        return $this->translated_text;
    }

    public function setTranslatedText(string $translated_text): static
    {
        $this->translated_text = $translated_text;

        return $this;
    }
}
