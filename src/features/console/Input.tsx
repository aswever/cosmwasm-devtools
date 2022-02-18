import {
  SlButton,
  SlButtonGroup,
  SlDropdown,
  SlIcon,
  SlMenu,
  SlMenuItem,
} from "@shoelace-style/shoelace/dist/react";
import React, { FC, useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import formatHighlight from "json-format-highlight";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./Input.module.css";
import {
  execute,
  prettifyInput,
  query,
  highlightColors,
  setOptionsOpen,
  sign,
} from "./consoleSlice";
import { AppThunk } from "../../app/store";

export const Input: FC = () => {
  const dispatch = useAppDispatch();
  const input = useAppSelector((state) => state.console.input);
  const [message, setMessage] = useState(input);

  useEffect(() => {
    setMessage(input);
  }, [input]);

  function run(action: AppThunk<void>) {
    dispatch(prettifyInput(message));
    dispatch(action);
  }

  return (
    <div className={styles.input}>
      <Editor
        className={styles.editor}
        highlight={(code) => formatHighlight(code, highlightColors)}
        placeholder="Enter JSON message"
        value={message}
        padding={10}
        onValueChange={(code) => setMessage(code)}
      />
      <div className={styles.controls}>
        <SlButtonGroup className={styles.buttons}>
          <SlButton onClick={() => dispatch(prettifyInput(message))}>
            Format
          </SlButton>
          <SlButton onClick={() => run(query())}>Query</SlButton>
          <SlButton onClick={() => run(execute())}>Execute</SlButton>
          <SlDropdown>
            <SlButton slot="trigger" caret></SlButton>
            <SlMenu>
              <SlMenuItem onClick={() => run(sign())}>
                Sign
              </SlMenuItem>
              <SlMenuItem onClick={() => dispatch(setOptionsOpen(true))}>
                Execute with...
              </SlMenuItem>
            </SlMenu>
          </SlDropdown>
        </SlButtonGroup>
      </div>
    </div>
  );
};
