import { FormEvent, useState } from "react";

import type { NextPage } from "next";
import { useRouter } from "next/router";

import { signIn, useSession } from "next-auth/react";
import type { Session } from "next-auth";

import { trpc } from "../../utils/trpc";
import { Message } from "../../constants/schemas";

const Message = ({
  message,
  session,
}: {
  message: Message;
  session: Session;
}) => {
  const baseStyles =
    "mb-4 text-md w-7/12 p-4 text-gray-700 border border-gray-700 rounded-md";

  const liStyles =
    message.sender.name === session.user?.name
      ? baseStyles
      : baseStyles.concat(" self-end bg-gray-700 text-white");

  return (
    <li className={liStyles}>
      <div className="flex">
        <time>
          {message.sentAt.toLocaleTimeString("en-AU", {
            timeStyle: "short",
          })}{" "}
          - {message.sender.name}
        </time>
      </div>
      {message.message}
    </li>
  );
};

const RoomPage: NextPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { roomid } = router.query;

  const { mutateAsync: sendMessageMutate } = trpc.useMutation([
    "room.sendMessage",
  ]);

  trpc.useSubscription(
    [
      "room.onSendMessage",
      {
        roomId: roomid as string,
      },
    ],
    {
      onNext(mess) {
        setMessages((m) => {
          return [...m, mess];
        });
      },
    }
  );

  function onSubmitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sendMessageMutate({
      message,
      roomId: roomid as string,
    });

    setMessage("");
  }

  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn()}>SignIn</button>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <ul className="flex flex-col p-4">
          {messages.map((m) => {
            return <Message key={m.id} message={m} session={session} />;
          })}
        </ul>
      </div>
      <form className="flex" onSubmit={onSubmitHandler}>
        <textarea
          className="black p-2.5 w-full text-gray-700 bg-gray-50 rounded-md border border-gray-700"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What want you to send"
        />
        <button className="flex-1 text-white bg-gray-900 p-2.5" type="submit">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default RoomPage;
