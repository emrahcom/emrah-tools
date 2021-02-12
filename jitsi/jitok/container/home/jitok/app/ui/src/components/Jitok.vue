<template>
  <div class="jitok">
    <h1>{{ msg }}</h1>
    secret: <input type="text" v-model="secret" /><br />
    aud: <input type="text" v-model="aud" /><br />
    <button v-on:click="getToken">token</button><br />
    <span>{{ token }}</span> <br />
    <span>{{ secret }} {{ aud }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Jitok",
  props: {
    msg: String
  },
  data() {
    return {
      token: "",
      alg: "HS512",
      secret: "mysecret",
      aud: "myapp",
      iss: "",
      sub: "",
      room: "",
      exp: 3600,
      cntx: {
        user: {
          name: "",
          email: "",
          affi: "",
          avatar: ""
        },
        feat: {
          rec: undefined,
          live: undefined,
          screen: undefined
        }
      }
    };
  },
  methods: {
    async getToken() {
      const payload = {
        secret: "mysecret",
        aud: "myapp"
      };

      const headers = new Headers({
        Accept: "application/json",
        "Content-Type": "application/json"
      });

      const req = new Request("https://jitok.emrah.com/api", {
        method: "POST",
        headers: headers,
        mode: "no-cors",
        body: JSON.stringify(payload)
      });

      await fetch(req)
        .then(res => res.json())
        .then(data => { this.token = data; });
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin: 40px 0 0;
}
</style>
