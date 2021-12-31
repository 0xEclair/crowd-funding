use solana_program::account_info::AccountInfo;
use solana_program::{entrypoint, msg};
use solana_program::entrypoint::ProgramResult;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use borsh::{
    BorshSerialize,
    BorshDeserialize
};
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]) -> ProgramResult {
    if instruction_data.len() == 0 {
        return Err(ProgramError::InvalidInstructionData);
    }

    if instruction_data[0] == 0 {
        return create_campaign(program_id, accounts, &instruction_data[1..instruction_data.len()]);
    }
    else if instruction_data[0] == 1 {
        return withdraw(program_id, accounts, &instruction_data[1..instruction_data.len()]);
    }
    else if instruction_data[0] == 2 {
        return donate(program_id, accounts, &instruction_data[1..instruction_data.len()]);
    }

    msg!("Invalid instruction");
    Err(ProgramError::InvalidInstructionData)
}

entrypoint!(process_instruction);

fn create_campaign(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
    let mut accounts = accounts.iter();
    Ok(())
}

fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
    Ok(())
}

fn donate(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
    Ok(())
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
struct CampaignDetails {
    pub admin: Pubkey,
    pub name: String,
    pub description: String,
    pub image_link: String,
    pub amount_donated: u64
}