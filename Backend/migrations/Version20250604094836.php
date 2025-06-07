<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250604094836 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE companies (id INT AUTO_INCREMENT NOT NULL, location_id_id INT NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, contact_info LONGTEXT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_8244AA3A918DB72 (location_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE events (id INT AUTO_INCREMENT NOT NULL, company_id_id INT NOT NULL, title VARCHAR(255) NOT NULL, date DATE NOT NULL, location VARCHAR(255) DEFAULT NULL, description LONGTEXT DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_5387574A38B53C32 (company_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE locations (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE messages (id INT AUTO_INCREMENT NOT NULL, sender_id_id INT NOT NULL, receiver_id_id INT NOT NULL, product_id_id INT DEFAULT NULL, timestamp DATETIME NOT NULL, content JSON DEFAULT NULL COMMENT '(DC2Type:json)', INDEX IDX_DB021E966061F7CF (sender_id_id), INDEX IDX_DB021E96BE20CAB0 (receiver_id_id), INDEX IDX_DB021E96DE18E50B (product_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE posts (id INT AUTO_INCREMENT NOT NULL, user_id_id INT DEFAULT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, type VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_885DBAFA9D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE products (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, price INT NOT NULL, study_tag VARCHAR(255) DEFAULT NULL, status VARCHAR(255) NOT NULL, wishlist TINYINT(1) DEFAULT NULL, photo VARCHAR(255) DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, INDEX IDX_B3BA5A5A9D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE reviews (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, product_id_id INT DEFAULT NULL, post_id_id INT DEFAULT NULL, rating INT NOT NULL, content LONGTEXT DEFAULT NULL, date DATE NOT NULL, INDEX IDX_6970EB0F9D86650F (user_id_id), INDEX IDX_6970EB0FDE18E50B (product_id_id), INDEX IDX_6970EB0FE85F12B8 (post_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
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
            CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, location_id_id INT DEFAULT NULL, user_id_id INT DEFAULT NULL, email VARCHAR(255) NOT NULL, roles JSON NOT NULL COMMENT '(DC2Type:json)', password VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, full_name VARCHAR(255) NOT NULL, bio LONGTEXT DEFAULT NULL, avatar_url VARCHAR(255) DEFAULT NULL, interests LONGTEXT DEFAULT NULL, study_program VARCHAR(255) DEFAULT NULL, language VARCHAR(255) DEFAULT NULL, theme VARCHAR(255) DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, disabled TINYINT(1) NOT NULL, INDEX IDX_1483A5E9918DB72 (location_id_id), INDEX IDX_1483A5E99D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE widgets (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, widget VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, INDEX IDX_9D58E4C19D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE companies ADD CONSTRAINT FK_8244AA3A918DB72 FOREIGN KEY (location_id_id) REFERENCES locations (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events ADD CONSTRAINT FK_5387574A38B53C32 FOREIGN KEY (company_id_id) REFERENCES companies (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E966061F7CF FOREIGN KEY (sender_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E96BE20CAB0 FOREIGN KEY (receiver_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E96DE18E50B FOREIGN KEY (product_id_id) REFERENCES products (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts ADD CONSTRAINT FK_885DBAFA9D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE products ADD CONSTRAINT FK_B3BA5A5A9D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0F9D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0FDE18E50B FOREIGN KEY (product_id_id) REFERENCES products (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews ADD CONSTRAINT FK_6970EB0FE85F12B8 FOREIGN KEY (post_id_id) REFERENCES posts (id)
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
            ALTER TABLE users ADD CONSTRAINT FK_1483A5E9918DB72 FOREIGN KEY (location_id_id) REFERENCES locations (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ADD CONSTRAINT FK_1483A5E99D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE widgets ADD CONSTRAINT FK_9D58E4C19D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE companies DROP FOREIGN KEY FK_8244AA3A918DB72
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events DROP FOREIGN KEY FK_5387574A38B53C32
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E966061F7CF
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96BE20CAB0
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96DE18E50B
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE posts DROP FOREIGN KEY FK_885DBAFA9D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE products DROP FOREIGN KEY FK_B3BA5A5A9D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0F9D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0FDE18E50B
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE reviews DROP FOREIGN KEY FK_6970EB0FE85F12B8
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
            ALTER TABLE users DROP FOREIGN KEY FK_1483A5E9918DB72
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users DROP FOREIGN KEY FK_1483A5E99D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE widgets DROP FOREIGN KEY FK_9D58E4C19D86650F
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE companies
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE events
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE locations
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE messages
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE posts
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE products
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE reviews
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
        $this->addSql(<<<'SQL'
            DROP TABLE users
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE widgets
        SQL);
    }
}
