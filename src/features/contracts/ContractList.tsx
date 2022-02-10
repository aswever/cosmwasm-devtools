import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { deleteContract, selectContract } from "./contractsSlice";
import styles from "./ContractList.module.css";
import { AddContract } from "./AddContract";
import { AddressBox } from "../../components/AddressBox";
import { Contract } from "../accounts/accountsSlice";

interface ContractProps {
  contract: Contract;
}

export const ContractDetails: FC<ContractProps> = ({ contract }) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (state) => state.contracts.currentContract === contract.address
  );

  return (
    <AddressBox
      label={contract.label || contract.address}
      account={contract}
      selected={selected}
      onClick={() => dispatch(selectContract(contract.address))}
      onClickX={() => dispatch(deleteContract(contract.address))}
    />
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
