import {
    SlButton,
    SlButtonGroup,
    SlDropdown,
    SlMenu,
    SlMenuItem,
} from "@shoelace-style/shoelace/dist/react";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
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
    setInstantiateOpen,
} from "./consoleSlice";

import {
    buildExecuteToolbox,
    buildQueryToolbox,
    resetState,
    toolboxExecute,
    toolboxQuery,
} from "./toolboxSlice";

import { AppThunk } from "../../app/store";

import { Accordion, AccordionTab } from "primereact/accordion";
import { Dropdown } from "primereact/dropdown";
import { Tooltip } from "primereact/tooltip";

interface IDropdownOption {
    name: string;
    code: string;
}

export const Input: FC = () => {
    const dispatch = useAppDispatch();
    const input = useAppSelector((state) => state.console.input);
    const [message, setMessage] = useState(input);

    const currentAccount = useAppSelector(
        (state) => state.accounts.currentAccount
    );

    const [lastContractSelected, setLastContractSelected] = useState<
        string | undefined
    >(undefined);

    const [lineNumbers, setLineNumbers] = useState<JSX.Element[]>([]);

    // used when a user switches contracts. will requery the selected contract
    const selected = useAppSelector((state) => state.accounts.currentContract);
    const stateReset = useAppSelector((state) => state.toolbox.stateReset);
    const forceRefresh = useAppSelector(
        (state) => state.connection.forceRefresh
    );

    // query processing handlers
    // refs so we dont get in a rerender loop
    const queryReady = useRef(false);
    const toolboxQueryExecutedRef = useRef(false);
    const toolboxQueryBuiltRef = useRef(false);

    const toolboxQueryProcessing = useAppSelector(
        (state) => state.toolbox.toolboxQueryProcessing
    );
    const toolboxQueryReady = useAppSelector(
        (state) => state.toolbox.toolboxQueryReady
    );
    const toolboxQueryOptions = useAppSelector(
        (state) => state.toolbox.toolboxQueryOptions
    );

    // execute processing handlers
    // refs so we dont get in a rerender loop
    const executeReady = useRef(false);
    const toolboxExecuteExecutedRef = useRef(false);
    const toolboxExecuteBuiltRef = useRef(false);

    const toolboxExecuteProcessing = useAppSelector(
        (state) => state.toolbox.toolboxExecuteProcessing
    );
    const toolboxExecuteReady = useAppSelector(
        (state) => state.toolbox.toolboxExecuteReady
    );
    const toolboxExecuteOptions = useAppSelector(
        (state) => state.toolbox.toolboxExecuteOptions
    );

    // final "cards" that are built
    const [queryCards, setQueryCards] = useState<IDropdownOption[]>([]);
    const [executeCards, setExecuteCards] = useState<IDropdownOption[]>([]);

    useEffect(() => {
        setMessage(input);
    }, [input]);

    function run(action: AppThunk<void>) {
        dispatch(prettifyInput(message));
        dispatch(action);
    }

    // resets toolbox states upon loading the page
    useEffect(() => {
        dispatch(resetState());
        toolboxQueryExecutedRef.current = false;
        toolboxQueryBuiltRef.current = false;
        queryReady.current = true;

        toolboxExecuteExecutedRef.current = false;
        toolboxExecuteBuiltRef.current = false;
        executeReady.current = true;
    }, []);

    // when a contract is switched, we'll reset state
    useEffect(() => {
        if (selected !== lastContractSelected) {
            queryReady.current = false;
            toolboxQueryExecutedRef.current = false;
            toolboxQueryBuiltRef.current = false;

            executeReady.current = false;
            toolboxExecuteExecutedRef.current = false;
            toolboxExecuteBuiltRef.current = false;

            setLastContractSelected(selected);
            dispatch(resetState());
            rebuildToolbox();
        }
    }, [dispatch, lastContractSelected, selected]);

    // if stateReset is detected, we'll rebuild the toolbox
    useEffect(() => {
        if (stateReset) {
            dispatch(resetState());
            rebuildToolbox();
        }
    }, [stateReset]);

    useEffect(() => {
        if (forceRefresh) {
            dispatch(resetState());
            setQueryCards([]);
            setExecuteCards([]);
            if (selected) {
                console.log("forceRefresh");
                rebuildToolbox();
            }
        }
    }, [forceRefresh, selected]);

    const rebuildToolbox = () => {
        setQueryCards([]);
        setExecuteCards([]);
        queryReady.current = true;
        dispatch(buildQueryToolbox());

        executeReady.current = true;
        dispatch(buildExecuteToolbox());
    };

    // this hook will iterate through the available options and then populate parameters
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
        }
    }, [toolboxQueryProcessing, toolboxQueryOptions, dispatch]);

    // this hook builds the dropdown options
    useEffect(() => {
        if (
            toolboxQueryReady &&
            toolboxQueryOptions &&
            Object.keys(toolboxQueryOptions).length > 0 &&
            toolboxQueryExecutedRef.current &&
            toolboxQueryBuiltRef.current
        ) {
            let qCards: IDropdownOption[] = [];

            let keys = Object.keys(toolboxQueryOptions).sort();

            for (const key of keys) {
                qCards.push({ name: key, code: key } as IDropdownOption);
            }

            setQueryCards(qCards);
        }
    }, [toolboxQueryReady, toolboxQueryOptions]);

    // this hook will iterate through the available options and then populate parameters
    useEffect(() => {
        if (
            executeReady.current &&
            toolboxExecuteProcessing &&
            toolboxExecuteOptions &&
            Object.keys(toolboxExecuteOptions).length > 0 &&
            !toolboxExecuteExecutedRef.current
        ) {
            toolboxExecuteExecutedRef.current = true;

            for (
                let i = 0;
                i < Object.keys(toolboxExecuteOptions).length;
                i++
            ) {
                let isLastOperation =
                    i === Object.keys(toolboxExecuteOptions).length - 1;

                let obj = Object.keys(toolboxExecuteOptions)[i];
                dispatch(toolboxExecute(obj, isLastOperation));

                if (isLastOperation) {
                    toolboxExecuteBuiltRef.current = true;
                }
            }
        }
    }, [toolboxExecuteProcessing, toolboxExecuteOptions, dispatch]);

    // this hook builds the dropdown options
    useEffect(() => {
        if (
            toolboxExecuteReady &&
            toolboxExecuteOptions &&
            Object.keys(toolboxExecuteOptions).length > 0 &&
            toolboxExecuteExecutedRef.current &&
            toolboxExecuteBuiltRef.current
        ) {
            let eCards: IDropdownOption[] = [];

            let keys = Object.keys(toolboxExecuteOptions).sort();

            for (const key of keys) {
                eCards.push({ name: key, code: key } as IDropdownOption);
            }

            setExecuteCards(eCards);
        }
    }, [toolboxExecuteReady, toolboxExecuteOptions]);

    // if a user selects an option, we'll populate the input
    const setSelectedCard = (selectType: string, opt: IDropdownOption) => {
        let options:
            | {
                  [key: string]: {
                      [key: string]: {};
                  };
              }
            | undefined = undefined;

        if (selectType === "q") {
            options = toolboxQueryOptions[opt.name];
        } else if (selectType === "e") {
            options = toolboxExecuteOptions[opt.name];
        }

        if (options !== undefined) {
            let newInput = `{"${opt.name}": ${JSON.stringify(options)}}`;
            dispatch(prettifyInput(newInput));
            try {
                // just in case this fails, just let it error into void
                editorValueChange(
                    JSON.stringify(JSON.parse(newInput), null, 2)
                );
            } catch (e) {}
        }
    };

    const editorValueChange = (code: string) => {
        setMessage(code);
        dispatch(prettifyInput(code));

        let i = 1;
        let count = code.split("\n").length + 1;

        let _lineNumbers: JSX.Element[] = [];

        while (i < count) {
            _lineNumbers.push(
                <div key={i + 1} className="w-full">
                    <span
                        style={{ width: "80%" }}
                        className="text-slate-500 block mx-auto text-right"
                    >
                        {i}
                    </span>
                </div>
            );
            i++;
        }

        setLineNumbers(_lineNumbers);
    };

    useLayoutEffect(() => {
        editorValueChange(message);
    }, []);

    return (
        <div className={`${styles.input} h-max flex flex-col`}>
            <div
                style={{
                    borderBottom: "solid",
                    padding: "6px",
                    borderBottomWidth: "1px",
                    borderBottomColor: "#ccc",
                }}
                className="flex-none"
            >
                <div>
                    <span className="text-lg font-bold">Contract Toolbox</span>
                    <Accordion>
                        <AccordionTab header="How does this work?">
                            <p className="m-0">
                                The "toolbox" does a few queries against the selected contract to build the toolbox.  
                                The helpers also add in optional parameters without types, so the bulk of the work will 
                                be up to your understanding of the contract you're trying to interact with
                            </p>
                        </AccordionTab>
                    </Accordion>
                </div>
                <div className="flex flex-row gap-4 py-2">
                    <Dropdown
                        onChange={(e) => setSelectedCard("q", e.value)}
                        options={queryCards}
                        optionLabel="name"
                        placeholder="Query Helper"
                        className="w-full"
                        scrollHeight={"600px"}
                    />
                    <Dropdown
                        onChange={(e) => setSelectedCard("e", e.value)}
                        options={executeCards}
                        optionLabel="name"
                        placeholder="Execute Helper"
                        className="w-full"
                        scrollHeight={"600px"}
                    />
                </div>
            </div>
            <div className="grow h-max flex flex-row">
                <div className="h-max w-[2em] py-[10px]">
                    <span>{lineNumbers}</span>
                </div>
                <Editor
                    className={`${styles.editor}`}
                    highlight={(code) => formatHighlight(code, highlightColors)}
                    placeholder="Enter JSON message"
                    value={message}
                    padding={10}
                    onValueChange={(code) => editorValueChange(code)}
                    //onValueChange={(code) => setMessage(code)}
                />
            </div>
            <div className={`${styles.controls} flex-none`}>
                <SlButtonGroup className={styles.buttons}>
                    <Tooltip target="#tt_id_1" />
                    <Tooltip target="#tt_id_2" />
                    <Tooltip target="#tt_id_3" />
                    <SlButton
                        id={"tt_id_1"}
                        data-pr-tooltip="Formats JSON in the editor"
                        data-pr-position="top"
                        onClick={() => dispatch(prettifyInput(message))}
                    >
                        Format
                    </SlButton>
                    <SlButton
                        id={"tt_id_2"}
                        data-pr-tooltip="Queries data against chosen contract"
                        data-pr-position="top"
                        onClick={() => run(query())}
                    >
                        Query
                    </SlButton>
                    <SlButton
                        id={"tt_id_3"}
                        data-pr-tooltip="Must be connected. Will pop up the Keplr modal to interact with a contract"
                        data-pr-position="top"
                        onClick={() => run(execute())}
                        disabled={currentAccount === undefined}
                    >
                        Execute
                    </SlButton>
                    <SlDropdown>
                        <SlButton slot="trigger" caret></SlButton>
                        <SlMenu>
                            <SlMenuItem
                                onClick={() => {
                                    if (currentAccount !== undefined) {
                                        dispatch(setInstantiateOpen(true));
                                    }
                                }}
                                disabled={currentAccount === undefined}
                            >
                                Instantiate
                            </SlMenuItem>
                            <SlMenuItem
                                onClick={() => {
                                    if (currentAccount !== undefined) {
                                        run(sign());
                                    }
                                }}
                                disabled={currentAccount === undefined}
                            >
                                Sign
                            </SlMenuItem>
                            <SlMenuItem
                                onClick={() => {
                                    if (currentAccount !== undefined) {
                                        dispatch(setOptionsOpen(true));
                                    }
                                }}
                                disabled={currentAccount === undefined}
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
