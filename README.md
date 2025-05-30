# Project-1.4
Studenthub


## Frontend
What you should have installed already
+Nodejs

### to install the Frontend
* npm
  ```sh
  npm install
  ```

### to run the Frontend
* expo
  ```sh
  npx expo start
  ```


## Backend
you should have 
+ composer 
+ database of you choice 
+ openssl
+ php

### to install the Backend
* composer
  ```sh
  composer install
  ```

* copy .env and make a .env.local version and add you credentia etc

* database create
  ```sh
  php bin/console doctrine:database:create
  ```

* generate-keypair
  ```sh
  php bin/console lexik:jwt:generate-keypair
  ```
    
       
### to run the Backend
* symfony server:starts
  ```sh
  symfony server:start
  ```

* if you want to use the backend with the frontend the easy way that run this command instead of the command above
expose backend to phone(pc ip-adresss)
  ```sh
  php -S 0.0.0.0:8000 -t public
  ```

## Help on installing/running Backend

* if you get a driver error find the location of the ini file of the php you are using
  ```sh
  php -i | findstr /c:"Loaded Configuration File"
  ```
in this file uncomment: pdo_mysql, pdo_sqlite, sodium, zip

* if openssl is not working for some reason try this command to install openssl os wide on windows
  ```sh
  choco install openssl
  ```

### WHEN WORKING ON BACKEND AND EVERYTHING IS BROKEN USE THIS AS A LAST RESORT! WARNING THIS REMOVES EVERY THING IN THE DATABASE! 
  ```sh
  php bin/console doctrine:schema:drop --force
  php bin/console doctrine:migrations:migrate
  php bin/console doctrine:fixtures:load
  ```



# Top contributors:
<a href="https://github.com/Jasper-Wesseling/Project-1.4/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jasper-Wesseling/Project-1.4" alt="contrib.rocks image" />
</a>