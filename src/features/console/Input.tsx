import {
    SlButton,
    SlButtonGroup,
    SlDropdown,
    SlMenu,
    SlMenuItem,
} from "@shoelace-style/shoelace/dist/react";
import React, { FC, useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import formatHighlight from "json-format-highlight";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import styles from "./Input.module.css";
import {
    execute,
    prettifyInput,
    query,
    highlightColors,
    setOptionsOpen,
    sign,
} from "./consoleSlice";

import { buildQueryToolbox } from "./toolboxSlice";

import { AppThunk } from "../../app/store";

export const Input: FC = () => {
    const dispatch = useAppDispatch();
    const input = useAppSelector((state) => state.console.input);
    const [message, setMessage] = useState(input);
    const [lastContractSelected, setLastContractSelected] = useState<
        string | undefined
    >(undefined);
    const selected = useAppSelector((state) => state.accounts.currentContract);

    useEffect(() => {
        setMessage(input);
    }, [input]);

    function run(action: AppThunk<void>) {
        dispatch(prettifyInput(message));
        dispatch(action);
    }

    useEffect(() => {
        if (selected !== lastContractSelected) {
            setLastContractSelected(selected);
            dispatch(buildQueryToolbox());
        }
    }, [lastContractSelected, selected]);

    return (
        <div className={`${styles.input} flex flex-col`}>
            <div
                style={{
                    height: "64px",
                    borderBottom: "solid",
                    padding: "6px",
                    borderBottomWidth: "1px",
                }}
                className="flex-none"
            >
                <div>
                    <span>Contract Toolbox</span>
                </div>
            </div>
            <div className="grow h-full">
            <Editor
                className={`${styles.editor}`}
                highlight={(code) => formatHighlight(code, highlightColors)}
                placeholder="Enter JSON message"
                value={message}
                padding={10}
                onValueChange={(code) => setMessage(code)}
            />
            </div>
            <div className={`${styles.controls} flex-none`}>
                <SlButtonGroup className={styles.buttons}>
                    <SlButton onClick={() => dispatch(prettifyInput(message))}>
                        Format
                    </SlButton>
                    <SlButton onClick={() => run(query())}>Query</SlButton>
                    <SlButton onClick={() => run(execute())}>Execute</SlButton>
                    <SlDropdown>
                        <SlButton slot="trigger" caret></SlButton>
                        <SlMenu>
                            <SlMenuItem onClick={() => run(sign())}>
                                Sign
                            </SlMenuItem>
                            <SlMenuItem
                                onClick={() => dispatch(setOptionsOpen(true))}
                            >
                                Execute with...
                            </SlMenuItem>
                        </SlMenu>
                    </SlDropdown>
                </SlButtonGroup>
            </div>
        </div>
    );
};
