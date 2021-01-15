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
export async function parseQueryString(
  req: ServerRequest,
): Promise<URLSearchParams> {
  try {
    const qs = req.url.match("[?].*$");
    if (!qs) throw new Error("no query string");

    return new URLSearchParams(qs[0]);
  } catch (error) {
    return new URLSearchParams();
  }
}

// ----------------------------------------------------------------------------
export const ok = (req: ServerRequest, resBody: string) =>
  req.respond({
    status: 200,
    body: resBody,
  });

// ----------------------------------------------------------------------------
export const forbidden = (req: ServerRequest) =>
  req.respond({
    status: Status.Forbidden,
    body: "Forbidden",
  });

// ----------------------------------------------------------------------------
export const badRequest = (req: ServerRequest) =>
  req.respond({
    status: Status.BadRequest,
    body: "BadRequest",
  });

// ----------------------------------------------------------------------------
async function sendEcho(
  req: ServerRequest,
  qs: URLSearchParams,
): Promise<boolean> {
  //if (!req.headers.has("remote_ip")) throw new Error("remote_ip not found");
  if (!qs.has("proto")) throw new Error("proto not found");
  if (!qs.has("port")) throw new Error("port not found");
  if (!qs.has("text")) throw new Error("text not found");

  const proto = qs.get("proto");
  const port = qs.get("port");
  const text = qs.get("text");

  if (!(proto === "tcp" || proto === "udp")) throw new Error("invalid proto");
  if (!port || !port.match("^[0-9]+$")) throw new Error("invalid port");
  if (!text || !text.match("^[0-9a-zA-Z _-]+$")) {
    throw new Error("invalid text");
  }

  return true;
}

// ----------------------------------------------------------------------------
async function main() {
  for await (const req of app) {
    if (req.method === "GET") {
      const qs = await parseQueryString(req);
      const res = await sendEcho(req, qs).then(() => {
        ok(req, "ok");
      }).catch(() => {
        badRequest(req);
      });

      continue;
    }

    forbidden(req);
  }
}

// ----------------------------------------------------------------------------
main();
