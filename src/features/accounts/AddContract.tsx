import {
  SlButton,
  SlCard,
  SlDialog,
  SlIcon,
  SlInput,
} from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import React, { FC, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import styles from "./AddContract.module.css";
import { importContract } from "./accountsSlice";

interface ImportContractProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ImportContract: FC<ImportContractProps> = ({ open, setOpen }) => {
  const dispatch = useAppDispatch();
  const [address, setAddress] = useState("");

  function doImport() {
    dispatch(importContract(address));
    setAddress("");
    setOpen(false);
  }

  return (
    <SlDialog
      label="Add contract"
      open={open}
      onSlAfterHide={() => setOpen(false)}
    >
      <div className={styles.importGroup}>
        <SlInput
          placeholder="Address"
          value={address}
          className={styles.address}
          onSlChange={(e) =>
            setAddress((e.target as SlInputElement).value.trim())
          }
        />
        <SlButton className={styles.importButton} onClick={() => doImport()}>
          Add
        </SlButton>
      </div>
      <div className={styles.importGroup}>
        <input className={styles.file} type="file" accept=".wasm" />
        <SlButton className={styles.importButton} onClick={() => doImport()}>
          Upload
        </SlButton>
      </div>
    </SlDialog>
  );
};

export const AddContract: FC = () => {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <SlCard className={styles.adder} onClick={() => setImportOpen(true)}>
        <SlIcon name="plus-lg" className={styles.plus} /> Add contract
      </SlCard>
      <ImportContract open={importOpen} setOpen={setImportOpen} />
    </>
  );
};
