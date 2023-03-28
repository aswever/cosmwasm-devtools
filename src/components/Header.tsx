import { useAppDispatch } from "../app/hooks";
import { setDonationOpen } from "../features/accounts/accountsSlice";
import styles from "./Header.module.css";

const GITHUB_URL = "https://github.com/aswever/cosmwasm-devtools";

export const Header = () => {
    const dispatch = useAppDispatch();
    return (
        <div className={`${styles.header} border border-bottom py-2`}>
            <span className={`${styles.name} text-lg w-full text-center m-auto block`}>cøsmwasm devtøøls</span>
            <div className={styles.subhead}>
                <a
                    className={styles.link}
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer"
                >
                    github
                </a>{" "}
                |{" "}
                <button
                    className={styles.link}
                    onClick={() => dispatch(setDonationOpen(true))}
                >
                    donate
                </button>
            </div>
        </div>
    );
};
