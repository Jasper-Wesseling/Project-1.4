<?php

namespace App\Entity;

use App\Repository\MessagesRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: MessagesRepository::class)]
class Messages
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'messages_user')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $sender_id = null;

    #[ORM\ManyToOne(inversedBy: 'mesages_user')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $reciever_id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $content = null;

    #[ORM\Column]
    private ?\DateTime $timestamp = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(Uuid $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getSenderId(): ?Users
    {
        return $this->sender_id;
    }

    public function setSenderId(?Users $sender_id): static
    {
        $this->sender_id = $sender_id;

        return $this;
    }

    public function getRecieverId(): ?Users
    {
        return $this->reciever_id;
    }

    public function setRecieverId(?Users $reciever_id): static
    {
        $this->reciever_id = $reciever_id;

        return $this;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getTimestamp(): ?\DateTime
    {
        return $this->timestamp;
    }

    public function setTimestamp(\DateTime $timestamp): static
    {
        $this->timestamp = $timestamp;

        return $this;
    }
}
