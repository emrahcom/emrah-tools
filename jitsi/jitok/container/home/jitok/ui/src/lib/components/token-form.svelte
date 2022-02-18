<script lang="ts">
  import type { Payload } from "$lib/custom-types";
  import FieldSecret from "$lib/components/field-secret.svelte";
  import FieldText from "$lib/components/field-text.svelte";
  import FieldNumber from "$lib/components/field-number.svelte";
  import FieldSelect from "$lib/components/field-select.svelte";

  const algOptions = [
    {
      optName: "HS512",
      optValue: "HS512",
    },
    {
      optName: "HS256",
      optValue: "HS256",
    },
  ];

  let payload: Payload = {
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
        affi: "",
      },
      feat: {
        rec: "",
        live: "",
        screen: "",
      },
    },
  };
</script>

<!-- -------------------------------------------------------------------------->
<div class="container-fluid">
  <div class="row justify-content-center">
    <div class="col-lg text-center" style="max-width:540px;">
      <h5 class="text-muted mt-3">System</h5>

      <FieldSelect name="alg" bind:value={payload.alg} options={algOptions} />
      <FieldSecret bind:secret={payload.secret} />
      <FieldText name="aud" required={true} bind:value={payload.aud} />
      <FieldText name="iss" required={false} bind:value={payload.iss} />
      <FieldText name="sub" required={false} bind:value={payload.sub} />
      <FieldText name="room" required={false} bind:value={payload.room} />
      <FieldNumber name="exp" required={false} bind:value={payload.exp} />
    </div>

    <div class="col-lg text-center" style="max-width:540px;">
      <h5 class="text-muted mt-3">User Profile</h5>

      <FieldText
        name="username"
        required={false}
        bind:value={payload.cntx.user.name}
      />
      <FieldText
        name="email"
        required={false}
        bind:value={payload.cntx.user.email}
      />
      <FieldText
        name="avatar link"
        required={false}
        bind:value={payload.cntx.user.avatar}
      />
    </div>

    <div class="col-lg text-center" style="max-width:540px;">
      <h5 class="text-muted mt-3">Features</h5>
    </div>
  </div>

  <div class="row justify-content-center">
    <div class="col text-center">
      <button class="btn btn-secondary">Update</button>
    </div>
  </div>
</div>

<br />
<p>Alg: {payload.alg}</p>
<p>Secret: {payload.secret}</p>
<p>Aud: {payload.aud}</p>
<p>Iss: {payload.iss}</p>
<p>Sub: {payload.sub}</p>
<p>Room: {payload.room}</p>
<p>Exp: {payload.exp}</p>
