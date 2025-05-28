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

    #[ORM\ManyToOne(inversedBy: 'messages_receiver')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Users $receiver_id = null;

    #[ORM\Column]
    private ?\DateTime $timestamp = null;


    #[ORM\Column(nullable: true)]
    private ?array $content = null;

    #[ORM\ManyToOne(inversedBy: 'product_id')]
    private ?Products $product_id = null;

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

    public function getReceiverId(): ?Users
    {
        return $this->receiver_id;
    }

    public function setReceiverId(?Users $receiver_id): static
    {
        $this->receiver_id = $receiver_id;

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

    public function getContent(): ?array
    {
        return $this->content;
    }

    public function setContent(?array $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getProductId(): ?Products
    {
        return $this->product_id;
    }

    public function setProductId(?Products $product_id): static
    {
        $this->product_id = $product_id;

        return $this;
    }
}
