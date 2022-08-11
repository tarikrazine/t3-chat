import { createRouter } from "./context";
import { z } from "zod";

export const roomRouter = createRouter().mutation("sendMessage", {
  input: z.object({
    roomId: z.string(),
    message: z.string(),
  }),
  resolve({ ctx, input }) {},
});
