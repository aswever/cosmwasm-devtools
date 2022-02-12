import {
  SlButton,
  SlDialog,
  SlInput,
  SlMenuItem,
  SlSelect,
} from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import type SlSelectElement from "@shoelace-style/shoelace/dist/components/select/select";
import React, { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./Configuration.module.css";
import {
  checkConnection,
  setConnectionConfig,
  setConfigModalOpen,
} from "./connectionSlice";
import presets from "./presets.json";

// add basic validation
const config = {
  chainName: {
    label: "Chain name",
  },
  chainId: {
    label: "Chain ID",
  },
  rpcEndpoint: {
    label: "RPC endpoint",
  },
  restEndpoint: {
    label: "REST endpoint",
  },
  faucetEndpoint: {
    label: "Faucet endpoint",
  },
  addressPrefix: {
    label: "Address prefix",
  },
  microDenom: {
    label: "Micro denom",
  },
  coinDecimals: {
    label: "Coin decimals",
  },
  gasPrice: {
    label: "Gas price",
  },
};

export const Configuration: FC = () => {
  const open = useAppSelector((state) => state.connection.modalOpen);
  const entries = useAppSelector((state) => state.connection.config);
  const dispatch = useAppDispatch();
  const [localEntries, setLocalEntries] = useState(entries);
  const [preset, setPreset] = useState<keyof typeof presets>();

  useEffect(() => {
    setLocalEntries(entries);
  }, [entries]);

  useEffect(() => {
    if (preset) setLocalEntries(presets[preset]);
  }, [preset]);

  function close(event: Event) {
    if (
      localEntries === entries ||
      window.confirm("Are you sure you want to discard your changes?")
    ) {
      if (localEntries !== entries) setLocalEntries(entries);
      dispatch(setConfigModalOpen(false));
    } else {
      event.preventDefault();
    }
  }

  function save() {
    dispatch(setConnectionConfig(localEntries));
    dispatch(setConfigModalOpen(false));
    dispatch(checkConnection({ testing: true }));
  }

  function setEntry(key: string, value: string) {
    setPreset(undefined);
    setLocalEntries({ ...localEntries, [key]: value });
  }

  return (
    <SlDialog
      open={open}
      onSlRequestClose={(event) => close(event)}
      className={styles.dialog}
    >
      <div slot="label" className={styles.header}>
        <div className={styles.title}>Network configuration</div>
        <div className={styles.loadPreset}>
          <SlSelect
            placeholder="Load preset"
            value={preset}
            hoist={true}
            onSlChange={(e) =>
              setPreset(
                (e.target as SlSelectElement).value as keyof typeof preset
              )
            }
          >
            {Object.entries(presets).map(([id, { chainName }]) => (
              <SlMenuItem key={id} value={id}>
                {chainName}
              </SlMenuItem>
            ))}
          </SlSelect>
        </div>
      </div>
      <div className={styles.form}>
        {Object.entries(config).map(([key, { label }]) => (
          <SlInput
            key={key}
            label={label}
            value={localEntries[key] ?? ""}
            className={styles.label}
            onSlChange={(e) =>
              setEntry(key, (e.target as SlInputElement).value)
            }
          />
        ))}
        <SlButton
          className={styles.importButton}
          onClick={() => save()}
          variant="neutral"
        >
          Save & Connect
        </SlButton>
      </div>
    </SlDialog>
  );
};
