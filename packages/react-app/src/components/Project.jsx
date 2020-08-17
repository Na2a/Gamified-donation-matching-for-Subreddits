import React, { useState, useEffect } from "react";
import Donate from "./Donate";
import Address from "./Address";
import { Row, Col, Divider, Skeleton } from "antd";
import { formatUnits } from "@ethersproject/units";

export default function Project({contract, id, gasPrice, provider, mainContractAddress, tokenContractAddress, getFromIPFS}) {

  const [project, setProject] = useState();
  const [img, setImg] = useState();
  const [description, setDescription] = useState();

  const refreshProject = async () => {
    const cp = await contract.getProjectInfoById(id);
    setProject(cp);
    const data = await getFromIPFS(cp[1]);
    console.log("getFromIPFS ", data);
    const result = JSON.parse(data.toString());
    setImg(result.img);
    setDescription(result.description);
  };

  useEffect(() => {
    refreshProject()
  }, [contract, id]);

  if (!project)
    return <div/>

  return (
    <Row>
      <Col
        span={8}
        style={{
          textAlign: "right",
          paddingRight: 6,
          fontSize: 24,
        }}
      >
        <img
          src={img ? img : "https://www.cowgirlcontractcleaning.com/wp-content/uploads/sites/360/2018/05/placeholder-img.jpg"}
          style={{opacity: "100%", width: "400px", height: "300px"}}
        />
      </Col>
      <Col span={16} style={{
        textAlign: "left",
        paddingLeft: "20px",
        fontSize: 20,
      }}>
          <Row>
            <Col span={8}><h2>{project[0]}</h2></Col>
            <Col span={16} style={{textAlign: "right"}}><h3>by <Address noEns value={project[2]}/></h3></Col>
          </Row>
          <h3>{description}</h3>
          <h4>
            <b>Donated: </b> {formatUnits(project[3], "ether")} tokens & {formatUnits(project[4], "ether")} ether{' '}
            <a href="#" onClick={() => {refreshProject(id)}}>
               🔄
            </a>
          </h4>
          <h4>
            <b>Contributors: </b> {project[5]}
          </h4>
          <Donate name={project[0]} id={id} gasPrice={gasPrice} provider={provider} mainContractAddress={mainContractAddress} tokenContractAddress={tokenContractAddress}/>
      </Col>
      <Divider/>
    </Row>
  );
}
