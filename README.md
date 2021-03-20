A backend for [testiny-web](https://github.com/toxdes/testiny-web).

# Quickstart

Clone this repo.

```sh
$ npm i -g yarn # install yarn
$ # make sure you have set up postgres, and have DATABASE_URL in .env
$ yarn all # ckeckout package.json to know what it does
```

# Tech stack

| Name                             | Description                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `express`                        | server                                                                               |
| `prisma`                         | to hopefully make DBMS easier.                                                       |
| `postgres`                       | Database.                                                                            |
| `bcrypt`, `jsonwebtoken`, `uuid` | Hashing passwords, generating tokens and unique IDs respectively among other usages. |
| `typescript`                     | Maintainability.                                                                     |

# References

1. https://likegeeks.com/linux-mail-server/#Linux_SMTP_server - want to try custom mail server for sending various mails - can't because my ISP doesn't provide me a static IP for free, and it takes a while to update DNS records every time I point my domain to the dynamic IP. Reverse DNS, and https'ing is needed otherwise Gmail doesn't even accept the mail (not even in the spam folder). I don't have a credit card, nor money, so can't buy a cheap vps either, so this is postponed until I find a solution.

2. https://wiki.archlinux.org/index.php/PostgreSQL - Guide for setting up postgresql locally. After you set it up successfully, edit the [`.env`](./.env) file and provide the database URL. Alternatively, you can use Heroku.

3. https://gist.github.com/soheilhy/8b94347ff8336d971ad0 -> For setting proxies, when we want to run backend and frontend on single VPS.
