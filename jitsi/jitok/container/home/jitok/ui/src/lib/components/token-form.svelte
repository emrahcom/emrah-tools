<script lang="ts">
  import type { Payload } from "$lib/custom-types";
  import FieldAlg from "$lib/components/field-alg.svelte";
  import FieldSecret from "$lib/components/field-secret.svelte";
  import FieldAud from "$lib/components/field-aud.svelte";

  let payload: Payload = {
    alg: "HS512",
    secret: "myappsecret",
    aud: "myappid",
  };
</script>

<!-- -------------------------------------------------------------------------->
<div class="container-fluid">
  <div class="row justify-content-center">
    <div class="col-lg" style="max-width:540px;">
      <FieldAlg bind:alg={payload.alg} />
      <FieldSecret bind:secret={payload.secret} />
      <FieldAud bind:aud={payload.aud} />
    </div>

    <div class="col-lg" style="max-width:540px;">User</div>

    <div class="col-lg" style="max-width:540px;">Features</div>
  </div>
</div>

<br />
<p>Alg: {payload.alg}</p>
<p>Secret: {payload.secret}</p>
<p>Aud: {payload.aud}</p>
