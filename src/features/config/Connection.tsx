import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useCallback, useEffect, useState } from "react";
import styles from "./Connection.module.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setConfigModalOpen } from "./configSlice";
import { getClient } from "../../services/getClient";
import { pushMessage } from "../messages/messagesSlice";

export const Connection: FC = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.config.entries);
  const chainName: string = config["chainName"];
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    console.log("config changed");
  }, [config]);

  const testConnection = useCallback(async () => {
    try {
      const client = await getClient(null, config, true);
      console.log(client);
      setConnected(true);
      setError(false);
    } catch (e) {
      console.error(e);
      setConnected(false);
      setError(true);
      dispatch(pushMessage({ level: "danger", message: "Connection failed" }));
    }
  }, [config, dispatch]);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return (
    <SlCard className={styles.adder}>
      <SlIcon
        name={
          connected
            ? "lightning-charge"
            : error
            ? "exclamation-octagon"
            : "asterisk"
        }
        className={styles.connection}
      />
      <div className={styles.chainName}>{chainName}</div>
      <SlIcon
        name="gear"
        className={styles.settings}
        onClick={() => dispatch(setConfigModalOpen(true))}
      />
    </SlCard>
  );
};
