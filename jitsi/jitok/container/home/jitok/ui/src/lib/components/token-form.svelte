<script lang="ts">
  import type { Payload } from "$lib/custom-types";
  import FieldText from "$lib/components/field-text.svelte";
  import FieldPassword from "$lib/components/field-password.svelte";
  import FieldNumber from "$lib/components/field-number.svelte";
  import FieldSelect from "$lib/components/field-select.svelte";
  import FieldRadio from "$lib/components/field-radio.svelte";
  import { getToken } from "$lib/functions";
  import {
    algOptions,
    affiOptions,
    recOptions,
    liveOptions,
    screenOptions,
  } from "$lib/globals";

  let token = "no token yet";
  let tokenColor = "text-muted";
  let payload: Payload = {
    alg: "HS512",
    secret: "myappsecret",
    aud: "myappid",
    iss: "",
    sub: "*",
    room: "*",
    exp: 3600,
    cntx_user_name: "",
    cntx_user_email: "",
    cntx_user_avatar: "",
    cntx_user_affi: undefined,
    cntx_feat_rec: undefined,
    cntx_feat_live: undefined,
    cntx_feat_screen: undefined,
  };

  async function setToken() {
    token = "no token yet";
    tokenColor = "text-muted";
    payload.exp = Number(payload.exp) || 3600;

    const _token = await getToken(payload);

    if (_token === "error") {
      tokenColor = "text-danger";
    } else {
      tokenColor = "text-success";
    }

    token = _token;
  }
</script>

<!-- -------------------------------------------------------------------------->
<div class="container-fluid">
  <form on:submit|preventDefault={setToken}>
    <div class="row justify-content-center">
      <div class="col-lg text-center" style="max-width:540px;">
        <h5 class="text-muted mt-3">System</h5>

        <FieldSelect name="alg" bind:value={payload.alg} options={algOptions} />
        <FieldPassword bind:secret={payload.secret} />
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
          bind:value={payload.cntx_user_name}
        />
        <FieldText
          name="email"
          required={false}
          bind:value={payload.cntx_user_email}
        />
        <FieldText
          name="avatar link"
          required={false}
          bind:value={payload.cntx_user_avatar}
        />
        <FieldRadio
          title="affiliation"
          name="affi"
          bind:value={payload.cntx_user_affi}
          options={affiOptions}
        />
      </div>

      <div class="col-lg text-center" style="max-width:540px;">
        <h5 class="text-muted mt-3">Features</h5>

        <FieldRadio
          title="recording"
          name="rec"
          bind:value={payload.cntx_feat_rec}
          options={recOptions}
        />
        <FieldRadio
          title="streaming"
          name="live"
          bind:value={payload.cntx_feat_live}
          options={liveOptions}
        />
        <FieldRadio
          title="screen-sharing"
          name="screen"
          bind:value={payload.cntx_feat_screen}
          options={screenOptions}
        />
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col text-center mt-3">
        <button class="btn btn-secondary" type="submit">Update Token</button>
      </div>
    </div>
  </form>

  <div class="row justify-content-center">
    <div
      class="col text-center {tokenColor} text-break mx-3 my-4"
      style="max-width:1080px;"
    >
      {token}
    </div>
  </div>
</div>
