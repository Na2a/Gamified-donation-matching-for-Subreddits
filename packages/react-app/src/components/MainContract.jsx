import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card } from "antd";
import { useContractLoader, useContractExistsAtAddress, useContractReader, useCustomContractLoader } from "../hooks";
import Account from "./Account";
import DisplayVariable from "./Contract/DisplayVariable";
import FunctionForm from "./Contract/FunctionForm";
import Address from "./Address";
import { Row, Col, Divider, Skeleton, Button } from "antd";
import { Transactor } from "../helpers";
import tryToDisplay from "./Contract/utils";
import { formatUnits } from "@ethersproject/units";
import Popup from "reactjs-popup";
import Project from "./Project";
import AddProject from "./AddProject";

const noContractDisplay = (
  <div>
    Loading...{" "}
    <div style={{ padding: 32 }}>
      You need to run{" "}
      <span style={{ marginLeft: 4, backgroundColor: "#f1f1f1", padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
        yarn run chain
      </span>{" "}
      and{" "}
      <span style={{ marginLeft: 4, backgroundColor: "#f1f1f1", padding: 4, borderRadius: 4, fontWeight: "bolder" }}>
        yarn run deploy
      </span>{" "}
      to see your contract here.
    </div>
  </div>
);

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

export default function MainContract({ account, gasPrice, provider, price, getFromIPFS, addToIPFS }) {
  const contracts = useContractLoader(provider);
  const contract = contracts ? contracts["MainContract"] : "";
  const address = contract ? contract.address : "";
  const contractIsDeployed = useContractExistsAtAddress(provider, address);
  const tx = Transactor(provider, gasPrice);

  const ownerAddress = useContractReader(contracts, "MainContract", "owner", 1777);
  const tokenAddress = useContractReader(contracts, "MainContract", "tokenAddress", 1777);
  const numberOfProjects = useContractReader(contracts, "MainContract", "numberOfProjects", 1777);
  const totalEth = useContractReader(contracts, "MainContract", "totalEth", 1777);
  const totalTokens = useContractReader(contracts, "MainContract", "totalTokens", 1777);

  const [projects, setProjects] = useState();

  const refreshProjects = useCallback(async () => {
    try {
      let np = projects ? projects.slice() : [];
      for (let i = projects ? projects.length : 0; i < numberOfProjects; i++)
        np.push(await contract.getProjectInfoById(i));
      setProjects(np);
    } catch (e) {
      console.log(e);
    }
  }, [numberOfProjects]);

  const refreshProject = async (id) => {
    let np = projects.slice();
    np[id] = await contract.getProjectInfoById(id);
    setProjects(np);
  };

  useEffect(() => {
    refreshProjects();
  }, [numberOfProjects]);

  const contractDisplay = useMemo(() => {
    if (contract) {
        return (
          <div>
            <Row>
              <Col
                span={8}
                style={{
                  textAlign: "right",
                  opacity: 0.333,
                  paddingRight: 6,
                  fontSize: 24,
                }}
              >
                {"Owner"}
              </Col>
              <Col span={14}>
                <Address value={ownerAddress} onChange={async (x)=>{
                  await tx(contract["setOwner"](x, {}));
                }}/>
              </Col>
            </Row>
            <Divider />

            <Row>
              <Col
                span={8}
                style={{
                  textAlign: "right",
                  opacity: 0.333,
                  paddingRight: 6,
                  fontSize: 24,
                }}
              >
                {"Token address"}
              </Col>
              <Col span={14}>
                <Address value={tokenAddress} onChange={async (x)=>{
                  await tx(contract["setTokenAddress"](x, {}));
                }}/>
              </Col>
            </Row>
            <Divider />

            <Row>
              <Col
                span={8}
                style={{
                  textAlign: "right",
                  opacity: 0.333,
                  paddingRight: 6,
                  fontSize: 24,
                }}
              >
                {"Total ETH donated"}
              </Col>
              <Col span={14} style={{fontSize: 24}}>
                {totalEth ? formatUnits(totalEth, "ether") : "..."}
              </Col>
            </Row>
            <Divider />

            <Row>
              <Col
                span={8}
                style={{
                  textAlign: "right",
                  opacity: 0.333,
                  paddingRight: 6,
                  fontSize: 24,
                }}
              >
                {"Total TOKENS donated"}
              </Col>
              <Col span={14} style={{fontSize: 24}}>
                {totalTokens ? formatUnits(totalTokens, "ether")  : "..."}
              </Col>
            </Row>
            <Divider />

            {[...Array(numberOfProjects).keys()].map(id =>
              <Project
                contract={contract}
                id={id}
                gasPrice={gasPrice}
                provider={provider}
                mainContractAddress={address}
                tokenContractAddress={tokenAddress}
                getFromIPFS={getFromIPFS}
              />
            )}

            <AddProject provider={provider} contract={contract} gasPrice={gasPrice} addToIPFS={addToIPFS}/>

          </div>
        )
    }
    return <div />;
  }, [contract, gasPrice, provider, ownerAddress, tokenAddress, numberOfProjects, projects, totalEth, totalTokens]);

  return (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card
        title={
          <div>
            {"MainContract"}
            <div style={{ float: "right" }}>
              <Account
                address={address}
                localProvider={provider}
                injectedProvider={provider}
                mainnetProvider={provider}
                price={price}
              />
              {account}
            </div>
          </div>
        }
        size="large"
        style={{ marginTop: 25, width: "100%" }}
        loading={contractDisplay && contractDisplay.length <= 0}
      >
        {contractIsDeployed ? contractDisplay : noContractDisplay}
      </Card>
    </div>
  );
}