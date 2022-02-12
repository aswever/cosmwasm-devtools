import React, { FC, useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import { Toast } from "./Toast";

export const Messages: FC = () => {
  const queue = useAppSelector((state) => state.messages.queue);

  const messages = useMemo(
    () => queue.map((msg) => <Toast key={msg.id} msg={msg} />),
    [queue]
  );

  return <div>{messages}</div>;
};
