Echo
====

## Packages
```bash
apt-get update
apt-get dist-upgrade

apt-get install unzip ncat
```

## Deno
```bash
LATEST=$(curl -sSf https://github.com/denoland/deno/releases | \
    grep -o "/denoland/deno/releases/download/.*/deno-.*linux.*\.zip" | \
    head -n1)
echo $LATEST

cd /tmp
wget -O deno.zip https://github.com/$LATEST
unzip deno.zip
./deno --version

cp /tmp/deno /usr/local/bin/
deno --version
```

## System
```bash
adduser echo --disabled-password --gecos ""

mkdir -p /home/echo/app
cp echo.ts /home/echo/app/
cp echo.sh /home/echo/app/
chmod 755 /home/echo/app/echo.sh

cp echo.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable echo.service
systemctl restart echo.service
```

## Nginx
On the host

```bash
apt-get install nginx ssl-cert certbot

cp checkmyport.conf /etc/nginx/sites-available/
ln -s ../sites-available/checkmyport.conf /etc/nginx/sites-enabled/

/etc/init.d/nginx configtest
systemctl restart nginx.service

certbot certonly --dry-run --agree-tos --webroot -w /var/www/html \
    -d checkmyport.mydomain.com
certbot certonly --agree-tos --webroot -w /var/www/html \
    -d checkmyport.mydomain.com
systemctl reload nginx.service
```

`/etc/systemd/system/certbot.service.d/override.conf`
```conf
[Service]
ExecStartPost=systemctl reload nginx.service
```

```bash
systemctl daemon-reload
```
