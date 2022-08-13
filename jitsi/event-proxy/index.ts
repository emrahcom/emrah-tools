import { serve } from "https://deno.land/std/http/server.ts";
import { DEBUG, HOST, PORT } from "./config.ts";
import { methodNotAllowed, notFound, ok } from "./lib/http/response.ts";

// -----------------------------------------------------------------------------
function delay(milliseconds: number): Promise {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// -----------------------------------------------------------------------------
async function occupantJoined(json: string): Promise {
  try {
    const pl = JSON.parse(json);

    console.log("occupant joined");
    await delay(3000);
    console.log(pl);
  } catch (e) {
    if (DEBUG) console.error(e);
  }
}

// -----------------------------------------------------------------------------
async function occupantLeft(json: string): Promise {
  try {
    const pl = JSON.parse(json);

    console.log("occupant left");
    await delay(3000);
    console.log(pl);
  } catch (e) {
    if (DEBUG) console.error(e);
  }
}

// -----------------------------------------------------------------------------
async function roomCreated(json: string): Promise {
  try {
    const pl = JSON.parse(json);

    console.log("room created");
    await delay(3000);
    console.log(pl);
  } catch (e) {
    if (DEBUG) console.error(e);
  }
}

// -----------------------------------------------------------------------------
async function roomDestroyed(json: string): Promise {
  try {
    const pl = JSON.parse(json);

    console.log("room destroyed");
    await delay(3000);
    console.log(pl);
  } catch (e) {
    if (DEBUG) console.error(e);
  }
}

// -----------------------------------------------------------------------------
async function route(req: Request, path: string): Promise<Response> {
  const pl = await req.text();

  if (path === "/events/occupant/joined") {
    occupantJoined(pl);
  } else if (path === "/events/occupant/left") {
    occupantLeft(pl);
  } else if (path === "/events/room/created") {
    roomCreated(pl);
  } else if (path === "/events/room/destroyed") {
    roomDestroyed(pl);
  } else {
    return notFound();
  }

  return ok();
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
