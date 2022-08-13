import { serve } from "https://deno.land/std/http/server.ts";
import { HOST, PORT } from "./config.ts";
import { methodNotAllowed, notFound, ok } from "./lib/http/response.ts";

async function delay(milliseconds: number, event: string): Promise {
  await console.log(`${event} - 0`);

  return new Promise(() =>
    setTimeout(() => console.log(`${event} - 1`), milliseconds)
  );
}

// -----------------------------------------------------------------------------
async function route(req: Request, path: string): Promise<Response> {
  const _json = await req.json();

  if (path === "/events/room/created") {
    delay(5000, "created");
    return ok();
  } else if (path === "/events/room/destroyed") {
    delay(5000, "destroyed");
    return ok();
  } else if (path === "/events/occupant/joined") {
    delay(5000, "joined");
    return ok();
  } else if (path === "/events/occupant/left") {
    delay(5000, "left");
    return ok();
  } else {
    return notFound();
  }
}

// -----------------------------------------------------------------------------
async function handler(req: Request): Promise<Response> {
  // check the request method, allow only if POST
  if (req.method === "POST") {
    const url = new URL(req.url);
    const path = url.pathname;

    return await route(req, path);
  } else {
    return methodNotAllowed();
  }
}

// -----------------------------------------------------------------------------
function main() {
  serve(handler, {
    hostname: HOST,
    port: PORT,
  });
}

// -----------------------------------------------------------------------------
main();
