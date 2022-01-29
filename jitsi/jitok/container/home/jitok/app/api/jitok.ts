// ----------------------------------------------------------------------------
// jitok.ts
// ----------------------------------------------------------------------------
import { serve } from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";
import { decode } from "https://deno.land/std/encoding/base64.ts";
import { Algorithm } from "https://deno.land/x/djwt/algorithm.ts";
import {
  create,
  getNumericDate,
  Header,
  Payload,
} from "https://deno.land/x/djwt/mod.ts";

const HOSTNAME = "0.0.0.0";
const PORT = 9000;

// ----------------------------------------------------------------------------
interface Token {
  header: Header;
  payload: Payload;
  cryptoKey: CryptoKey;
}

// ----------------------------------------------------------------------------
interface Dict {
  [key: string]: unknown;
}

// ----------------------------------------------------------------------------
class BadRequest extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "BadRequest";
  }
}

// ----------------------------------------------------------------------------
function ok(body: string): Response {
  return new Response(body, {
    status: Status.OK,
  });
}

// ----------------------------------------------------------------------------
function badRequest(): Response {
  return new Response("BadRequest", {
    status: Status.BadRequest,
  });
}

// ----------------------------------------------------------------------------
function forbidden(): Response {
  return new Response("Forbidden", {
    status: Status.Forbidden,
  });
}

// ----------------------------------------------------------------------------
function notImplemented(): Response {
  return new Response("NotImplemented", {
    status: Status.NotImplemented,
  });
}

// ----------------------------------------------------------------------------
function validateInput(ps: Dict): Dict {
  // secret
  if (!ps.secret) throw new BadRequest("secret not found");
  if (typeof ps.secret !== "string") throw new BadRequest("invalid secret");
  if (!ps.secret.match("^[0-9a-zA-Z_.!@#$*+-]+$")) {
    throw new BadRequest("invalid character in secret");
  }
  // aud
  if (!ps.aud) throw new BadRequest("aud not found");
  if (typeof ps.aud !== "string") throw new BadRequest("invalid aud");
  if (!ps.aud.match("^[0-9a-zA-Z._-]+$")) {
    throw new BadRequest("invalid character in aud");
  }
  // iss
  if (ps.iss) {
    if (typeof ps.iss !== "string") throw new BadRequest("invalid iss");
    if (!ps.iss.match("^([*]|[0-9a-zA-Z._-]+)$")) {
      throw new BadRequest("invalid character in iss");
    }
  }
  // sub
  if (ps.sub) {
    if (typeof ps.sub !== "string") throw new BadRequest("invalid sub");
    if (!ps.sub.match("^([*]|[0-9a-zA-Z._-]+)$")) {
      throw new BadRequest("invalid character in sub");
    }
  }
  // room
  if (ps.room) {
    if (typeof ps.room !== "string") throw new BadRequest("invalid room");
    if (!ps.room.match("^([*]|[^<>&%/?'\"\\\\]+)$")) {
      throw new BadRequest("invalid character in room");
    }
  }
  // exp
  if (ps.exp) {
    if (typeof ps.exp !== "number") throw new BadRequest("invalid exp");
  }

  return ps;
}

// ----------------------------------------------------------------------------
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const binaryDer = decode(secret).buffer;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    binaryDer,
    {
      name: "HMAC",
      hash: "SHA-512",
    },
    true,
    ["sign", "verify"],
  );

  return cryptoKey;
}

// ----------------------------------------------------------------------------
async function createToken(inp: Dict): Promise<Token> {
  let alg: Algorithm = "HS512";
  if (inp.alg && inp.alg === "HS256") alg = "HS256";

  const cryptoKey = await getCryptoKey(String(inp.secret));
  const user: Dict = {};
  const feat: Dict = {};
  const cntx: Dict = {};
  const pl: Payload = {
    aud: "",
    iss: "",
    sub: "*",
    room: "*",
    iat: getNumericDate(0),
    exp: getNumericDate(3600),
  };

  // payload
  if (inp.aud) pl.aud = String(inp.aud);
  (inp.iss) ? pl.iss = String(inp.iss) : pl.iss = String(inp.aud);
  if (inp.sub) pl.sub = String(inp.sub);
  if (inp.room) pl.room = String(inp.room);
  if (inp.exp) pl.exp = getNumericDate(Number(inp.exp));
  // payload.context.user
  if (inp.name) user["name"] = String(inp.name);
  if (inp.email) user["email"] = String(inp.email);
  if (inp.affi) user["affiliation"] = String(inp.affi);
  if (inp.avatar) user["avatar"] = String(inp.avatar);
  // payload.context.features
  if (inp.rec !== undefined) {
    if (inp.rec === 1 || inp.rec === true) {
      feat["recording"] = true;
    } else {
      feat["recording"] = false;
    }
  }
  if (inp.live !== undefined) {
    if (inp.live === 1 || inp.live === true) {
      feat["livestreaming"] = true;
    } else {
      feat["livestreaming"] = false;
    }
  }
  if (inp.screen !== undefined) {
    if (inp.screen === 1 || inp.screen === true) {
      feat["screen-sharing"] = true;
    } else {
      feat["screen-sharing"] = false;
    }
  }
  // payload.context
  if (Object.keys(user).length) cntx["user"] = user;
  if (Object.keys(feat).length) cntx["features"] = feat;
  if (Object.keys(cntx).length) pl["context"] = cntx;

  return {
    header: { alg: alg, typ: "JWT" },
    cryptoKey: cryptoKey,
    payload: pl,
  };
}

// ----------------------------------------------------------------------------
async function createJWT(tk: Token): Promise<string> {
  const jwt = await create(tk.header, tk.payload, tk.cryptoKey);

  return jwt;
}

// ----------------------------------------------------------------------------
async function triggerJWT(req: Request): Promise<Response> {
  try {
    const ps = await req.json();
    const inp = validateInput(ps);
    const tk = await createToken(inp);
    return await createJWT(tk).then((jwt) => ok(jwt));
  } catch (e) {
    if (e.name === "BadRequest") return badRequest();
    else return notImplemented();
  }
}

// ----------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;

  if ((req.method === "POST") && (path.match("^/api"))) {
    return await triggerJWT(req);
  } else return forbidden();
}

// ----------------------------------------------------------------------------
function main() {
  serve(handler, {
    hostname: HOSTNAME,
    port: PORT,
  });
}

// ----------------------------------------------------------------------------
main();
