import { SlSplitPanel } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import styles from "./Console.module.css";
import { Output } from "./Output";
import { Input } from "./Input";

export const Console: FC = () => {
  return (
    <SlSplitPanel className={styles.console}>
      <div slot="start" className={styles.input}>
        <Input />
      </div>
      <div slot="end" className={styles.output}>
        <Output />
      </div>
    </SlSplitPanel>
  );
};
