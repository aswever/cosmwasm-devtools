import {
  SlButton,
  SlDialog,
  SlInput,
  SlSwitch,
} from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import type SlSwitchElement from "@shoelace-style/shoelace/dist/components/switch/switch";
import React, { FC, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./ExecuteOptions.module.css";
import { execute, setExecuteOptions, setOptionsOpen } from "./consoleSlice";
import { fromMicroDenom } from "../../util/coins";

export const ExecuteOptions: FC = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.console.optionsOpen);
  const config = useAppSelector((state) => state.connection.config);
  const [funds, setFunds] = useState("");
  const [memo, setMemo] = useState("");
  const [saveDefaults, setSaveDefaults] = useState(false);

  function saveAndExecute() {
    dispatch(setOptionsOpen(false));
    if (!saveDefaults) {
      setFunds("");
      setMemo("");
    } else {
      dispatch(setExecuteOptions({ funds, memo }));
    }
    dispatch(execute({ funds, memo }));
  }

  return (
    <SlDialog
      label="Execute with..."
      open={open}
      onSlRequestClose={() => dispatch(setOptionsOpen(false))}
      className={styles.dialog}
    >
      <div className={styles.form}>
        <SlInput
          placeholder="Funds to send"
          value={funds}
          onSlChange={(e) =>
            setFunds((e.target as SlInputElement).value.trim())
          }
        >
          <div slot="suffix">{fromMicroDenom(config["microDenom"])}</div>
        </SlInput>
        <SlInput
          placeholder="Memo"
          value={memo}
          className={styles.memo}
          onSlChange={(e) => setMemo((e.target as SlInputElement).value.trim())}
        />
        <div className={styles.buttons}>
          <SlSwitch
            checked={saveDefaults}
            onSlChange={(e) =>
              setSaveDefaults((e.target as SlSwitchElement).checked)
            }
          >
            Save as default
          </SlSwitch>
          <SlButton variant="neutral" onClick={() => saveAndExecute()}>
            Execute
          </SlButton>
        </div>
      </div>
    </SlDialog>
  );
};
