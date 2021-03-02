// ----------------------------------------------------------------------------
// jitok.ts
// ----------------------------------------------------------------------------
import {
  serve,
  Server,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import { Algorithm } from "https://deno.land/x/djwt/algorithm.ts";
import {
  create,
  getNumericDate,
  Header,
  Payload,
} from "https://deno.land/x/djwt/mod.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";

const app: Server = serve({
  hostname: "0.0.0.0",
  port: 9000,
});

// ----------------------------------------------------------------------------
interface Token {
  header: Header;
  secret: string;
  payload: Payload;
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
const ok = (req: ServerRequest, resBody: string) =>
  req.respond({
    status: 200,
    body: resBody,
  });

// ----------------------------------------------------------------------------
const badRequest = (req: ServerRequest) =>
  req.respond({
    status: Status.BadRequest,
    body: "BadRequest",
  });

// ----------------------------------------------------------------------------
const forbidden = (req: ServerRequest) =>
  req.respond({
    status: Status.Forbidden,
    body: "Forbidden",
  });

// ----------------------------------------------------------------------------
const internalServerError = (req: ServerRequest) =>
  req.respond({
    status: Status.InternalServerError,
    body: "InternalServerError",
  });

// ----------------------------------------------------------------------------
const notImplemented = (req: ServerRequest) =>
  req.respond({
    status: Status.NotImplemented,
    body: "NotImplemented",
  });

// ----------------------------------------------------------------------------
function parseQueryString(req: ServerRequest): URLSearchParams {
  const qs = req.url.match("[?].*$");
  if (!qs) throw new BadRequest("no query string");

  return new URLSearchParams(qs[0]);
}

// ----------------------------------------------------------------------------
async function parseRequestBody<T>(req: ServerRequest): Promise<T> {
  const str = new TextDecoder("utf-8").decode(await Deno.readAll(req.body));
  return JSON.parse(str);
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
function createToken(inp: Dict): Token {
  let alg: Algorithm = "HS512";
  if (inp.alg && inp.alg === "HS256") alg = "HS256";

  let secret = "";
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

  // secret
  if (inp.secret) secret = String(inp.secret);
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
  if (inp.screen  !== undefined) {
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
    secret: secret,
    payload: pl,
  };
}

// ----------------------------------------------------------------------------
async function createJWT(tk: Token): Promise<string> {
  const jwt = await create(tk.header, tk.payload, tk.secret);

  console.log(tk);
  return jwt;
}

// ----------------------------------------------------------------------------
async function triggerJWT(req: ServerRequest) {
  try {
    const ps = await parseRequestBody<Dict>(req);
    const inp = validateInput(ps);
    const tk = createToken(inp);
    await createJWT(tk).then((jwt) => ok(req, jwt));
  } catch (e) {
    try {
      console.log(e);
      if (e.name === "BadRequest") badRequest(req);
      else notImplemented(req);
    } catch (e) {
      try {
        req.conn.close();
      } catch {
        undefined;
      }
    }
  }
}

// ----------------------------------------------------------------------------
function triggerReject(req: ServerRequest) {
  forbidden(req)
    .catch((e) => {
      req.conn.close();
    })
    .catch(() => {});
}

// ----------------------------------------------------------------------------
async function main() {
  for await (const req of app) {
    if ((req.method === "POST") && (req.url.match("^/api"))) triggerJWT(req);
    else triggerReject(req);
  }
}

// ----------------------------------------------------------------------------
main();
