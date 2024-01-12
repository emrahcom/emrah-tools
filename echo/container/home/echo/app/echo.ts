// ----------------------------------------------------------------------------
// echo.ts
// ----------------------------------------------------------------------------
import { serve } from "https://deno.land/std/http/server.ts";
import { STATUS_CODE } from "https://deno.land/std/http/status.ts";

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
function ok(body: string): Response {
  return new Response(body, {
    status: STATUS_CODE.OK,
  });
}

// ----------------------------------------------------------------------------
function badRequest(): Response {
  return new Response("BadRequest", {
    status: STATUS_CODE.BadRequest,
  });
}

// ----------------------------------------------------------------------------
function forbidden(): Response {
  return new Response("Forbidden", {
    status: STATUS_CODE.Forbidden,
  });
}

// ----------------------------------------------------------------------------
function internalServerError(): Response {
  return new Response("InternalServerError", {
    status: STATUS_CODE.InternalServerError,
  });
}

// ----------------------------------------------------------------------------
function notImplemented(): Response {
  return new Response("NotImplemented", {
    status: STATUS_CODE.NotImplemented,
  });
}

// ----------------------------------------------------------------------------
function parseQueryString(url: string): URLSearchParams {
  const qs = url.match("[?].*$");
  if (!qs) throw new BadRequest("no query string");

  return new URLSearchParams(qs[0]);
}

// ----------------------------------------------------------------------------
function validateInput(req: Request, qs: URLSearchParams): Echo {
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
    const command = new Deno.Command("bash", {
      stdin: "piped",
    });
    const shell = command.spawn();
    const writer = shell.stdin.getWriter();

    await writer.write(encoder.encode(cmd));
    await writer.ready;
    await writer.close();
    await shell.status;
  } catch {
    throw new SubProcess("runtime error");
  }
}

// ----------------------------------------------------------------------------
async function triggerEcho(req: Request): Promise<Response> {
  try {
    const qs = parseQueryString(req.url);
    const inp = validateInput(req, qs);
    return await echo(inp).then(() => ok("ok"));
  } catch (e) {
    if (e.name === "BadRequest") return badRequest();
    else if (e.name === "SubProcess") return internalServerError();
    else return notImplemented();
  }
}

// ----------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") return await triggerEcho(req);
  else return forbidden();
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
