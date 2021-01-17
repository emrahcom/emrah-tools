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
class SubProcess extends Error {
  constructor(...params: any) {
    super(...params);
    this.name = "SubProcess";
  }
}

// ----------------------------------------------------------------------------
interface EchoArgs {
  addr: string;
  port: number;
  proto: string;
  text: string;
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
): Promise<EchoArgs> {
  if (!req.headers.has("X-Forwarded-For")) {
    throw new BadRequest("remote_ip not found");
  }
  const addr = req.headers.get("X-Forwarded-For");
  if (!addr || !addr.match("^[0-9.]+$")) throw new BadRequest("invalid addr");

  if (!qs.has("proto")) throw new BadRequest("proto not found");
  if (!qs.has("port")) throw new BadRequest("port not found");
  if (!qs.has("text")) throw new BadRequest("text not found");

  const proto = qs.get("proto");
  if (!(proto === "tcp" || proto === "udp")) {
    throw new BadRequest("invalid proto");
  }

  const port = qs.get("port");
  if (!port || !port.match("^[0-9]+$")) throw new BadRequest("invalid port");
  const nport: number = Number(port);
  if (nport < 20 || nport > 65535) throw new BadRequest("port out of range");

  const text = qs.get("text");
  if (!text || !text.match("^[0-9a-zA-Z _-]+$")) {
    throw new BadRequest("invalid text");
  }
  if (text.length > 100) throw new BadRequest("very long text");

  return {
    addr: addr,
    port: nport,
    proto: proto,
    text: text,
  };
}

// ----------------------------------------------------------------------------
async function echo(ec: EchoArgs) {
  let cmd: string;
  if (ec.proto === "udp") {
    cmd = `echo ${ec.text} | timeout 6 ncat -u ${ec.addr} ${ec.port}`;
  } else if (ec.proto === "tcp") {
    cmd = `echo ${ec.text} | timeout 6 ncat ${ec.addr} ${ec.port}`;
  } else {
    throw new Error("unsupported protocol");
  }

  const encoder = new TextEncoder();
  const shell = Deno.run({
    cmd: ["bash"],
    stdin: "piped",
  });

  await shell.stdin.write(encoder.encode(cmd));
  await shell.stdin.close();
  await shell.status();
  shell.close();
}

// ----------------------------------------------------------------------------
async function triggerEcho(req: ServerRequest) {
  parseQueryString(req)
    .then((qs) => validateInput(req, qs))
    .then((ec) => echo(ec))
    .then(() => ok(req, "ok"))
    .catch((e) => {
      if (e.name === "BadRequest") badRequest(req);
      else if (e.name === "SubProcess") internalServerError(req);
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
    if (req.method === "GET") triggerEcho(req);
    else triggerReject(req);
  }
}

// ----------------------------------------------------------------------------
main();
