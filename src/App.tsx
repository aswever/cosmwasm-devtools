import React from "react";
import "./App.css";
import { AddAccount } from "./features/accounts/AddAccount";
import { AccountList } from "./features/accounts/AccountList";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import { AddContract } from "./features/contracts/AddContract";
import { ContractList } from "./features/contracts/ContractList";
import { Console } from "./features/console/Console";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.64/dist/"
);
function App() {
  return (
    <div className="main">
      <aside className="sidebar">
        <AccountList />
        <ContractList />
      </aside>
      <section className="console">
        <Console />
      </section>
    </div>
  );
}

export default App;
