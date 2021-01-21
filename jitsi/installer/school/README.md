jitsi-school-installer
======================
`jitsi-school-installer` installs a simple standalone Jitsi server
pre-configured for school use. Tested only on `Debian 10 Buster` and
`Ubuntu 20.04 Focal Fossa`. This script guides the user during the
installation to avoid potential problems.


## Pre-configured features
* Enabled JWT authentication
* Only teachers can create a classroom
* Students cannot create a classroom but can connect to the classroom if it was
  already created by a teacher
* Guests cannot connect to the classroom
* The classroom will be closed 60 seconds after the teacher leaves.
* There can be many teachers in a classroom with teacher privileges
* The teacher always gets teacher privileges when reconnecting
* The participants cannot change their profiles
* Disabled YouTube sharing


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


## Teacher token (payload) sample
```json
{
  "aud": "appid",
  "iss": "appid",
  "sub": "jitsi.yourdomain.com",
  "exp": 1611264624,
  "room": "*",
  "context": {
    "user": {
      "name": "teacher-name",
      "email": "teacher-name@yourdomain.com",
      "affiliation": "teacher"
    },
    "features": {
      "recording": true,
      "livestreaming": true,
      "screen-sharing": true
    }
  }
}
```


## Student token (payload) sample
```json
{
  "aud": "appid",
  "iss": "appid",
  "sub": "jitsi.yourdomain.com",
  "exp": 1611264624,
  "room": "classroom-name",
  "context": {
    "user": {
      "name": "student-name",
      "email": "student-name@yourdomain.com",
      "affiliation": "student"
    },
    "features": {
      "recording": false,
      "livestreaming": false,
      "screen-sharing": true
    }
  }
}
```
