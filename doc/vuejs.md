Vue.js
======

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

## install vue-cli

```bash
npm install -g @vue/cli
npm install -g @vue/cli-service-global
npm install -g @vue/compiler-sfc

vue --version
```

## upgrade vue-cli

```bash
npm update -g @vue/cli
npm update -g @vue/cli-service-global
npm update -g @vue/compiler-sfc
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
```

or

```bash
vue ui
chromium http://localhost:8000
```

## first app

*App.vue*

```html
<template>
  <h1>Hello!</h1>
</template>
```

## run server

```bash
vue serve App.vue
chromium http://localhost:8080/
```

## upgrade app

```bash
vue upgrade
```

## build app

```bash
vue build App.vue
```


## add plugin

```bash
vue add apollo
vue add @foo/bar
```
