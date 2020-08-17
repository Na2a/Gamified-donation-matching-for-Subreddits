import React, { useState } from "react";
import { Input, Button } from "antd";
import { Transactor } from "../helpers";
import Popup from "reactjs-popup";

export default function AddProject({contract, provider, gasPrice, addToIPFS}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [img, setImg] = useState();

  const tx = Transactor(provider, gasPrice);

  const handleClick = async () => {
    const data = JSON.stringify({
      title: title,
      description: description,
      img: img
    });
    const result = await addToIPFS(data);
    if (result && result.path) {
      console.log(result.path);
      await tx(contract["addProject"](title, result.path));
    }
  };

  const readFileDataAsBase64 = (e) => {
    const file = e.target.files[0];

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (err) => {
            reject(err);
        };

        reader.readAsDataURL(file);
    });
  }

  return (
    <Popup trigger={<Button style={{width: "100%"}}>Add project</Button>} modal closeOnDocumentClick position="right center">

      <Input size="large" placeholder="Title" value={title} onChange={(ev) => setTitle(ev.target.value)}/>
      <Input size="large" placeholder="Description" value={description} onChange={(ev) => setDescription(ev.target.value)}/>
      <Input type="file" accept="image/png, image/jpeg" onChange={async (ev) => setImg(await readFileDataAsBase64(ev))} />
      <Button onClick={() => handleClick()} style={{width: "100%", marginTop: "10px"}} size="large">Add</Button>
    </Popup>
  )
}
