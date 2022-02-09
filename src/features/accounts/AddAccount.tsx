import {
  SlButton,
  SlButtonGroup,
  SlCard,
  SlDialog,
  SlIcon,
  SlIconButton,
  SlInput,
} from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import React, { FC, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { generateAccount, importAccount } from "./accountsSlice";
import styles from "./AddAccount.module.css";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

interface ImportDialogueProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const ImportDialogue: FC<ImportDialogueProps> = ({ open, setOpen }) => {
  const dispatch = useAppDispatch();
  const [mnemonic, setMnemonic] = useState("");

  function doImport() {
    dispatch(importAccount(mnemonic));
    setMnemonic("");
    setOpen(false);
  }

  async function generate() {
    const wallet = await DirectSecp256k1HdWallet.generate(12);
    const { mnemonic } = wallet;
    setMnemonic(mnemonic);
  }

  return (
    <SlDialog
      label="Add account"
      open={open}
      onSlAfterHide={() => setOpen(false)}
    >
      <div className={styles.importGroup}>
        <SlInput
          placeholder="Mnemonic"
          value={mnemonic}
          className={styles.mnemonic}
          onSlChange={(e) =>
            setMnemonic((e.target as SlInputElement).value.trim())
          }
        >
          <SlIconButton
            className={styles.generate}
            name="arrow-repeat"
            slot="prefix"
            onClick={() => generate()}
          />
        </SlInput>
        <SlButton className={styles.importButton} onClick={() => doImport()}>
          Add
        </SlButton>
      </div>
    </SlDialog>
  );
};

export const AddAccount: FC = () => {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <SlCard className={styles.adder} onClick={() => setImportOpen(true)}>
        <SlIcon name="plus-lg" className={styles.plus} /> Add account
      </SlCard>
      <ImportDialogue open={importOpen} setOpen={setImportOpen} />
    </>
  );
};
