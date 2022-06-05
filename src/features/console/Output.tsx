import React, { FC, useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import styles from "./Output.module.css";
import ReactJson from "react-json-view";

export const Output: FC = () => {
  const output = useAppSelector((state) => state.console.output);
  const outputObject = useMemo(() => {
    try {
      return JSON.parse(output);
    } catch (_) {
      return;
    }
  }, [output]);
  const error = useAppSelector((state) => state.console.error);

  const classes = [styles.output];
  if (error) {
    classes.push(styles.error);
  }

  return (
    <div className={classes.join(" ")}>
      {outputObject ? (
        <ReactJson src={outputObject} indentWidth={2} quotesOnKeys={false} />
      ) : (
        <pre dangerouslySetInnerHTML={{ __html: output }} />
      )}
    </div>
  );
};
