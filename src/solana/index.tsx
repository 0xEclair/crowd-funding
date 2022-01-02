import Wallet from "@project-serum/sol-wallet-adapter";
import {
    Connection, SystemProgram,
    Transaction, PublicKey,
    TransactionInstruction,
    TransactionInstructionCtorFields
} from "@solana/web3.js";
import {serialize, deserialize} from "borsh";

const cluster = "https://api.devnet.solana.com";
export const connection = new Connection(cluster, "confirmed");
export const wallet = new Wallet("https://www.sollet.io", cluster);
export const programId = new PublicKey("B26ykdYB6L21F6Y9WFm4rZGJfJPmrD6ua6JRUdLNn9Xa");

export async function setPayerAndBlockhashTransaction(instructions: any) {
    const transaction = new Transaction();
    instructions.forEach((ele: any) => {
        transaction.add(ele);
    });
    if(wallet.publicKey == null) {
        transaction.feePayer = undefined;
    }
    else {
        transaction.feePayer = wallet.publicKey;
    }
    let hash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = hash.blockhash;
    return transaction;
}

export async function signAndSendTransaction(transaction: any) {
    try {
        console.log("start signAndSendTransaction");
        let signedTrans = await wallet.signTransaction(transaction);
        console.log("signed transaction");
        let signature = await connection.sendRawTransaction(signedTrans.serialize());
        console.log("end signAndSendTransaction");
        return signature;
    }
    catch (err) {
        console.log("signAndSendTransaction error", err);
        throw err;
    }
}