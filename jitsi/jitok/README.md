# Jitok

## Demo

[jitok.emrah.com](https://jitok.emrah.com/)

## API Payload

- `alg`: "HS256" | "HS512"\
  _Default_: `HS512`
- `secret`: string
- `aud`: string
- `iss`: string
- `sub`: string
- `room`: string
- `exp`: number
- `cntx_user_name`: string
- `cntx_user_email`: string
- `cntx_user_avatar`: string
- `cntx_user_affi`: "owner" | "member"
- `cntx_feat_rec`: 0 | 1
- `cntx_feat_live`: 0 | 1
- `cntx_feat_screen`: 0 | 1

#### curl example

```bash
JSON=$(cat <<EOF
{
  "alg":"HS512",
  "secret":"myappsecret",
  "aud":"myappid",
  "room":"*",
  "exp":3600,
  "cntx_user_name":"myname"
}
EOF
)

curl -H "Content-Type: application/json" -d "$JSON" https://jitok.emrah.com/api
```

## Container

#### Packages

```bash
apt-get update
apt-get dist-upgrade

apt-get install unzip nginx
```

#### Deno

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

#### NPM

`NPM` is only needed for development environment.

```bash
apt-get install gnupg git

cat >/etc/apt/sources.list.d/nodesource.list <<EOF
deb [signed-by=/usr/share/keyrings/nodesource.gpg] \
  https://deb.nodesource.com/node_16.x bullseye main
EOF

wget -qO /tmp/nodesource.gpg.key \
    https://deb.nodesource.com/gpgkey/nodesource.gpg.key
cat /tmp/nodesource.gpg.key | gpg --dearmor >/usr/share/keyrings/nodesource.gpg

apt-get update
apt-get install nodejs

node --version
npm --version
```

#### Application

```bash
adduser jitok --disabled-password --gecos ""
```

##### API

```bash
cp -arp container/home/jitok/api /home/jitok/
chmod 755 /home/jitok/api/jitok.sh

cp container/etc/systemd/system/jitok.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable jitok.service
systemctl restart jitok.service
```

##### UI

```bash
git clone https://github.com/emrahcom/emrah-tools.git
ln -s emrah-tools/jitsi/jitok/container/home/jitok/ui/ ui

cd /home/jitok/ui
npm install
npm run build

rm -rf /home/jitok/build
mv build /home/jitok/
```

#### Nginx

```bash
cp container/etc/nginx/sites-available/jitok.conf /etc/nginx/sites-available/
ln -s ../sites-available/jitok.conf /etc/nginx/sites-enabled/

/etc/init.d/nginx configtest
systemctl restart nginx.service
```

## Host

#### Nginx

```bash
apt-get install nginx ssl-cert certbot

cp host/etc/nginx/sites-available/jitok.conf /etc/nginx/sites-available/
ln -s ../sites-available/jitok.conf /etc/nginx/sites-enabled/

/etc/init.d/nginx configtest
systemctl restart nginx.service

certbot certonly --dry-run --agree-tos --webroot -w /var/www/html \
    -d jitok.mydomain.com
certbot certonly --agree-tos --webroot -w /var/www/html \
    -d jitok.mydomain.com
systemctl reload nginx.service

cp host/etc/systemd/system/certbot.service.d/override.conf \
    /etc/systemd/system/certbot.service.d/
systemctl daemon-reload
```
