<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250515105246 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE messages (id INT AUTO_INCREMENT NOT NULL, sender_id_id INT NOT NULL, reciever_id_id INT NOT NULL, content LONGTEXT NOT NULL, timestamp DATETIME NOT NULL, INDEX IDX_DB021E966061F7CF (sender_id_id), INDEX IDX_DB021E96AE06B8F9 (reciever_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE tips (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, content LONGTEXT NOT NULL, category VARCHAR(255) DEFAULT NULL, upvotes INT DEFAULT NULL, downvotes INT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_642C41089D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE translations (id VARCHAR(255) NOT NULL, language VARCHAR(255) NOT NULL, content_type VARCHAR(255) NOT NULL, content_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', field VARCHAR(255) NOT NULL, translated_text LONGTEXT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE user_events (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, event_id_id INT NOT NULL, INDEX IDX_36D54C779D86650F (user_id_id), INDEX IDX_36D54C773E5F2F7B (event_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E966061F7CF FOREIGN KEY (sender_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E96AE06B8F9 FOREIGN KEY (reciever_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE tips ADD CONSTRAINT FK_642C41089D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_events ADD CONSTRAINT FK_36D54C779D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_events ADD CONSTRAINT FK_36D54C773E5F2F7B FOREIGN KEY (event_id_id) REFERENCES events (id)
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE translation
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE translation (id VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, language VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content_type VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, content_id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)', field VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, translated_text LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E966061F7CF
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96AE06B8F9
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE tips DROP FOREIGN KEY FK_642C41089D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_events DROP FOREIGN KEY FK_36D54C779D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_events DROP FOREIGN KEY FK_36D54C773E5F2F7B
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE messages
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE tips
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE translations
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE user_events
        SQL);
    }
}
