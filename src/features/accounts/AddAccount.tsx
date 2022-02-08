import {
  SlButton,
  SlButtonGroup,
  SlCard,
  SlDialog,
  SlInput,
} from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import React, { FC, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { generateAccount, importAccount } from "./accountsSlice";

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

  return (
    <SlDialog label="Import" open={open} onSlAfterHide={() => setOpen(false)}>
      <SlInput
        placeholder="Mnemonic"
        value={mnemonic}
        onSlChange={(e) =>
          setMnemonic((e.target as SlInputElement).value.trim())
        }
      />
      <SlButton onClick={() => doImport()}>Import</SlButton>
    </SlDialog>
  );
};

export const AddAccount: FC = () => {
  const dispatch = useAppDispatch();
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <SlCard>
        <div slot="header">Add account</div>
        <SlButtonGroup>
          <SlButton onClick={() => dispatch(generateAccount())}>
            Generate
          </SlButton>
          <SlButton onClick={() => setImportOpen(true)}>Import</SlButton>
        </SlButtonGroup>
      </SlCard>
      <ImportDialogue open={importOpen} setOpen={setImportOpen} />
    </>
  );
};
