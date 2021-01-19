Jitok
=====

## Packages
```bash
apt-get update
apt-get dist-upgrade

apt-get install unzip nginx
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
adduser jitok --disabled-password --gecos ""

mkdir -p /home/jitok/app
cp jitok.ts /home/jitok/app/
cp jitok.sh /home/jitok/app/
chmod 755 /home/jitok/app/jitok.sh

cp jitok.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable jitok.service
systemctl restart jitok.service
```

## Nginx
On the host

```bash
apt-get install nginx ssl-cert certbot

cp jitok.conf /etc/nginx/sites-available/
ln -s ../sites-available/jitok.conf /etc/nginx/sites-enabled/

/etc/init.d/nginx configtest
systemctl restart nginx.service

certbot certonly --dry-run --agree-tos --webroot -w /var/www/html \
    -d jitok.mydomain.com
certbot certonly --agree-tos --webroot -w /var/www/html \
    -d jitok.mydomain.com
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
