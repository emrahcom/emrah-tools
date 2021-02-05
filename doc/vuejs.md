Vue.js
======

## purge old nodejs

```bash
apt-get purge nodejs

rm -rf /usr/lib/node_modules
rm -rf /usr/local/lib/node_modules
```

## install nodejs

```bash
curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -
echo "deb https://deb.nodesource.com/node_14.x buster main" > \
    /etc/apt/sources.list.d/nodesource.list

apt-get update
apt-get install nodejs

node --version
npm --version
```

## npm update
DON'T upgrade or install!

```bash
npm update -g npm
npm --version
```

## install vue-cli

```bash
npm install -g @vue/cli
npm install -g @vue/cli-service-global
npm install -g @vue/compiler-sfc

vue --version
```

## create project

```bash
vue create project-name
    > Manually select features
      > Choose Vue version
        > 3.x
      > Babel
      > TypeScript
      > Linter / Formatter
        > ESLint + Prettier
    > config in package.json
```

or

```bash
vue ui
chromium http://localhost:8000
```

## public & sources

```bash
ls project-name/public/
ls project-name/src/
```

## run serve

```bash
cd project-name
npm run serve
```

```bash
cd project-name/src/
vue serve
vue serve App.vue
chromium http://localhost:8080/
```

## upgrade app

```bash
vue upgrade
```
