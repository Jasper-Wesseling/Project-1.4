<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250519142429 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE widgets (id INT AUTO_INCREMENT NOT NULL, user_id_id INT NOT NULL, widget VARCHAR(255) NOT NULL, enabled TINYINT(1) NOT NULL, INDEX IDX_9D58E4C19D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE widgets ADD CONSTRAINT FK_9D58E4C19D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE widgets DROP FOREIGN KEY FK_9D58E4C19D86650F
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE widgets
        SQL);
    }
}
