<template>
  <div class="jitok">
    <h1>{{ msg }}</h1>
    secret: <input type="text" v-model="secret" /><br />
    aud: <input type="text" v-model="aud" /><br />
    <button v-on:click="getToken">token</button>
    <h1>{{ token }}</h1>
    <h1>{{ secret }} {{ aud }}</h1>
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
    getToken() {
      this.token = "mytoken";
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
