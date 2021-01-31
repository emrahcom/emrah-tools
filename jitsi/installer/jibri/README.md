jitsi-jibri-installer
=====================
`jitsi-jibri-installer` installs a simple standalone Jitsi server with Jibri
support. Tested only on `Debian 10 Buster` and `Ubuntu 20.04 Focal Fossa`.
This script guides the user during the installation to avoid potential
problems.


## Usage
* Don't use it on a working production server
* Run as _root_
* Follow the recommendations during the installation

#### Being root
Switch to the `root` account if you are not already `root`. Use one of the
following command according to your system.

```bash
sudo su -l
```

or

```bash
su -l
```


#### Installation
```bash
wget -O jitsi-jibri-installer https://raw.githubusercontent.com/emrahcom/emrah-tools/main/jitsi/installer/jibri/jitsi-jibri-installer

export JITSI_HOST=jitsi.yourdomain.com
export TURN_HOST=turn.yourdomain.com

bash jitsi-jibri-installer
```
