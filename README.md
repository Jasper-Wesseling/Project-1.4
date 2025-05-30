# Project-1.4
expose backend to phone(pc ip-adresss)
php -S 0.0.0.0:8000 -t public

<!-- GETTING STARTED -->
## Getting Started
[![Contributors][contributors-shield]][contributors-url]
[![Issues][issues-shield]][issues-url]

### Frontend
you should have nodejs installed

to install the project
* npm
  ```sh
  npm install
  ```

to run the project
* expo
  ```sh
  npx expo start
  ```


### Backend
you should have composer installed, a database of you choice and have openssl

to install the project
* composer
  ```sh
  composer install
  ```

* copy .env and make a .env.local version and add you credentia etc

* database create
  ```sh
  php bin/console doctrine:database:create
  ```

if you get nog driver error
* find ini file of used php
  ```sh
  php -i | findstr /c:"Loaded Configuration File"
  ```
 in this file uncomment: 
* pdo_mysql
* pdo_sqlite

* generate-keypair
  ```sh
  php bin/console lexik:jwt:generate-keypair
  ```
    
       
to run the project
* symfony server:starts
  ```sh
  symfony server:start
  ```


infodump

if openssl is not working for some reason try this command to install openssl os wide
choco install openssl

VERVANGT ALLES IN DE DATABASE
php bin/console doctrine:fixtures:load


ALS ECHT NIKS MEER WERKT IN DE BACKEND RUN DIT
php bin/console doctrine:schema:drop --force
php bin/console make:migration
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load

zonder alles te verwijderen
php bin/console doctrine:schema:drop --force
php bin/console doctrine:migrations:migrate
php bin/console doctrine:fixtures:load


database initialize
PS C:\Users\lukeb\OneDrive\Bureaublad\Project-1.4\Backend> php bin/console doctrine:database:create
Created database `studenthub` for connection named default
PS C:\Users\lukeb\OneDrive\Bureaublad\Project-1.4\Backend> php bin/console doctrine:schema:update --force

### Top contributors:

<a href="https://github.com/Jasper-Wesseling/Project-1.4/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jasper-Wesseling/Project-1.4" alt="contrib.rocks image" />
</a>