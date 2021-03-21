# ORY KRATOS

## lxc

#### create

Create a container using `Debian Buster` template.

```bash
lxc-copy -n template-buster -N test-ory-kratos
```

#### config

Customize the config to aalow `Docker` in `LXC`.

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

#### packages

```bash
apt-get update && apt-get autoremove && apt-get dist-upgrade -dy && \
    apt-get dist-upgrade && apt-get autoremove --purge

apt-get install gnupg apt-transport-https ca-certificates wget

echo "deb https://download.docker.com/linux/debian buster stable" > \
    /etc/apt/sources.list.d/docker.list
wget https://download.docker.com/linux/debian/gpg  -O /tmp/docker.key
apt-key add /tmp/docker.key
apt-get update --allow-releaseinfo-change

apt-get install git
apt-get install docker-ce --no-install-recommends
```

#### docker test

```bash
docker run hello-world
```
