import React from "react";
import "./App.css";
import { AccountList } from "./features/accounts/AccountList";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import { ContractList } from "./features/accounts/ContractList";
import { Console } from "./features/console/Console";
import { SlDivider } from "@shoelace-style/shoelace/dist/react";
import { Connection } from "./features/connection/Connection";
import { Configuration } from "./features/connection/Configuration";
import { Messages } from "./features/messages/Messages";
import { ExecuteOptions } from "./features/console/ExecuteOptions";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.64/dist/"
);
function App() {
  return (
    <div className="main">
      <aside className="sidebar">
        <h3 className="header">cøsmwasm devtøøls</h3>
        <div className="subhead">
          <a href="https://github.com">github</a> | <a href="#">donate</a>
        </div>
        <SlDivider />
        <div className="sidebar-main">
          <AccountList />
          <SlDivider />
          <ContractList />
        </div>
        <div className="connection">
          <Connection />
        </div>
      </aside>
      <section className="console">
        <Console />
      </section>
      <Configuration />
      <Messages />
      <ExecuteOptions />
    </div>
  );
}

export default App;
