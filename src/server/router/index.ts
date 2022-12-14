// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import fetch from "node-fetch";

import { roomRouter } from "./room";
import { protectedExampleRouter } from "./protected-example-router";

if (!global.fetch) {
  (global.fetch as any) = fetch;
}

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("room.", roomRouter)
  .merge("question.", protectedExampleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
