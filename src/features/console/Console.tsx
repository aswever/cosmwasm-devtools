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

export const Console: FC = () => {
  const contract = useAppSelector(selectedContract);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const prettify = async () => {
    setQuery(JSON.stringify(JSON.parse(query), null, 2));
  };

  const runQuery = async () => {
    let result = "";
    const querier = await getQuerier();

    let queryObj: Record<string, unknown>;

    try {
      if (!contract) throw new Error("No contract selected");
      queryObj = JSON.parse(query);
      result = JSON.stringify(
        await querier.client.queryContractSmart(contract.address, queryObj),
        null,
        2
      );
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
  };

  return (
    <SlSplitPanel className={styles.console}>
      <div slot="start" className={styles.input}>
        <Editor
          className={styles.editor}
          highlight={(code) => formatHighlight(code)}
          placeholder="Your query"
          value={query}
          padding={10}
          onValueChange={(code) => setQuery(code)}
        />
        <div className={styles.controls}>
          <SlButtonGroup className={styles.buttons}>
            <SlButton onClick={() => prettify()}>Format</SlButton>
            <SlButton onClick={() => runQuery()}>Query</SlButton>
            <SlButton onClick={() => runQuery()}>Execute</SlButton>
          </SlButtonGroup>
        </div>
      </div>
      <div slot="end" className={styles.output}>
        <pre
          className={styles.result}
          dangerouslySetInnerHTML={{ __html: formatHighlight(result) }}
        />
      </div>
    </SlSplitPanel>
  );
};
