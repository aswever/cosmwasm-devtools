import React, { FC, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    checkContract,
    contractAccounts,
    deleteAccount,
    selectContract,
} from "./accountsSlice";
import styles from "./ContractList.module.css";
import { AddContract } from "./AddContract";
import { AccountCard } from "./AccountCard";
import { Contract } from "../accounts/accountsSlice";

interface ContractProps {
    contract: Contract;
}

export const ContractDetails: FC<ContractProps> = ({ contract }) => {
    const dispatch = useAppDispatch();
    const selected = useAppSelector(
        (state) => state.accounts.currentContract === contract.address
    );
    const [lastTimestamp, setLastTimestamp] = useState<Map<string, number>>(
        new Map()
    );

    const check = useCallback(() => {
        const addr = contract.address;
        if (addr !== "") {
            const lastTs = lastTimestamp.get(addr);

            if (lastTs !== undefined) {
                if (Date.now() - lastTs <= 60000) {
                    return;
                }
            }

            updateTimestampMap(addr, Date.now());
            dispatch(checkContract(contract));
        }
    }, [contract]);

    const updateTimestampMap = (k: string, v: number) => {
        setLastTimestamp(new Map(lastTimestamp.set(k, v)));
    };

    return (
        <AccountCard
            label={contract.label || contract.address}
            account={contract}
            selected={selected}
            disabled={!contract.exists}
            onClick={() => dispatch(selectContract(contract.address))}
            onClickX={() => dispatch(deleteAccount(contract.address))}
            onConfigChange={check}
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
