<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250605133941 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE profile (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, age INT DEFAULT NULL, bio LONGTEXT DEFAULT NULL, location VARCHAR(255) DEFAULT NULL, full_name VARCHAR(255) NOT NULL, gender VARCHAR(255) DEFAULT NULL, phone_number VARCHAR(255) DEFAULT NULL, website VARCHAR(255) DEFAULT NULL, linkedin VARCHAR(255) DEFAULT NULL, study_program VARCHAR(255) DEFAULT NULL, github VARCHAR(255) DEFAULT NULL, created_at DATETIME DEFAULT NULL, updated_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_8157AA0FA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE profile ADD CONSTRAINT FK_8157AA0FA76ED395 FOREIGN KEY (user_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD post_id_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages ADD CONSTRAINT FK_DB021E96E85F12B8 FOREIGN KEY (post_id_id) REFERENCES posts (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_DB021E96E85F12B8 ON messages (post_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE translations CHANGE id id BINARY(16) NOT NULL COMMENT '(DC2Type:uuid)'
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE profile DROP FOREIGN KEY FK_8157AA0FA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE profile
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP FOREIGN KEY FK_DB021E96E85F12B8
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_DB021E96E85F12B8 ON messages
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE messages DROP post_id_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE translations CHANGE id id VARCHAR(255) NOT NULL
        SQL);
    }
}
