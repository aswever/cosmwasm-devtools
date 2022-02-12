import {
  SlButton,
  SlButtonGroup,
  SlSplitPanel,
} from "@shoelace-style/shoelace/dist/react";
import React, { FC, useState } from "react";
import Editor from "react-simple-code-editor";
import formatHighlight from "json-format-highlight";
import { useAppSelector } from "../../app/hooks";
import { selectedContract } from "../accounts/accountsSlice";
import styles from "./Console.module.css";
import { getClient, ClientType } from "../../services/getClient";
import { selectedAccount } from "../accounts/accountsSlice";

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
  const config = useAppSelector((state) => state.config.entries);

  const [message, setMessage] = useState("");
  const [result, setResult] = useState("Response will appear here");

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
      const querier = await getClient(null, config);
      return querier.client.queryContractSmart(contract.address, queryObj);
    });
  };

  const execute = async () => {
    run(async (executeObj) => {
      if (!account) throw new Error("No account selected");
      if (!contract) throw new Error("No contract selected");

      const connection = await getClient(account, config);
      if (connection.clientType !== ClientType.Signing)
        throw new Error("Failed to get signing client");

      return connection.client.execute(
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
          placeholder="Enter JSON message"
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
