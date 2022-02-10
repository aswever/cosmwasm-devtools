import {
  SlButton,
  SlButtonGroup,
  SlSplitPanel,
} from "@shoelace-style/shoelace/dist/react";
import React, { FC, useState } from "react";
import Editor from "react-simple-code-editor";
import formatHighlight from "json-format-highlight";
import { getQuerier } from "../../services/Querier";
import { useAppSelector } from "../../app/hooks";
import { selectedContract } from "../contracts/contractsSlice";
import styles from "./Console.module.css";
import { getClient } from "../../services/getClient";
import { selectedAccount } from "../accounts/accountsSlice";
import { useKeplr } from "../../hooks/useKeplr";

const highlightColors = {
  keyColor: "black",
  numberColor: "blue",
  stringColor: "#0B7500",
  trueColor: "#00cc00",
  falseColor: "#ff8080",
  nullColor: "cornflowerblue",
};

export const Console: FC = () => {
  const contract = useAppSelector(selectedContract);
  const account = useAppSelector(selectedAccount);
  const { keplr } = useKeplr();

  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");

  const prettify = async () => {
    setMessage(JSON.stringify(JSON.parse(message), null, 2));
  };

  async function run(command: (msgObj: any) => Promise<any>): Promise<void> {
    let result = "";
    try {
      const msgObj = JSON.parse(message);
      const resObj = await command(msgObj);
      console.log(resObj);
      result = JSON.stringify(resObj, null, 2);
    } catch (e) {
      if (e instanceof SyntaxError) {
        result = `Invalid JSON: ${e.message}`;
      } else if (e instanceof Error) {
        result = `Error: ${e.message}`;
      } else {
        result = `Unknown error: ${e}`;
      }
    }

    setResult(result);
  }

  const query = async () => {
    run(async (queryObj) => {
      if (!contract) throw new Error("No contract selected");
      const querier = await getQuerier();
      return querier.client.queryContractSmart(contract.address, queryObj);
    });
  };

  const execute = async () => {
    run(async (executeObj) => {
      if (!account) throw new Error("No account selected");
      if (!contract) throw new Error("No contract selected");

      const client = await getClient(account, keplr);
      return client.execute(
        account.address,
        contract.address,
        executeObj,
        "auto"
      );
    });
  };

  return (
    <SlSplitPanel className={styles.console}>
      <div slot="start" className={styles.input}>
        <Editor
          className={styles.editor}
          highlight={(code) => formatHighlight(code, highlightColors)}
          placeholder="Enter JSON query or transaction"
          value={message}
          padding={10}
          onValueChange={(code) => setMessage(code)}
        />
        <div className={styles.controls}>
          <SlButtonGroup className={styles.buttons}>
            <SlButton onClick={() => prettify()}>Format</SlButton>
            <SlButton onClick={() => query()}>Query</SlButton>
            <SlButton onClick={() => execute()}>Execute</SlButton>
          </SlButtonGroup>
        </div>
      </div>
      <div slot="end" className={styles.output}>
        <pre
          className={styles.result}
          dangerouslySetInnerHTML={{
            __html: formatHighlight(result, highlightColors),
          }}
        />
      </div>
    </SlSplitPanel>
  );
};
