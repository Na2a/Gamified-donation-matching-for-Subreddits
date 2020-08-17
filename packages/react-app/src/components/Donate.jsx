import React, { useState } from "react";
import Popup from "reactjs-popup";
import { useContractExistsAtAddress, useCustomContractLoader } from "../hooks";
import { Transactor } from "../helpers";
import { parseUnits } from "@ethersproject/units";

export default function Donate({name, id, provider, gasPrice, mainContractAddress, tokenContractAddress}) {
  const tx = Transactor(provider, gasPrice);

  const tokenContract = useCustomContractLoader(provider, "ERC677", tokenContractAddress);
  const doesExist = useContractExistsAtAddress(provider, tokenContractAddress);

  const [status, setStatus] = useState("...");
  const [inputAmount, setInputAmount] = useState(0);

  const renderValue = (<Popup trigger={<button>Donate</button>} modal closeOnDocumentClick position="right center">
    <div style={{padding: "10px"}}>
      <h2>Donate to {name}</h2>
      <input type="number" step="0.1" value={inputAmount} onChange={(event)=>{setInputAmount(event.target.value)}}/>
      <button onClick={async () => {

        var hex = id.toString(16);
        while (hex.length < 8) hex = "0" + hex;
        hex = "0x" + hex;

        const returned = await tx(tokenContract["transferAndCall"](mainContractAddress, parseUnits(inputAmount, "ether"), hex));

        setStatus(JSON.stringify(returned));

      }}>Donate</button>
      <br/>
      {status}
    </div>
  </Popup>);

  return doesExist ? renderValue : (<div>Not deployed {tokenContractAddress}</div>);
}
