import {connection, programId, setPayerAndBlockhashTransaction, signAndSendTransaction, wallet} from "./index";
import {PublicKey, SystemProgram, TransactionInstruction} from "@solana/web3.js";
import {serialize} from "borsh";

class CampaignDetails {
    constructor(properties: any) {
        Object.keys(properties).forEach((key: string) => {
            (this as any)[key] = properties[key];
        });
    }

    static schema: any = new Map([
        [
            CampaignDetails,
            {
                kind: "struct",
                fields: [
                    ["admin", [32]],
                    ["name", "string"],
                    ["description", "string"],
                    ["image_link", "string"],
                    ["amount_donated", "u64"]
                ]
            }
        ]
    ]);
}

export async function createCampaign(name: string, description: string, image_link: string) {
    await checkWallet();
    const SEED = "abcdef" + Math.random().toString();
    const newAccount = await PublicKey.createWithSeed(wallet.publicKey as PublicKey, SEED, programId);
    const campaign = new CampaignDetails({
        name: name,
        description: description,
        image_link: image_link,
        admin: wallet.publicKey?.toBuffer(),
        amount_donated: 0
    });
    const data = serialize(CampaignDetails.schema, campaign);
    const data_to_send = new Uint8Array([0, ...data]);
    const lamports = await connection.getMinimumBalanceForRentExemption(data.length);
    const createProgramAccount = SystemProgram.createAccountWithSeed({
        fromPubkey: wallet.publicKey as PublicKey,
        basePubkey: wallet.publicKey as PublicKey,
        seed: SEED,
        newAccountPubkey: newAccount,
        lamports: lamports,
        space: data.length,
        programId: programId
    });

    const instructionToOurProgram = new TransactionInstruction({
        keys: [
            {pubkey: newAccount, isSigner: false, isWritable: true},
            {pubkey: wallet.publicKey as PublicKey, isSigner: true, isWritable: false}
        ],
        programId: programId,
        data: Buffer.from(data_to_send)
    })

    const trans = await setPayerAndBlockhashTransaction([createProgramAccount, instructionToOurProgram]);
    const signature = await signAndSendTransaction(trans);
    const result = await connection.confirmTransaction(signature);
    console.log("end sendMessage", result);
}

async function checkWallet() {
    if(!wallet.connected) {
        await wallet.connect();
    }
}