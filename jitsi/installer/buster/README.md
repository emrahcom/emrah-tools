jitsi-buster-installer
======================
`jitsi-buster-installer` installs a simple standalone Jitsi server. Tested only
on `Debian 10 Buster` and `Ubuntu 20.04 Focal Fossa`. This script guides the
user during the installation to avoid potential problems.

See [Jitsi cluster
doc](https://github.com/emrahcom/emrah-buster-templates/blob/master/doc/jitsi_cluster.md)
if you need a scalable clustered Jitsi system.

## Usage
* Don't use it on a working production server
* Run as `root` (`su -l` or `sudo su -l`)
* Follow the recommendations

```bash
wget -O jitsi-buster-installer https://raw.githubusercontent.com/emrahcom/emrah-tools/main/jitsi/installer/buster/jitsi-buster-installer

export JITSI_HOST=jitsi.yourdomain.com
export TURN_HOST=turn.yourdomain.com

bash jitsi-buster-installer
```
