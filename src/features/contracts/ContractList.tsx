import {
  SlButton,
  SlButtonGroup,
  SlCard,
} from "@shoelace-style/shoelace/dist/react";
import React, { FC, useMemo, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { ContractInfo } from "./contractsSlice";
import Editor from "react-simple-code-editor";
import formatHighlight from "json-format-highlight";
import { getQuerier } from "../../services/Querier";

const customColorOptions = {
  keyColor: "black",
  numberColor: "blue",
  stringColor: "#0B7500",
  trueColor: "#00cc00",
  falseColor: "#ff8080",
  nullColor: "cornflowerblue",
};

interface ContractProps {
  info: ContractInfo;
}

export const ContractDetails: FC<ContractProps> = ({ info }) => {
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
      queryObj = JSON.parse(query);
      result = JSON.stringify(
        await querier.client.queryContractSmart(
          info.contract.address,
          queryObj
        ),
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
    <SlCard>
      <div slot="header">Contract</div>
      <p>
        <b>Label</b>: {info.contract.label}
        <br />
        <b>Address</b>: {info.contract.address}
        <br />
        <b>Creator</b>: {info.contract.creator}
        <br />
        <b>Code ID</b>: {info.contract.codeId}
      </p>
      <Editor
        highlight={(code) => formatHighlight(code)}
        placeholder="Your query"
        value={query}
        onValueChange={(code) => setQuery(code)}
      />
      <SlButtonGroup>
        <SlButton onClick={() => runQuery()}>Query</SlButton>
        <SlButton onClick={() => prettify()}>Format</SlButton>
      </SlButtonGroup>
      <pre
        className="result"
        dangerouslySetInnerHTML={{ __html: formatHighlight(result) }}
      />
    </SlCard>
  );
};

export const ContractList: FC = () => {
  const contracts = useAppSelector((state) => state.contracts.contractList);
  return (
    <SlCard>
      <div slot="header">Contracts</div>
      {contracts.map((contract, idx) => (
        <ContractDetails key={idx} info={contract} />
      ))}
    </SlCard>
  );
};
