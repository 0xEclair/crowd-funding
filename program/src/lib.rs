use solana_program::account_info::{AccountInfo, next_account_info};
use solana_program::{entrypoint, msg};
use solana_program::entrypoint::ProgramResult;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_error::ProgramError::InvalidInstructionData;
use solana_program::rent::Rent;
use solana_program::sysvar::Sysvar;
use test::bench::iter;

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
    let accounts_iter = &mut accounts.iter();
    let writing_account = next_account_info(accounts_iter)?;
    let creator_account = next_account_info(accounts_iter)?;
    if !creator_account.is_signer {
        msg!("creator_account should be signer");
        return Err(ProgramError::IncorrectProgramId);
    }
    if writing_account.owner != program_id {
        msg!("writing_account isn't owned by program");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut input_data =
        CampaignDetails::try_from_slice(&instruction_data)
            .expect("Serialization for instruction data didn't worked");

    if input_data.admin != *creator_account.key {
        msg!("Invalid instruction data");
        return Err(ProgramError::InvalidInstructionData);
    }

    let rent_exemption = Rent::get()?.minimum_balance(writing_account.data_len());
    if **writing_account.lamports.borrow() < rent_exemption {
        msg!("The balance of writing_account should be more than rent_exemption");
        return Err(ProgramError::InsufficientFunds);
    }
    input_data.amount_donated = 0;
    input_data.serialize(&mut &mut writing_account.data.borrow_mut()[..])?;
    Ok(())
}

fn withdraw(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let writing_account = next_account_info(account_iter)?;
    let admin_account = next_account_info(account_iter)?;

    if writing_account.owner != program_id {
        msg!("writing_account isn't owned by program.");
        return Err(ProgramError::IncorrectProgramId);
    }

    if !admin_account.is_signer {
        msg!("admin should be signer");
        return Err(ProgramError::IncorrectProgramId);
    }

    let campaign_data =
        CampaignDetails::try_from_slice(*writing_account.data.borrow())
            .expect("Error deserializing data");

    if campaign_data.admin != *admin_account.key {
        msg!("Only the account admin can withdraw");
        return Err(ProgramError::InvalidInstructionData);
    }

    let input_data =
        WithdrawRequest::try_from_slice(&instruction_data)
            .expect("Instruction data deserialization didn't work");

    let rent_exemption = Rent::get()?.minimum_balance(writing_account.data_len());

    if **writing_account.lamports.borrow() < rent_exemption {
        msg!("Insufficient balance");
        return Err(ProgramError::InsufficientFunds);
    }

    **writing_account.try_borrow_mut_lamports()? -= input_data.amount;
    **admin_account.try_borrow_mut_lamports()? += input_data.amount;
    Ok(())
}

fn donate(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let writing_account = next_account_info(accounts_iter)?;
    let donator_program_account = next_account_info(accounts_iter)?;
    let donator = next_account_info(accounts_iter)?;

    if writing_account.owner != program_id {
        msg!("writing_account isn't owned by program.");
        return Err(ProgramError::IncorrectProgramId);
    }

    if donator_program_account.owner != program_id {
        msg!("donator_program_account isn't owned by program");
        return Err(ProgramError::IncorrectProgramId);
    }

    if !donator.is_signer {
        msg!("donator should be signer");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut campaign_data =
        CampaignDetails::try_from_slice(*writing_account.data.borrow())
            .expect("Error deserializing data");
    campaign_data.amount_donated += **donator_program_account.lamports.borrow();
    
    **writing_account.try_borrow_mut_lamports()? += **donator_program_account.lamports.borrow();
    **donator_program_account.try_borrow_mut_lamports()? = 0;

    campaign_data.serialize(&mut &mut writing_account.data.borrow()[..])?;
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

#[derive(BorshSerialize, BorshDeserialize, Debug)]
struct WithdrawRequest {
    pub amount: u64
}