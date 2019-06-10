#!/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

ssserver -p 8087 -k wht861112tam -d start >/dev/null 2>&1
docker run -itd -p 8080:11257 --mount type=bind,src=/var/www/html,target=/fileStorage noru/home >/dev/null 2>&1
