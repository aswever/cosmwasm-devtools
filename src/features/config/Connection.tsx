import { SlCard, SlIcon } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import styles from "./Connection.module.css";
import { configService } from "../../services/Config";
import { useAppDispatch } from "../../app/hooks";
import { setConfigModalOpen } from "./configSlice";

export const Connection: FC = () => {
  const dispatch = useAppDispatch();
  const chainName: string = configService.get("chainName");

  return (
    <SlCard className={styles.adder}>
      <SlIcon name="lightning-charge" className={styles.connection} />
      <div className={styles.chainName}>{chainName}</div>
      <SlIcon
        name="gear"
        className={styles.settings}
        onClick={() => dispatch(setConfigModalOpen(true))}
      />
    </SlCard>
  );
};
