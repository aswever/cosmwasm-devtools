import React, { FC } from "react";
import { useAppSelector } from "../../app/hooks";
import { Toast } from "./Toast";

export const Messages: FC = () => {
  const queue = useAppSelector((state) => state.messages.queue);

  return (
    <div>
      {queue.map((msg) => (
        <Toast key={msg.id} msg={msg} />
      ))}
    </div>
  );
};
