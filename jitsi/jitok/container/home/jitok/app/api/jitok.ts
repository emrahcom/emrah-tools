import {
  serve,
  Server,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import { Status } from "https://deno.land/std/http/http_status.ts";

const app: Server = serve({
  hostname: "0.0.0.0",
  port: 9000,
});

// ----------------------------------------------------------------------------
class BadRequest extends Error {
  constructor(...params: any) {
    super(...params);
    this.name = "BadRequest";
  }
}

// ----------------------------------------------------------------------------
class TokenFailed extends Error {
  constructor(...params: any) {
    super(...params);
    this.name = "TokenFailed";
  }
}

// ----------------------------------------------------------------------------
interface TokenArgs {
  domain: string;
  secret: string;
  aud: string;
  iss: string;
  room: string;
  exp: number;
  username?: string;
  email?: string;
  avatar?: string;
  ismoderator?: boolean;
  enablerecording?: boolean;
  enablelivestreaming?: boolean;
  enablescreensharing?: boolean;
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
async function validateInput(
  req: ServerRequest,
  qs: URLSearchParams,
): Promise<TokenArgs> {
  if (!qs.has("secret")) throw new BadRequest("secret not found");
  const secret = qs.get("secret");
  if (!secret) throw new BadRequest("invalid secret");

  let token: TokenArgs = {
    domain: "mydomain",
    secret: "mysecret",
    aud: "myapp",
    iss: "myapp",
    room: "myroom",
    exp: 3600,
  };

  return token;
}

// ----------------------------------------------------------------------------
async function createToken(tk: TokenArgs): Promise<string> {
  return tk.secret;
}

// ----------------------------------------------------------------------------
async function triggerToken(req: ServerRequest) {
  parseQueryString(req)
    .then((qs) => validateInput(req, qs))
    .then((tk) => createToken(tk))
    .then((token) => ok(req, token))
    .catch((e) => {
      if (e.name === "BadRequest") badRequest(req);
      else if (e.name === "TokenFailed") internalServerError(req);
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
    if ((req.method === "POST") && (req.url.match("^/api"))) triggerToken(req);
    else triggerReject(req);
  }
}

// ----------------------------------------------------------------------------
main();
