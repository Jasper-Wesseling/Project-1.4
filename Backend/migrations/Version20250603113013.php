<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250603113013 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE forums (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, title VARCHAR(255) DEFAULT NULL, content LONGTEXT DEFAULT NULL, created_at DATETIME DEFAULT NULL, replies JSON DEFAULT NULL COMMENT '(DC2Type:json)', likes JSON DEFAULT NULL COMMENT '(DC2Type:json)', dislikes JSON DEFAULT NULL COMMENT '(DC2Type:json)', INDEX IDX_FE5E5AB89D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE forums ADD CONSTRAINT FK_FE5E5AB89D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96AE06B8F9
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_DB021E96AE06B8F9 ON messages
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD product_id_id INT DEFAULT NULL, CHANGE content content JSON DEFAULT NULL COMMENT '(DC2Type:json)', CHANGE reciever_id_id receiver_id_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E96BE20CAB0 FOREIGN KEY (receiver_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E96DE18E50B FOREIGN KEY (product_id_id) REFERENCES products (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_DB021E96BE20CAB0 ON messages (receiver_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_DB021E96DE18E50B ON messages (product_id_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE forums DROP FOREIGN KEY FK_FE5E5AB89D86650F
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE forums
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96BE20CAB0
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96DE18E50B
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_DB021E96BE20CAB0 ON messages
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_DB021E96DE18E50B ON messages
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP product_id_id, CHANGE content content LONGTEXT NOT NULL, CHANGE receiver_id_id reciever_id_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E96AE06B8F9 FOREIGN KEY (reciever_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_DB021E96AE06B8F9 ON messages (reciever_id_id)
        SQL);
    }
}
