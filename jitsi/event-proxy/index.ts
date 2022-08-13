import { serve } from "https://deno.land/std/http/server.ts";
import {
  API_OCCUPANT_JOINED,
  API_OCCUPANT_LEFT,
  API_ROOM_CREATED,
  API_ROOM_DESTROYED,
  DEBUG,
  HOST,
  PORT,
} from "./config.ts";
import { post } from "./lib/http/action.ts";
import { methodNotAllowed, notFound, ok } from "./lib/http/response.ts";

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
