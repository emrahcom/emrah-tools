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
  constructor(...params: any) {
    super(...params);
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
async function parseQueryString(req: ServerRequest): Promise<URLSearchParams> {
  const qs = req.url.match("[?].*$");
  if (!qs) throw new BadRequest("no query string");

  return new URLSearchParams(qs[0]);
}

// ----------------------------------------------------------------------------
async function validateInput(qs: URLSearchParams): Promise<URLSearchParams> {
  if (!qs.has("secret")) throw new BadRequest("secret not found");
  const secret = qs.get("secret");
  if (!secret) throw new BadRequest("invalid secret");

  return qs;
}

// ----------------------------------------------------------------------------
async function createToken(inp: URLSearchParams): Promise<Token> {
  let alg: Algorithm = "HS512";
  if (inp.get("alg") === "HS256") alg = "HS256";

  let secret: string = "";
  let user: Dict = {};
  let feat: Dict = {};
  let cont: Dict = {};
  let pl: Payload = {
    aud: "",
    iss: "",
    sub: "",
    room: "*",
    iat: getNumericDate(0),
    exp: getNumericDate(3600),
  };

  // secret
  if (inp.get("secret")) secret = String(inp.get("secret"));
  // payload
  if (inp.get("aud")) pl.aud = String(inp.get("aud"));
  if (inp.get("iss")) pl.iss = String(inp.get("iss"));
  if (inp.get("sub")) pl.sub = String(inp.get("sub"));
  if (inp.get("room")) pl.room = String(inp.get("room"));
  if (inp.get("exp")) pl.exp = getNumericDate(Number(inp.get("exp")));
  // payload.context.user
  if (inp.get("name")) user["name"] = String(inp.get("name"));
  if (inp.get("email")) user["email"] = String(inp.get("email"));
  if (inp.get("affi")) user["affiliation"] = String(inp.get("affi"));
  if (inp.get("avatar")) user["avatar"] = String(inp.get("avatar"));
  // payload.context.features
  if (inp.get("rec")) feat["recording"] = Boolean(inp.get("rec"));
  if (inp.get("live")) feat["livestreaming"] = Boolean(inp.get("live"));
  if (inp.get("screen")) feat["screen-sharing"] = Boolean(inp.get("screen"));
  // payload.context
  if (Object.keys(user).length) cont["user"] = user;
  if (Object.keys(feat).length) cont["features"] = feat;
  if (Object.keys(cont).length) pl["context"] = cont;

  return {
    header: { alg: alg, typ: "JWT" },
    secret: secret,
    payload: pl,
  };
}

// ----------------------------------------------------------------------------
async function createJWT(tk: Token): Promise<string> {
  const jwt = await create(tk.header, tk.payload, tk.secret);

  console.log(jwt);
  console.log(tk);

  return jwt;
}

// ----------------------------------------------------------------------------
async function triggerJWT(req: ServerRequest) {
  parseQueryString(req)
    .then((qs) => validateInput(qs))
    .then((inp) => createToken(inp))
    .then((tk) => createJWT(tk))
    .then((jwt) => ok(req, jwt))
    .catch((e) => {
      console.log(e);
      if (e.name === "BadRequest") badRequest(req);
      else notImplemented(req);
    })
    .catch((e) => {
      req.conn.close();
    })
    .catch(() => {});
}

// ----------------------------------------------------------------------------
async function triggerReject(req: ServerRequest) {
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
