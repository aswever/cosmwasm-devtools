import {
  SlButton,
  SlCard,
  SlDialog,
  SlDivider,
  SlIcon,
  SlInput,
  SlRadio,
  SlRadioGroup,
} from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import React, { FC, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./AddContract.module.css";
import {
  importContract,
  instantiateContract,
  selectedAccount,
  setImportContractOpen,
  uploadContract,
} from "./accountsSlice";
import { useSelector } from "react-redux";
import Editor from "react-simple-code-editor";
import formatHighlight from "json-format-highlight";
import { highlightColors } from "../console/consoleSlice";

enum UploadType {
  File = "file",
  Code = "code",
}

export const ImportContract: FC = () => {
  const dispatch = useAppDispatch();
  const wasmInput = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState("");
  const [codeId, setCodeId] = useState("");
  const [uploadType, setUploadType] = useState(UploadType.File);
  const open = useAppSelector((state) => state.accounts.importContractOpen);
  const account = useSelector(selectedAccount);

  useEffect(() => {
    if (!open) {
      setAddress("");
      setLabel("");
      setMessage("");
      setCodeId("");
    }
  }, [open]);

  function doImport() {
    dispatch(importContract(address));
  }

  async function doUpload() {
    if (!account) throw new Error("No account selected");

    const instantiateMsg = JSON.parse(message);

    if (uploadType === UploadType.File) {
      const wasmFile = wasmInput.current?.files?.[0];
      if (wasmFile) {
        const wasmBuffer = await wasmFile.arrayBuffer();
        const wasm = new Uint8Array(wasmBuffer);
        dispatch(
          uploadContract({
            address: account.address,
            wasm,
            instantiateMsg,
            label,
          })
        );
      }
    } else {
      dispatch(
        instantiateContract({
          address: account.address,
          codeId: Number(codeId),
          instantiateMsg,
          label,
        })
      );
    }
  }

  return (
    <SlDialog
      label="Import contract"
      open={open}
      onSlAfterHide={() => dispatch(setImportContractOpen(false))}
    >
      <div className={styles.importGroup}>
        <SlInput
          placeholder="Address"
          value={address}
          className={styles.address}
          onSlInput={(e) =>
            setAddress((e.target as SlInputElement).value.trim())
          }
        />
        <SlButton className={styles.importButton} onClick={() => doImport()}>
          Import
        </SlButton>
      </div>
      <SlDivider />
      <div className={styles.uploadHeader}>
        <div className={styles.uploadTitle}>Create contract</div>
        <div className={styles.instantiateFrom}>
          <SlRadioGroup className={styles.choices}>
            <SlRadio
              onSlFocus={() => setUploadType(UploadType.File)}
              className={styles.choice}
              checked={uploadType === UploadType.File}
            >
              From file
            </SlRadio>
            <SlRadio
              onSlFocus={() => setUploadType(UploadType.Code)}
              className={styles.choice}
              checked={uploadType === UploadType.Code}
            >
              From code
            </SlRadio>
          </SlRadioGroup>
        </div>
      </div>
      <div className={styles.upload}>
        <div className={styles.uploadGroup}>
          <SlInput
            placeholder="Label"
            value={label}
            className={styles.label}
            onSlInput={(e) =>
              setLabel((e.target as SlInputElement).value.trim())
            }
          />
          {uploadType === UploadType.File ? (
            <input
              className={styles.file}
              type="file"
              accept=".wasm"
              ref={wasmInput}
            />
          ) : (
            <SlInput
              placeholder="Code ID"
              value={codeId}
              type="number"
              min="1"
              className={styles.code}
              onSlInput={(e) =>
                setCodeId((e.target as SlInputElement).value.trim())
              }
            />
          )}
        </div>
        <div className={styles.msgWrapper}>
          <Editor
            className={styles.instantiateMsg}
            highlight={(code) => formatHighlight(code, highlightColors)}
            placeholder="Instantiate message"
            value={message}
            padding={10}
            onValueChange={(code) => setMessage(code)}
          />
        </div>
        <div className={styles.uploadButton}>
          <SlButton onClick={() => doUpload()} disabled={!account}>
            {uploadType === UploadType.File ? "Upload and i" : "I"}nstantiate
          </SlButton>
        </div>
      </div>
    </SlDialog>
  );
};

export const AddContract: FC = () => {
  const dispatch = useAppDispatch();

  return (
    <>
      <SlCard
        className={styles.adder}
        onClick={() => dispatch(setImportContractOpen(true))}
      >
        <SlIcon name="plus-lg" className={styles.plus} /> Add contract
      </SlCard>
      <ImportContract />
    </>
  );
};
