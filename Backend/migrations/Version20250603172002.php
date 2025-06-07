<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250603172002 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE forums ADD category VARCHAR(255) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE forums ADD CONSTRAINT FK_FE5E5AB89D86650F FOREIGN KEY (user_id_id) REFERENCES users (id)
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
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE forums DROP FOREIGN KEY FK_FE5E5AB89D86650F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE forums DROP category
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
    }
}
