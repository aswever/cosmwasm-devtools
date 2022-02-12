import React, { FC, useEffect, useRef } from "react";
import { SlAlert, SlIcon } from "@shoelace-style/shoelace/dist/react";
import type SlAlertElement from "@shoelace-style/shoelace/dist/components/alert/alert";
import { Message, shiftMessage } from "./messagesSlice";
import { useAppDispatch } from "../../app/hooks";

interface ToastProps {
  msg: Message;
}

export const Toast: FC<ToastProps> = ({ msg }) => {
  const dispatch = useAppDispatch();
  const msgRef = useRef<SlAlertElement>(null);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.toast();
      // setTimeout(() => dispatch(shiftMessage()), 3000);
    }
  }, [msg, dispatch]);

  return (
    <SlAlert ref={msgRef} variant={msg.level} duration={3000} closable>
      <SlIcon slot="icon" name="check2-circle" />
      {msg.header && (
        <>
          <strong>{msg.header}</strong>
          <br />
        </>
      )}
      {msg.message}
    </SlAlert>
  );
};
