import trpc from "@trpc/server";
import { randomUUID } from "crypto";

import { createRouter } from "./context";

import {
  Message,
  messageSubSchema,
  sendMessageSchema,
} from "../../constants/schemas";
import { Events } from "../../constants/events";

export const roomRouter = createRouter()
  .mutation("sendMessage", {
    input: sendMessageSchema,
    resolve({ ctx, input }) {
      const message: Message = {
        id: randomUUID(),
        ...input,
        sentAt: new Date(),
        sender: {
          name: ctx.session?.user?.name || "anonymous",
        },
      };

      ctx.ee.emit(Events.SEND_MESSAGE, message);

      return message;
    },
  })
  .subscription("onSendMessage", {
    input: messageSubSchema,
    resolve({ ctx, input }) {
      return new trpc.Subscription<Message>((emit) => {
        function onMessage(data: Message) {
          if (input.roomId === data.roomId) {
            emit.data(data);
          }
        }

        ctx.ee.on(Events.SEND_MESSAGE, onMessage);

        return () => {
          ctx.ee.off(Events.SEND_MESSAGE, onMessage);
        };
      });
    },
  });
