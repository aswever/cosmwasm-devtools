import { SlButton, SlCard, SlInput } from "@shoelace-style/shoelace/dist/react";
import type SlInputElement from "@shoelace-style/shoelace/dist/components/input/input";
import React, { FC, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { addContract } from "./contractsSlice";

export const AddContract: FC = () => {
  const dispatch = useAppDispatch();
  const [address, setAddress] = useState("");

  return (
    <>
      <SlCard>
        <div slot="header">Add contract</div>
        <SlInput
          placeholder="Address"
          value={address}
          onSlChange={(e) =>
            setAddress((e.target as SlInputElement).value.trim())
          }
        />
        <SlButton onClick={() => dispatch(addContract(address))}>Add</SlButton>
      </SlCard>
    </>
  );
};
