<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 col-md-9 text-md-center">
        <img alt="logo" src="../assets/logo.png" />
        <h1>{{ msg }}</h1>
        <br />
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-3 text-md-left">
        <strong>alg</strong><br />
        <select v-model="alg">
          <option>HS512</option>
          <option>HS256</option>
        </select>
        <br />
        <strong>secret</strong><br />
        <input type="text" v-model="secret" /><br />
        <strong>aud</strong><br />
        <input type="text" v-model="aud" /><br />
        <strong>iss</strong><br />
        <input type="text" v-model="iss" /><br />
        <strong>sub</strong><br />
        <input type="text" v-model="sub" /><br />
        <strong>room</strong><br />
        <input type="text" v-model="room" /><br />
        <strong>exp</strong> <em>(seconds)</em><br />
        <input type="text" v-model="exp" /><br />
      </div>
      <div class="col-12 col-md-3 text-md-left">
        <strong>username</strong><br />
        <input type="text" v-model="cntx.user.name" /><br />
        <strong>email</strong><br />
        <input type="text" v-model="cntx.user.email" /><br />
        <strong>avatar link</strong><br />
        <input type="text" v-model="cntx.user.avatar" /><br />
        <br />
        <strong>affiliation</strong><br />
        <input type="radio" v-model="cntx.user.affi" value="owner" /> &nbsp;
        <label>owner</label><br />
        <input type="radio" v-model="cntx.user.affi" value="member" /> &nbsp;
        <label>member</label><br />
        <input type="radio" v-model="cntx.user.affi" value="" /> &nbsp;
        <label>don&apos;t set</label><br />
      </div>
      <div class="col-12 col-md-3 text-md-left">
        <strong>recording</strong><br />
        <input type="radio" v-model="cntx.feat.rec" value="1" /> &nbsp;
        <label>enabled</label><br />
        <input type="radio" v-model="cntx.feat.rec" value="0" /> &nbsp;
        <label>disabled</label><br />
        <input type="radio" v-model="cntx.feat.rec" value="" /> &nbsp;
        <label>don&apos;t set</label><br />
        <br />
        <strong>streaming</strong><br />
        <input type="radio" v-model="cntx.feat.live" value="1" /> &nbsp;
        <label>enabled</label><br />
        <input type="radio" v-model="cntx.feat.live" value="0" /> &nbsp;
        <label>disabled</label><br />
        <input type="radio" v-model="cntx.feat.live" value="" /> &nbsp;
        <label>don&apos;t set</label><br />
        <br />
        <strong>screen-sharing</strong><br />
        <input type="radio" v-model="cntx.feat.screen" value="1" /> &nbsp;
        <label>enabled</label><br />
        <input type="radio" v-model="cntx.feat.screen" value="0" /> &nbsp;
        <label>disabled</label><br />
        <input type="radio" v-model="cntx.feat.screen" value="" /> &nbsp;
        <label>don&apos;t set</label><br />
        <br />
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-9 text-md-center">
        <button v-on:click="getToken">Update Token</button><br />
        <br />
        <div class="tokenDiv">
          <span v-bind:class="[tokenClass]" class="token">
            {{ token }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface Dict {
  [key: string]: unknown;
}

export default defineComponent({
  name: "Jitok",
  props: {
    msg: String
  },
  data() {
    return {
      alg: "HS512",
      secret: "myappsecret",
      aud: "myappid",
      iss: "",
      sub: "*",
      room: "*",
      exp: 3600,
      cntx: {
        user: {
          name: "",
          email: "",
          avatar: "",
          affi: ""
        },
        feat: {
          rec: "",
          live: "",
          screen: ""
        }
      },
      tokenClass: "outdatedToken",
      token: "no token yet"
    };
  },
  methods: {
    async getToken() {
      this.exp = Number(this.exp) || 3600;

      const pl: Dict = {
        alg: this.alg,
        secret: this.secret,
        aud: this.aud,
        iss: this.iss,
        sub: this.sub,
        room: this.room,
        exp: this.exp
      };

      if (this.cntx.user.name) pl["name"] = this.cntx.user.name;
      if (this.cntx.user.email) pl["email"] = this.cntx.user.email;
      if (this.cntx.user.avatar) pl["avatar"] = this.cntx.user.avatar;
      if (this.cntx.user.affi) pl["affi"] = this.cntx.user.affi;

      if (this.cntx.feat.rec) pl["rec"] = Number(this.cntx.feat.rec);
      if (this.cntx.feat.live) pl["live"] = Number(this.cntx.feat.live);
      if (this.cntx.feat.screen) pl["screen"] = Number(this.cntx.feat.screen);

      const req = new Request("https://jitok.emrah.com/api", {
        method: "POST",
        body: JSON.stringify(pl)
      });

      this.tokenClass = "outdatedToken";
      await fetch(req)
        .then(async res => {
          if (!res.ok) throw new Error("invalid token");
          return await res.text();
        })
        .then(data => {
          this.tokenClass = "validToken";
          this.token = data;
        })
        .catch(() => {
          this.tokenClass = "invalidToken";
          this.token = "error";
        });
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin: 20px 0 0;
}

div {
  border: 5px;
}

em {
  font-size: 12px;
}

.tokenDiv {
  background: #f8f8f8;
}

.token {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.validToken {
  color: green;
}

.invalidToken {
  color: red;
}

.outdatedToken {
  color: gray;
}
</style>
