# ORY KRATOS

## lxc

#### create

Create a container using `Debian Buster` template.

```bash
lxc-copy -n template-buster -N test-ory-kratos
```

#### config

Customize the config to allow `Docker` in `LXC`.

```conf
# Distribution configuration
lxc.include = /usr/share/lxc/config/common.conf
lxc.arch = linux64

# Container specific configuration
lxc.include = /usr/share/lxc/config/nesting.conf
lxc.apparmor.profile = unconfined
lxc.apparmor.allow_nesting = 1

lxc.uts.name = test-ory-kratos
lxc.rootfs.path = dir:/var/lib/lxc/test-ory-kratos/rootfs
lxc.mount.entry = /usr/local/eb/cache/buster_apt_archives
var/cache/apt/archives none bind 0 0

# Network configuration
lxc.net.0.type = veth
lxc.net.0.link = br0
lxc.net.0.name = eth0
lxc.net.0.flags = up

# devices
lxc.cgroup.devices.allow = c 10:200 rwm
```

#### customize

- `/etc/hostname`
- `/etc/hosts`
- `/etc/network/interfaces`

## kratos

#### base packages

```bash
apt-get update && apt-get autoremove && apt-get dist-upgrade -dy && \
    apt-get dist-upgrade && apt-get autoremove --purge

apt-get install gnupg apt-transport-https ca-certificates curl wget

echo "deb https://download.docker.com/linux/debian buster stable" > \
    /etc/apt/sources.list.d/docker.list
wget https://download.docker.com/linux/debian/gpg  -O /tmp/docker.key
apt-key add /tmp/docker.key
apt-get update --allow-releaseinfo-change

apt-get install git
apt-get install docker-ce --no-install-recommends
```

#### docker compose

```bash
LINK=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | \
    grep browser_download_url | grep -o 'https.*docker-compose-Linux-x86_64' \
    | uniq)
wget -O /tmp/docker-compose $LINK
chmod +x /tmp/docker-compose
mv /tmp/docker-compose /usr/local/bin/
```

#### docker test

```bash
docker --version
docker-compose --version
docker run hello-world
```

#### kratos clone

```bash
cd
git clone https://github.com/ory/kratos.git
```

#### checkout to tag

```bash
cd kratos
git checkout v0.5.5-alpha.1
```

#### kratos run

```bash
docker-compose -f quickstart.yml -f quickstart-standalone.yml up --build \
    --force-recreate
```

#### kratos clean up

```bash
docker-compose -f quickstart.yml down -v
docker-compose -f quickstart.yml rm -fsv
docker ps
```

## links

- [Ory Kratos Quickstart](https://www.ory.sh/kratos/docs/quickstart/)
