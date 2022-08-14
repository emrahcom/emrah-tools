import { serve } from "https://deno.land/std/http/server.ts";
import {
  API_OCCUPANT_JOINED,
  API_OCCUPANT_LEFT,
  API_ROOM_CREATED,
  API_ROOM_DESTROYED,
  DEBUG,
  HOST,
  PORT,
  TOKEN,
} from "./config.ts";
import { post } from "./lib/http/action.ts";
import {
  methodNotAllowed,
  notFound,
  ok,
  unauthorized,
} from "./lib/http/response.ts";

// -----------------------------------------------------------------------------
async function occupantJoined(serializedJson: string): Promise {
  try {
    const inp = JSON.parse(serializedJson);
    const out = {
      "event": "occupant joined",
      "username": inp.occupant.name,
    };

    const res = await post(API_OCCUPANT_JOINED, JSON.stringify(out));
    console.log(res);
  } catch (e) {
    if (DEBUG) console.error(e);
  }
}

// -----------------------------------------------------------------------------
async function occupantLeft(serializedJson: string): Promise {
  try {
    const inp = JSON.parse(serializedJson);
    const out = {
      "event": "occupant left",
      "username": inp.occupant.name,
    };

    const res = await post(API_OCCUPANT_LEFT, JSON.stringify(out));
    console.log(res);
  } catch (e) {
    if (DEBUG) console.error(e);
  }
}

// -----------------------------------------------------------------------------
async function roomCreated(serializedJson: string): Promise {
  try {
    const inp = JSON.parse(serializedJson);
    const out = {
      "event": "room created",
      "room": inp.room_name,
    };

    const res = await post(API_ROOM_CREATED, JSON.stringify(out));
    console.log(res);
  } catch (e) {
    if (DEBUG) console.error(e);
  }
}

// -----------------------------------------------------------------------------
async function roomDestroyed(serializedJson: string): Promise {
  try {
    const inp = JSON.parse(serializedJson);
    const out = {
      "event": "room destroyed",
      "room": inp.room_name,
    };

    const res = await post(API_ROOM_DESTROYED, JSON.stringify(out));
    console.log(res);
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
  // allow only POST method
  if (req.method !== "POST") return methodNotAllowed();

  // check bearer token if it's set in config.ts
  if (TOKEN) {
    const auth = req.headers.get("authorization");

    if (!auth) return unauthorized();
    if (auth.split(" ")[0] !== "Bearer") return unauthorized();
    if (TOKEN !== auth.split(" ")[1]) return unauthorized();
  }

  const url = new URL(req.url);
  const path = url.pathname;

  return await route(req, path);
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
