<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250610145639 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE forums (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, title VARCHAR(255) DEFAULT NULL, content LONGTEXT DEFAULT NULL, created_at DATETIME DEFAULT NULL, replies JSON DEFAULT NULL COMMENT '(DC2Type:json)', likes JSON DEFAULT NULL COMMENT '(DC2Type:json)', dislikes JSON DEFAULT NULL COMMENT '(DC2Type:json)', category VARCHAR(255) DEFAULT NULL, image VARCHAR(255) DEFAULT NULL, INDEX IDX_FE5E5AB89D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE forums ADD CONSTRAINT FK_FE5E5AB89D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE profile CHANGE bio bio VARCHAR(255) DEFAULT NULL, CHANGE full_name full_name VARCHAR(255) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users DROP FOREIGN KEY FK_1483A5E99D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users DROP FOREIGN KEY FK_1483A5E938B53C32
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_1483A5E99D86650F ON users
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_1483A5E938B53C32 ON users
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users DROP user_id_id, DROP company_id_id
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
            ALTER TABLE profile CHANGE bio bio LONGTEXT DEFAULT NULL, CHANGE full_name full_name VARCHAR(255) NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ADD user_id_id INT DEFAULT NULL, ADD company_id_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ADD CONSTRAINT FK_1483A5E99D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ADD CONSTRAINT FK_1483A5E938B53C32 FOREIGN KEY (company_id_id) REFERENCES companies (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_1483A5E99D86650F ON users (user_id_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_1483A5E938B53C32 ON users (company_id_id)
        SQL);
    }
}
