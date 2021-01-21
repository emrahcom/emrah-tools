// ----------------------------------------------------------------------------
// jitok.ts
// ----------------------------------------------------------------------------
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
class PayloadFailed extends Error {
  constructor(...params: any) {
    super(...params);
    this.name = "PayloadFailed";
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
interface User {
  name?: string;
  email?: string;
  affiliation?: string;
  avatar?: string;
}

// ----------------------------------------------------------------------------
interface Features {
  recording?: boolean;
  livestreaming?: boolean;
  screensharing?: boolean;
}

// ----------------------------------------------------------------------------
interface Context {
  user?: User;
  features?: Features;
}

// ----------------------------------------------------------------------------
interface Payload {
  key: string;
  aud: string;
  iss: string;
  sub: string;
  exp: number;
  room: string;
  context?: Context;
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
): Promise<URLSearchParams> {
  if (!qs.has("key")) throw new BadRequest("key not found");
  const key = qs.get("key");
  if (!key) throw new BadRequest("invalid key");

  return qs;
}

// ----------------------------------------------------------------------------
async function createPayload(inp: URLSearchParams): Promise<Payload> {
  let pl: Payload = {
    key: "mysecret",
    aud: "myapp",
    iss: "myapp",
    sub: "mydomain",
    room: "myroom",
    exp: 3600,
  };

  return pl;
}

// ----------------------------------------------------------------------------
async function createToken(pl: Payload): Promise<string> {
  return pl.key;
}

// ----------------------------------------------------------------------------
async function triggerToken(req: ServerRequest) {
  parseQueryString(req)
    .then((qs) => validateInput(req, qs))
    .then((inp) => createPayload(inp))
    .then((pl) => createToken(pl))
    .then((tk) => ok(req, tk))
    .catch((e) => {
      if (e.name === "BadRequest") badRequest(req);
      else if (e.name === "PayloadFailed") internalServerError(req);
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
