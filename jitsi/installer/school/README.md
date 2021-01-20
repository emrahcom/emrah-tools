jitsi-school-installer
======================
`jitsi-school-installer` installs a simple standalone Jitsi server
pre-configured for school use. Tested only on `Debian 10 Buster` and
`Ubuntu 20.04 Focal Fossa`. This script guides the user during the
installation to avoid potential problems.

## Usage
* Don't use it on a working production server
* Run as _root_ (`su -l` or `sudo su -l`)
* Follow the recommendations

```bash
wget -O jitsi-school-installer https://raw.githubusercontent.com/emrahcom/emrah-tools/main/jitsi/installer/school/jitsi-school-installer

export JITSI_HOST=jitsi.yourdomain.com
export TURN_HOST=turn.yourdomain.com

bash jitsi-school-installer
```
