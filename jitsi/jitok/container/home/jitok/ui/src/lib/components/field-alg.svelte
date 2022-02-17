<script lang="ts">
  export let alg: "HS512" | "HS256";
</script>

<!-- -------------------------------------------------------------------------->
<div class="form-floating my-1">
  <select class="form-select" id="alg" bind:value={alg}>
    <option value="HS512">HS512</option>
    <option value="HS256">HS256</option>
  </select>
  <label for="alg">alg</label>
</div>
