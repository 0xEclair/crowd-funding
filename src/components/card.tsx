// third-party library
import { Button, Card, Image, Input, Spacer, Text, useInput } from "@geist-ui/react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// local library
import { donate } from "../solana/campaign";

const DonateButton: React.FC<{campaignPubkey: PublicKey}> = (campaignPubkey) => {
  const { state, setState, reset, bindings } = useInput("0");
  return(
    <>
      <Input {...bindings} />
      <Spacer h={.5} />
      <Button auto type={"secondary"} scale={1/3} onClick={() => {
        donate(campaignPubkey.campaignPubkey, Number(state));
      }}>doante</Button>
    </>
  )
}

function toFixed(x: any) {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split('e-')[1]);
    if (e) {
      x *= Math.pow(10,e-1);
      x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split('+')[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10,e);
      x += (new Array(e+1)).join('0');
    }
  }
  return x;
}

export const CampaignCard = (campaign: any) => {
    return (
      <Card>
        <Image src={campaign.campaign.image_link} />
        <Text type={"default"}h4>{campaign.campaign.name}</Text>
        <Text h5 type={"secondary"} small>{campaign.campaign.description}</Text>
        <Text h5 type={"secondary"} small>raised: {toFixed(campaign.campaign.amount_donated/LAMPORTS_PER_SOL)} SOL</Text>
        <Card.Footer>
          <DonateButton campaignPubkey={campaign.pubId} />
        </Card.Footer>
      </Card>
    );
}