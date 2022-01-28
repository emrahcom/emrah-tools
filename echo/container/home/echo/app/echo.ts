// ----------------------------------------------------------------------------
// echo.ts
// ----------------------------------------------------------------------------
import { Status } from "https://deno.land/std/http/http_status.ts";

const HOSTNAME = "0.0.0.0";
const PORT = 9000;

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
async function ok(req: Deno.RequestEvent, body: string) {
  await req.respondWith(
    new Response(body, {
      status: Status.OK,
    }),
  ).catch();
}

// ----------------------------------------------------------------------------
async function badRequest(req: Deno.RequestEvent) {
  await req.respondWith(
    new Response("BadRequest", {
      status: Status.BadRequest,
    }),
  ).catch();
}

// ----------------------------------------------------------------------------
async function forbidden(req: Deno.RequestEvent) {
  await req.respondWith(
    new Response("Forbidden", {
      status: Status.Forbidden,
    }),
  ).catch();
}

// ----------------------------------------------------------------------------
async function internalServerError(req: Deno.RequestEvent) {
  await req.respondWith(
    new Response("InternalServerError", {
      status: Status.InternalServerError,
    }),
  ).catch();
}

// ----------------------------------------------------------------------------
async function notImplemented(req: Deno.RequestEvent) {
  await req.respondWith(
    new Response("NotImplemented", {
      status: Status.NotImplemented,
    }),
  ).catch();
}

// ----------------------------------------------------------------------------
function parseQueryString(url: string): URLSearchParams {
  const qs = url.match("[?].*$");
  if (!qs) throw new BadRequest("no query string");

  return new URLSearchParams(qs[0]);
}

// ----------------------------------------------------------------------------
function validateInput(
  req: Deno.RequestEvent,
  qs: URLSearchParams,
): Echo {
  if (!req.request.headers.has("X-Forwarded-For")) {
    throw new BadRequest("remote_ip not found");
  }
  const addr = req.request.headers.get("X-Forwarded-For");
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
async function triggerEcho(req: Deno.RequestEvent) {
  try {
    const qs = parseQueryString(req.request.url);
    const inp = validateInput(req, qs);
    await echo(inp).then(() => ok(req, "ok"));
  } catch (e) {
    if (e.name === "BadRequest") badRequest(req);
    else if (e.name === "SubProcess") internalServerError(req);
    else notImplemented(req);
  }
}

// ----------------------------------------------------------------------------
async function handle(cnn: Deno.Conn) {
  const http = Deno.serveHttp(cnn);

  for await (const req of http) {
    if (req.request.method === "GET") triggerEcho(req);
    else forbidden(req);
  }
}

// ----------------------------------------------------------------------------
async function main() {
  const server = Deno.listen({
    hostname: HOSTNAME,
    port: PORT,
  });

  for await (const cnn of server) {
    handle(cnn);
  }
}

// ----------------------------------------------------------------------------
main();
