// third-party library
import { Button, Code, Input, Modal, Spacer, Textarea, useInput, useModal } from "@geist-ui/react";
import { PublicKey } from "@solana/web3.js";
import { create, donate } from "../solana/campaign";
import { useEffect, useState } from "react";

export const CreateCampaignModal = () => {
  const { visible, setVisible, bindings } = useModal();
  const { state, setState } = useInput("");
  const [tavalue, setTaState] = useState("");
  const [imgvalue, setImgState] = useState("");
  return (
    <>
      <Button auto onClick={() => { setVisible(true); }}>
        create campaign
      </Button>
      <Modal {...bindings}>
        <Modal.Title>create campaign</Modal.Title>
        <Modal.Content>
          <Input label={"name"} value={state} onChange={(e) => {
            console.log(e.target.value);
            setState(e.target.value);
          }}/>
          <Spacer h={1} />
          <Textarea placeholder={"description"} value={tavalue} onChange={(e: any) => {
            console.log(e.target.value);
            setTaState(e.target.value);
          }}/>
          <Spacer h={1} />
          <Input label={"img"} value={imgvalue} onChange={(e: any) => {
            console.log(e.target.value);
            setImgState(e.target.value);
          }}/>
        </Modal.Content>
        <Modal.Action passive onClick={() => { setVisible(false)}}>close</Modal.Action>
        <Modal.Action
          onClick={() => {
            setVisible(false);
            create(state, tavalue, imgvalue);
          }}
        >ok</Modal.Action>
      </Modal>
    </>
  )
}