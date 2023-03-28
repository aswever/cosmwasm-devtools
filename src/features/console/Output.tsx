import { FC, useMemo } from "react";
import { useAppSelector } from "../../app/hooks";
import styles from "./Output.module.css";
import ReactJson from "react-json-view";

export const Output: FC = () => {
    const output = useAppSelector((state) => state.console.output);
    const outputObject = useMemo(() => {
        try {
            return JSON.parse(output);
        } catch (_) {
            return;
        }
    }, [output]);

    const errorOutput = useAppSelector((state) => state.console.errorOutput);

    return (
        <div className="flex flex-col h-max">
            {errorOutput && (
                <div
                    className={`${styles.error} p-4 flex-none border border-bottom`}
                >
                    <div className="pb-2">JSON Format issues:</div>
                    <pre dangerouslySetInnerHTML={{ __html: errorOutput }} />
                </div>
            )}
            <div className={`${styles.output} grow`}>
                {outputObject ? (
                    <ReactJson
                        src={outputObject}
                        indentWidth={2}
                        quotesOnKeys={false}
                    />
                ) : (
                    <pre dangerouslySetInnerHTML={{ __html: output }} />
                )}
            </div>
        </div>
    );
};
