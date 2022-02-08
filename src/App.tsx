import React from "react";
import "./App.css";
import { AddAccount } from "./features/accounts/AddAccount";
import { AccountList } from "./features/accounts/AccountList";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.64/dist/"
);
function App() {
  return (
    <div>
      <nav>
        <h1>cosmwasm contract control panel</h1>
      </nav>
      <AddAccount />
      <AccountList />
    </div>
  );
}

export default App;
