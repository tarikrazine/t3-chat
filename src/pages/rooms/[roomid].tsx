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
  return <div>Message</div>;
};

const RoomPage: NextPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { roomid } = router.query;

  const { mutateAsync: sendMessageMutate } =
    trpc.useMutation("room.sendMessage");

  trpc.useSubscription(["room.onSendMessage", { roomId: roomid as string }], {
    onNext(message) {
      setMessages((m) => {
        return [...m, message];
      });
    },
  });

  function onSubmitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sendMessageMutate({
      message,
      roomId: roomid as string,
    });
  }

  const { data: session } = useSession();

  if (!session) {
    return <button onClick={() => signIn()}>SignIn</button>;
  }

  return (
    <>
      <h1>Welcom to room: {roomid}</h1>
      <ul>
        {messages.map((m) => (
          <Message key={m.id} message={m} session={session} />
        ))}
      </ul>
      <form onSubmit={onSubmitHandler}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What want you to send"
        ></textarea>
        <button type="submit">Send Message</button>
      </form>
    </>
  );
};

export default RoomPage;
