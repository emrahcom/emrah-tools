// ----------------------------------------------------------------------------
// echo.ts
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
  constructor(msg: string) {
    super(msg);
    this.name = "BadRequest";
  }
}

// ----------------------------------------------------------------------------
class SubProcess extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "SubProcess";
  }
}

// ----------------------------------------------------------------------------
interface Echo {
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
function parseQueryString(req: ServerRequest): URLSearchParams {
  const qs = req.url.match("[?].*$");
  if (!qs) throw new BadRequest("no query string");

  return new URLSearchParams(qs[0]);
}

// ----------------------------------------------------------------------------
function validateInput(
  req: ServerRequest,
  qs: URLSearchParams,
): Echo {
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
  const nport = Number(port);
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
async function echo(inp: Echo) {
  let cmd: string;
  if (inp.proto === "udp") {
    cmd = `echo ${inp.text} | timeout 6 ncat -u ${inp.addr} ${inp.port}`;
  } else if (inp.proto === "tcp") {
    cmd = `echo ${inp.text} | timeout 6 ncat ${inp.addr} ${inp.port}`;
  } else {
    throw new Error("unsupported protocol");
  }

  try {
    const encoder = new TextEncoder();
    const shell = Deno.run({
      cmd: ["bash"],
      stdin: "piped",
    });

    await shell.stdin.write(encoder.encode(cmd));
    await shell.stdin.close();
    await shell.status();
    shell.close();
  } catch {
    throw new SubProcess("runtime error");
  }
}

// ----------------------------------------------------------------------------
async function triggerEcho(req: ServerRequest) {
  try {
    const qs = parseQueryString(req);
    const inp = validateInput(req, qs);
    await echo(inp).then(() => ok(req, "ok"));
  } catch (e) {
    try {
      if (e.name === "BadRequest") badRequest(req);
      else if (e.name === "SubProcess") internalServerError(req);
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
    if (req.method === "GET") triggerEcho(req);
    else triggerReject(req);
  }
}

// ----------------------------------------------------------------------------
main();
