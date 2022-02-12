import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC, useEffect } from "react";
import styles from "./Connection.module.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  checkConnection,
  ConnectionStatus,
  setConfigModalOpen,
} from "./connectionSlice";

export const Connection: FC = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.connection.config);
  const connection = useAppSelector((state) => state.connection.status);
  const chainName: string = config["chainName"];

  useEffect(() => {
    dispatch(checkConnection());
  }, [dispatch]);

  const classes = [styles.connection, styles[`state-${connection}`]].join(" ");

  return (
    <SlCard className={classes}>
      <SlIcon
        name={
          connection === ConnectionStatus.Connected
            ? "lightning-charge"
            : connection === ConnectionStatus.Error
            ? "exclamation-octagon"
            : "asterisk"
        }
        className={styles.stateIcon}
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
