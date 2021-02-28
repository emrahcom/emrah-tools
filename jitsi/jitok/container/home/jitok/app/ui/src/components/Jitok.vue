<template>
  <div class="jitok">
    <h1>{{ msg }}</h1>
    secret: <input type="text" v-model="secret" /><br />
    aud: <input type="text" v-model="aud" /><br />
    alg:
    <select v-model="alg">
      <option>HS512</option>
      <option>HS256</option>
    </select>
    <br />
    iss: <input type="text" v-model="iss" /><br />
    sub: <input type="text" v-model="sub" /><br />
    room: <input type="text" v-model="room" /><br />
    exp: <input type="text" v-model="exp" /><br />
    username: <input type="text" v-model="cntx.user.name" /><br />
    email: <input type="text" v-model="cntx.user.email" /><br />
    avatar: <input type="text" v-model="cntx.user.avatar" /><br />
    affiliation:<br />
    <input type="radio" v-model="cntx.user.affi" value="owner" />
    <label>owner</label><br />
    <input type="radio" v-model="cntx.user.affi" value="member" />
    <label>member</label><br />
    <input type="radio" v-model="cntx.user.affi" value="" />
    <label>don&apos;t set</label><br />
    <br />
    recording:<br />
    <input type="radio" v-model="cntx.feat.rec" value="1" />
    <label>enabled</label><br />
    <input type="radio" v-model="cntx.feat.rec" value="0" />
    <label>disabled</label><br />
    <input type="radio" v-model="cntx.feat.rec" value="" />
    <label>don&apos;t set</label><br />
    <br />
    streaming:<br />
    <input type="radio" v-model="cntx.feat.live" value="1" />
    <label>enabled</label><br />
    <input type="radio" v-model="cntx.feat.live" value="0" />
    <label>disabled</label><br />
    <input type="radio" v-model="cntx.feat.live" value="" />
    <label>don&apos;t set</label><br />
    <br />
    screen-sharing:<br />
    <input type="radio" v-model="cntx.feat.screen" value="1" />
    <label>enabled</label><br />
    <input type="radio" v-model="cntx.feat.screen" value="0" />
    <label>disabled</label><br />
    <input type="radio" v-model="cntx.feat.screen" value="" />
    <label>don&apos;t set</label><br />
    <br />
    <button v-on:click="getToken">token</button><br />
    <span v-bind:class="isValidToken ? 'validToken' : 'invalidToken'">
      {{ token }}
    </span>
    <br />
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
      secret: "mysecret",
      aud: "myapp",
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
      isValidToken: true,
      token: ""
    };
  },
  methods: {
    async getToken() {
      const pl: Dict = {
        alg: this.alg,
        secret: this.secret,
        aud: this.aud,
        iss: this.iss,
        sub: this.sub,
        room: this.room
      };

      if (this.cntx.user.name) pl["name"] = this.cntx.user.name;
      if (this.cntx.user.email) pl["email"] = this.cntx.user.email;
      if (this.cntx.user.avatar) pl["avatar"] = this.cntx.user.avatar;
      if (this.cntx.user.affi) pl["affi"] = this.cntx.user.affi;

      if (this.cntx.feat.rec) pl["rec"] = this.cntx.feat.rec;
      if (this.cntx.feat.live) pl["live"] = this.cntx.feat.live;
      if (this.cntx.feat.screen) pl["screen"] = this.cntx.feat.screen;

      const req = new Request("https://jitok.emrah.com/api", {
        method: "POST",
        body: JSON.stringify(pl)
      });

      await fetch(req)
        .then(async res => await res.text())
        .then(data => {
          this.isValidToken = true;
          this.token = data;
        })
        .catch(() => {
          this.isValidToken = false;
          this.token = "error";
        });
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin: 40px 0 0;
}

.validToken {
  color: green;
}

.invalidToken {
  color: red;
}
</style>
