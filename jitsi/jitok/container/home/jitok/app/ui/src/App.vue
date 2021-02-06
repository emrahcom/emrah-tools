<template>
  <img alt="logo" src="./assets/logo.png" />
  <Jitok msg="Welcome to Jitok" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Jitok from "./components/Jitok.vue";

export default defineComponent({
  name: "App",
  components: {
    Jitok
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
