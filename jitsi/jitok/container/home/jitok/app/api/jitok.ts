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

  //  // aud
  //  if (!qs.has("aud")) throw new BadRequest("aud not found");
  //  const aud = qs.get("aud");
  //  if (!aud || !aud.match("^[0-9a-zA-Z_.-]+$")) {
  //    throw new BadRequest("invalid aud");
  //  }
  //
  //  // iss
  //  const iss = qs.get("iss");
  //  if (iss && !iss.match("^[*0-9a-zA-Z_.-]+$")) {
  //    throw new BadRequest("invalid iss");
  //  }
  //
  //  // sub
  //  const sub = qs.get("sub");
  //  if (sub && !sub.match("^[*0-9a-zA-Z_.-]+$")) {
  //    throw new BadRequest("invalid sub");
  //  }
  //
  //  // room
  //  const room = qs.get("room");
  //  if (room && !room.match("^[*0-9a-zA-Z _.-]+$")) {
  //    throw new BadRequest("invalid room");
  //  }
  //
  //  // exp (timezone?)
  //  const exp = qs.get("exp");
  //  if (exp && !exp.match("^[0-9]+$")) {
  //    throw new BadRequest("invalid exp");
  //  }

  return ps;
}

//// ----------------------------------------------------------------------------
//function createToken(inp: Dict): Token {
//  let alg: Algorithm = "HS512";
//  if (inp.get("alg") === "HS256") alg = "HS256";
//
//  let secret = "";
//  const user: Dict = {};
//  const feat: Dict = {};
//  const cntx: Dict = {};
//  const pl: Payload = {
//    aud: "",
//    iss: "*",
//    sub: "*",
//    room: "*",
//    iat: getNumericDate(0),
//    exp: getNumericDate(3600),
//  };
//
//  // secret
//  if (inp.get("secret")) secret = String(inp.get("secret"));
//  // payload
//  if (inp.get("aud")) pl.aud = String(inp.get("aud"));
//  if (inp.get("iss")) pl.iss = String(inp.get("iss"));
//  if (inp.get("sub")) pl.sub = String(inp.get("sub"));
//  if (inp.get("room")) pl.room = String(inp.get("room"));
//  if (inp.get("exp")) pl.exp = getNumericDate(Number(inp.get("exp")));
//  // payload.context.user
//  if (inp.get("name")) user["name"] = String(inp.get("name"));
//  if (inp.get("email")) user["email"] = String(inp.get("email"));
//  if (inp.get("affi")) user["affiliation"] = String(inp.get("affi"));
//  if (inp.get("avatar")) user["avatar"] = String(inp.get("avatar"));
//  // payload.context.features
//  if (inp.get("rec")) {
//    if (inp.get("rec") === "1" || inp.get("rec") === "true") {
//      feat["recording"] = true;
//    } else {
//      feat["recording"] = false;
//    }
//  }
//  if (inp.get("live")) {
//    if (inp.get("live") === "1" || inp.get("live") === "true") {
//      feat["livestreaming"] = true;
//    } else {
//      feat["livestreaming"] = false;
//    }
//  }
//  if (inp.get("screen")) {
//    if (inp.get("screen") === "1" || inp.get("screen") === "true") {
//      feat["screen-sharing"] = true;
//    } else {
//      feat["screen-sharing"] = false;
//    }
//  }
//  // payload.context
//  if (Object.keys(user).length) cntx["user"] = user;
//  if (Object.keys(feat).length) cntx["features"] = feat;
//  if (Object.keys(cntx).length) pl["context"] = cntx;
//
//  return {
//    header: { alg: alg, typ: "JWT" },
//    secret: secret,
//    payload: pl,
//  };
//}
//
//// ----------------------------------------------------------------------------
//async function createJWT(tk: Token): Promise<string> {
//  const jwt = await create(tk.header, tk.payload, tk.secret);
//
//  console.log(jwt);
//  console.log(tk);
//
//  return jwt;
//}

// ----------------------------------------------------------------------------
async function triggerJWT(req: ServerRequest) {
  try {
    const ps = await parseRequestBody<Dict>(req);
    console.log("ps:", ps);
    const inp = validateInput(ps);
    console.log("inp:", inp);
    //const tk = createToken(inp);
    //await createJWT(tk).then((jwt) => ok(req, jwt));
    ok(req, "ok");
  } catch (e) {
    try {
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
