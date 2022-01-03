// third-party library
import {
    AccountInfo,
    PublicKey,
    SystemProgram,
    TransactionInstruction
} from "@solana/web3.js";
import {
    serialize,
    deserialize
} from "borsh";

// local library
import {
    connection,
    programId,
    wallet,
    setPayerAndBlockhashTransaction,
    signAndSendTransaction
} from "./index";

class CampaignDetails {
    constructor(properties: any) {
        Object.keys(properties).forEach((key: string) => {
            (this as any)[key] = properties[key];
        });
    }

    static schema = new Map([[CampaignDetails,
        {
            kind: 'struct',
            fields: [
                ['admin', [32]],
                ['name', 'string'],
                ['description', 'string'],
                ['image_link', 'string'],
                ['amount_donated', 'u64']]
        }]]);
}

export async function create(name: string, description: string, image_link: string) {
    await checkWallet();
    console.log("start creating campaign");
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
            {pubkey: wallet.publicKey!, isSigner: true, isWritable: false}
        ],
        programId: programId,
        data: Buffer.from(data_to_send)
    })

    const trans = await setPayerAndBlockhashTransaction([createProgramAccount, instructionToOurProgram]);
    const signature = await signAndSendTransaction(trans);
    const result = await connection.confirmTransaction(signature);
    console.log("creating new campaign successed", result);
}

async function checkWallet() {
    if(!wallet.connected) {
        await wallet.connect();
    }
}

export async function campaigns(): Promise<({pubId: PublicKey, campaign: CampaignDetails} | null)[]> {
    const accounts: {pubkey: PublicKey, account: AccountInfo<Buffer>}[] = await connection.getProgramAccounts(programId);
    const campaigns: ({pubId: PublicKey, campaign: CampaignDetails} | null) [] = accounts!.map((e: { pubkey: PublicKey, account: AccountInfo<Buffer> }) => {
        try {
            const data: any = deserialize(CampaignDetails.schema, CampaignDetails, e.account.data);
            return {
                pubId: e.pubkey,
                campaign: new CampaignDetails({
                    name: data.name,
                    description: data.description,
                    image_link: data.image_link,
                    amount_donated: data.amount_donated,
                    admin: data.admin
                })
            };
        }
        catch (err) {
            console.log(err);
            return null;
        }
    });
    return campaigns;
}

export async function donate(campaignPubKey: PublicKey, amount: number) {
    await checkWallet();

    const SEED = "abcdef" + Math.random().toString();
    const newAccount = await PublicKey.createWithSeed(wallet.publicKey!, SEED, programId);
    const createProgramAccount = SystemProgram.createAccountWithSeed({
        fromPubkey: wallet.publicKey!,
        basePubkey: wallet.publicKey!,
        seed: SEED,
        newAccountPubkey: newAccount,
        lamports: amount,
        space: 1,
        programId: programId
    });

    const instructionToOurProgram = new TransactionInstruction({
        keys: [
            { pubkey: campaignPubKey, isSigner: false, isWritable: true },
            { pubkey: newAccount, isSigner: false, isWritable: false },
            { pubkey: wallet.publicKey!, isSigner: true, isWritable: false },
        ],
        programId: programId,
        data: Buffer.from(new Uint8Array([2]))
    });

    const trans = await setPayerAndBlockhashTransaction([createProgramAccount, instructionToOurProgram]);
    const signature = await signAndSendTransaction(trans);
    const result = await connection.confirmTransaction(signature);
    console.log("end donate", result);
}