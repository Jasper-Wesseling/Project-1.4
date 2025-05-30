# Project-1.4
Studenthub


# Frontend
What you should have installed already
+ Nodejs



## to install the Frontend
* npm
  ```sh
  npm install
  ```

## to run the Frontend
* expo
  ```sh
  npx expo start
  ```


# Backend

you should have installed
+ composer 
+ database of you choice 
+ openssl
+ php



## to install the Backend

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


* migrations
  ```sh
  php bin/console doctrine:migrations:migrate
  ```


* optinal use dummy data 
  ```sh
  php bin/console doctrine:fixtures:load
  ```
    


## to run the Backend
* symfony server:starts
  ```sh
  symfony server:start
  ```


* if you want to use the backend with the frontend the easy way that run this command instead of the command above
expose backend to phone(pc ip-adresss)
  ```sh
  php -S 0.0.0.0:8000 -t public
  ```


# Help on installing/running Backend

* if you get a driver error find the location of the ini file of the php you are using
in this file uncomment: pdo_mysql, pdo_sqlite, sodium, zip
  ```sh
  php -i | findstr /c:"Loaded Configuration File"
  ```


* if openssl is not working for some reason try this command to install openssl os wide on windows
  ```sh
  choco install openssl
  ```


## WHEN WORKING ON BACKEND AND EVERYTHING IS BROKEN USE THIS AS A LAST RESORT! WARNING THIS REMOVES EVERY THING IN THE DATABASE! 
  ```sh
  php bin/console doctrine:schema:drop --force
  php bin/console doctrine:migrations:migrate
  php bin/console doctrine:fixtures:load
  ```



# 🌟 Top Contributors

<div align="center">

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Jasper-Wesseling">
        <img src="https://avatars.githubusercontent.com/u/93253259?v=4" width="100" style="border-radius:50%;" alt="Jasper-Wesseling"/><br />
        <b>Jasper-Wesseling</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/LukeBoscher">
        <img src="https://avatars.githubusercontent.com/u/183364004?v=4" width="100" style="border-radius:50%;" alt="LukeBoscher"/><br />
        <b>LukeBoscher</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Svenkiel">
        <img src="https://avatars.githubusercontent.com/u/108806428?v=4" width="100" style="border-radius:50%;" alt="Svenkiel"/><br />
        <b>Svenkiel</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/RobbinSkippy">
        <img src="https://avatars.githubusercontent.com/u/183363464?v=4" width="100" style="border-radius:50%;" alt="RobbinSkippy"/><br />
        <b>RobbinSkippy</b>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/WWesseling">
        <img src="https://avatars.githubusercontent.com/u/149768576?v=4" width="100" style="border-radius:50%;" alt="WWesseling"/><br />
        <b>WWesseling</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/AnneMayavdk">
        <img src="https://avatars.githubusercontent.com/u/183364284?v=4" width="100" style="border-radius:50%;" alt="AnneMayavdk"/><br />
        <b>AnneMaya</b>
      </a>
    </td>
    <td></td>
    <td></td>
  </tr>
</table>

</div>