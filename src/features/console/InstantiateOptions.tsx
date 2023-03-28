import {
    SlButton,
    SlDialog,
    SlInput,
} from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./ExecuteOptions.module.css";
import { setInstantiateOpen, setInstantiateOptions } from "./consoleSlice";
import { fromMicroDenom } from "../../util/coins";
import {
    instantiateContract,
    selectedAccount,
} from "../accounts/accountsSlice";
import { useSelector } from "react-redux";

export const InstantiateOptions: FC = () => {
    const dispatch = useAppDispatch();
    const open = useAppSelector((state) => state.console.instantiateOpen);
    const config = useAppSelector((state) => state.connection.config);
    const [funds, setFunds] = useState<string | undefined>("");
    const [memo, setMemo] = useState<string | undefined>("");
    const [label, setLabel] = useState("");
    const [codeId, setCodeId] = useState("");
    const [admin, setAdmin] = useState<string | undefined>("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const account = useSelector(selectedAccount);

    useEffect(() => {
        if (!open) {
            clearForm();
        }
    }, [open]);

    const clearForm = () => {
        setFunds("");
        setMemo("");
        setLabel("");
        setCodeId("");
        setAdmin("");
        setErrors({});
    };

    const validateField = (val: string | undefined) => {
        if (val && val.length > 0) {
            return val;
        }
        return undefined;
    };

    function saveAndExecute() {
        setErrors({})
        if (!account) throw new Error("No account selected");

        let hasErrors = false;

        if (!codeId || codeId.length === 0) {
            setErrors((prev) => ({ ...prev, codeId: styles.error }));
            hasErrors = true;
        }

        if (!label || label.length === 0) {
            setErrors((prev) => ({ ...prev, label: styles.error }));
            hasErrors = true;
        }

        if (hasErrors) {
            throw new Error("Required fields are missing");
        }

        dispatch(setInstantiateOptions({ funds, memo, label, codeId, admin }));

        dispatch(
            instantiateContract({
                address: account.address,
                codeId: Number(codeId),
                label,
                memo: validateField(memo),
                admin: validateField(admin),
                funds: validateField(funds),
            })
        );
    }

    return (
        <SlDialog
            label="Instantiate"
            open={open}
            onSlRequestClose={() => dispatch(setInstantiateOpen(false))}
            onSlAfterHide={() => dispatch(setInstantiateOpen(false))}
            className={styles.dialog}
        >
            <div className={`${styles.form} gap-2`}>
                <SlInput
                    placeholder="Code ID *"
                    value={codeId}
                    className={`${styles["required-input"]} ${errors["codeId"]}`}
                    onSlChange={(e) =>
                        setCodeId((e.target as SlInputElement).value.trim())
                    }
                />
                <SlInput
                    placeholder="Label *"
                    value={label}
                    className={`${styles["required-input"]} ${errors["label"]}`}
                    onSlChange={(e) =>
                        setLabel((e.target as SlInputElement).value.trim())
                    }
                />
                <SlInput
                    placeholder="Admin (optional)"
                    value={admin}
                    onSlChange={(e) =>
                        setAdmin((e.target as SlInputElement).value.trim())
                    }
                />
                <SlInput
                    placeholder="Funds to send (optional)"
                    value={funds}
                    onSlChange={(e) =>
                        setFunds((e.target as SlInputElement).value.trim())
                    }
                >
                    <div slot="suffix">
                        {fromMicroDenom(config["microDenom"])}
                    </div>
                </SlInput>
                <SlInput
                    placeholder="Memo (optional)"
                    value={memo}
                    className={""}
                    onSlChange={(e) =>
                        setMemo((e.target as SlInputElement).value.trim())
                    }
                />
                <div className={`${styles.buttons} flex gap-4`}>
                    <SlButton variant="warning" onClick={() => clearForm()}>
                        Clear
                    </SlButton>
                    <SlButton
                        variant="success"
                        onClick={() => saveAndExecute()}
                        className="w-2/3"
                    >
                        Instantiate
                    </SlButton>
                </div>
            </div>
        </SlDialog>
    );
};
