import React, { FC } from "react";
import formatHighlight from "json-format-highlight";
import { useAppSelector } from "../../app/hooks";
import styles from "./Output.module.css";
import { highlightColors } from "./consoleSlice";

export const Output: FC = () => {
  const output = useAppSelector((state) => state.console.output);
  const error = useAppSelector((state) => state.console.error);

  const classes = [styles.output];
  if (error) {
    classes.push(styles.error);
  }

  return (
    <div className={classes.join(" ")}>
      <pre
        dangerouslySetInnerHTML={{
          __html: error ? output : formatHighlight(output, highlightColors),
        }}
      />
    </div>
  );
};
