import { SlCard } from "@shoelace-style/shoelace/dist/react";
import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectContract } from "./contractsSlice";
import styles from "./ContractList.module.css";
import { Contract } from "@cosmjs/cosmwasm-stargate";
import { AddContract } from "./AddContract";

const customColorOptions = {
  keyColor: "black",
  numberColor: "blue",
  stringColor: "#0B7500",
  trueColor: "#00cc00",
  falseColor: "#ff8080",
  nullColor: "cornflowerblue",
};

interface ContractProps {
  contract: Contract;
}

export const ContractDetails: FC<ContractProps> = ({ contract }) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (state) => state.contracts.currentContract === contract.address
  );

  const classes = [styles.address];
  if (selected) {
    classes.push(styles.selected);
  }
  return (
    <SlCard
      className={classes.join(" ")}
      onClick={() => dispatch(selectContract(contract.address))}
    >
      {contract.address}
    </SlCard>
  );
};

export const ContractList: FC = () => {
  const contracts = useAppSelector((state) => state.contracts.contractList);
  return (
    <div className={styles.section}>
      <div className={styles.header}>Contracts</div>
      {Object.values(contracts).map((contract) => (
        <ContractDetails key={contract.address} contract={contract} />
      ))}
      <AddContract />
    </div>
  );
};
