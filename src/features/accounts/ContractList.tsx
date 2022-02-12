import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  contractAccounts,
  deleteAccount,
  selectContract,
} from "./accountsSlice";
import styles from "./ContractList.module.css";
import { AddContract } from "./AddContract";
import { AccountCard } from "../../components/AccountCard";
import { Contract } from "../accounts/accountsSlice";

interface ContractProps {
  contract: Contract;
}

export const ContractDetails: FC<ContractProps> = ({ contract }) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (state) => state.accounts.currentContract === contract.address
  );

  return (
    <AccountCard
      label={contract.label || contract.address}
      account={contract}
      selected={selected}
      onClick={() => dispatch(selectContract(contract.address))}
      onClickX={() => dispatch(deleteAccount(contract.address))}
    />
  );
};

export const ContractList: FC = () => {
  const contracts = useAppSelector(contractAccounts);
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
