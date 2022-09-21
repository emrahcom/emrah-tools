# Echo

## Container

#### Packages

```bash
apt-get update
apt-get dist-upgrade

apt-get install unzip ncat
```

#### Deno

```bash
cd /tmp
wget -T 30 -O deno.zip \
  https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip
unzip deno.zip
./deno --version

cp /tmp/deno /usr/local/bin/
deno --version
```

#### Application

```bash
adduser echo --disabled-password --gecos ""

cp -arp container/home/echo/app /home/echo/
chmod 755 /home/echo/app/echo.sh

cp container/etc/systemd/system/echo.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable echo.service
systemctl restart echo.service
```

## Host

#### Nginx

```bash
apt-get install nginx ssl-cert certbot

cp host/etc/nginx/sites-available/checkmyport.conf /etc/nginx/sites-available/
ln -s ../sites-available/checkmyport.conf /etc/nginx/sites-enabled/

/etc/init.d/nginx configtest
systemctl restart nginx.service

certbot certonly --dry-run --agree-tos --webroot -w /var/www/html \
    -d checkmyport.mydomain.com
certbot certonly --agree-tos --webroot -w /var/www/html \
    -d checkmyport.mydomain.com
systemctl reload nginx.service

cp host/etc/systemd/system/certbot.service.d/override.conf \
    /etc/systemd/system/certbot.service.d/
systemctl daemon-reload
```
