import {
    SlButton,
    SlButtonGroup,
    SlDropdown,
    SlMenu,
    SlMenuItem,
} from "@shoelace-style/shoelace/dist/react";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
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

import {
    buildQueryToolbox,
    resetState,
    setToolboxQueryOptions,
    setToolboxQueryProcessing,
    setToolboxQueryReady,
    toolboxQuery,
} from "./toolboxSlice";

import { AppThunk } from "../../app/store";

export const Input: FC = () => {
    const dispatch = useAppDispatch();
    const input = useAppSelector((state) => state.console.input);
    const [message, setMessage] = useState(input);
    //const [toolboxQueryExecuted, setToolboxQueryExecuted] = useState(false);
    const queryReady = useRef(false);
    const toolboxQueryExecutedRef = useRef(false);
    const toolboxQueryBuiltRef = useRef(false);
    //const [toolboxQueryBuilt, setToolboxQueryBuilt] = useState(false);
    const [lastContractSelected, setLastContractSelected] = useState<
        string | undefined
    >(undefined);
    const selected = useAppSelector((state) => state.accounts.currentContract);
    const stateReset = useAppSelector((state) => state.toolbox.stateReset);
    const toolboxQueryProcessing = useAppSelector(
        (state) => state.toolbox.toolboxQueryProcessing
    );
    const toolboxQueryReady = useAppSelector(
        (state) => state.toolbox.toolboxQueryReady
    );
    const toolboxQueryOptions = useAppSelector(
        (state) => state.toolbox.toolboxQueryOptions
    );
    const toolboxQueryCtr = useAppSelector(
        (state) => state.toolbox.toolboxQueryCtr
    );

    useEffect(() => {
        setMessage(input);
    }, [input]);

    function run(action: AppThunk<void>) {
        dispatch(prettifyInput(message));
        dispatch(action);
    }

    useEffect(() => {
        dispatch(setToolboxQueryProcessing(false));
        dispatch(setToolboxQueryReady(false));
        toolboxQueryExecutedRef.current = false;
        toolboxQueryBuiltRef.current = false;
        queryReady.current = true;
    }, []);

    useEffect(() => {
        if (selected !== lastContractSelected) {
            queryReady.current = false;
            toolboxQueryExecutedRef.current = false;
            toolboxQueryBuiltRef.current = false;

            setLastContractSelected(selected);
            dispatch(resetState());
        }
    }, [dispatch, lastContractSelected, selected]);

    useEffect(() => {
        if (stateReset) {
            queryReady.current = true;
            dispatch(buildQueryToolbox());
        }
    }, [stateReset]);

    useEffect(() => {
        if (
            queryReady.current &&
            toolboxQueryProcessing &&
            toolboxQueryOptions &&
            Object.keys(toolboxQueryOptions).length > 0 &&
            !toolboxQueryExecutedRef.current
        ) {
            toolboxQueryExecutedRef.current = true;

            for (let i = 0; i < Object.keys(toolboxQueryOptions).length; i++) {
                let isLastOperation =
                    i === Object.keys(toolboxQueryOptions).length - 1;

                let obj = Object.keys(toolboxQueryOptions)[i];
                dispatch(toolboxQuery(obj, isLastOperation));

                if (isLastOperation) {
                    toolboxQueryBuiltRef.current = true;
                }
            }

            //setToolboxQueryBuilt(true);
        }
    }, [
        toolboxQueryProcessing,
        toolboxQueryOptions,
        //toolboxQueryExecuted,
        dispatch,
    ]);

    useMemo(() => {
        if (
            toolboxQueryReady &&
            toolboxQueryOptions &&
            Object.keys(toolboxQueryOptions).length > 0 &&
            toolboxQueryExecutedRef.current &&
            toolboxQueryBuiltRef.current &&
            toolboxQueryCtr
        ) {
            console.log(toolboxQueryOptions);
            for (const [key, value] of Object.entries(toolboxQueryOptions)) {
            }
        }
    }, [
        toolboxQueryReady,
        toolboxQueryOptions,
        //toolboxQueryExecuted,
        //toolboxQueryBuilt,
        toolboxQueryCtr,
    ]);

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
