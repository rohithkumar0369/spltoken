use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount , Transfer , CloseAccount,SetAuthority},
};

use spl_token::instruction::{AuthorityType};
declare_id!("FLFDkdHZEw1st49GdwRrbALdN6b59FtcQijcTVFQtr1K");

#[program]
pub mod tokens {
    use super::*;
    pub fn initialize(_ctx: Context<Initialize>,_mint_dump:u8) -> ProgramResult {
        Ok(())
    }

    pub fn mint_tokens(ctx: Context<mintToken>,mint_bump:u8,amount:u64) -> ProgramResult {
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.mint.to_account_info(),
                },
                &[&[&[], &[mint_bump]]],
            ),
            amount,
        )?;
        Ok(())
    }
   
    pub fn burn(ctx: Context<Burn>, _mint_bump: u8 , amount:u64) -> ProgramResult {
        anchor_spl::token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.source.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )
    }

    pub fn transfer_tokens(ctx:Context<TransferToken> , _mint_bump: u8, amount:u64) -> ProgramResult {
        anchor_spl::token::transfer(CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::Transfer{
                from: ctx.accounts.source.to_account_info(),
                to : ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.owner.to_account_info()
            }
            ), 
            amount)?;
        Ok(())
    }

    pub fn close_account(ctx:Context<CloseAcc>, mint_bump: u8) -> ProgramResult{
        anchor_spl::token::close_account(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::CloseAccount{
                    account: ctx.accounts.account_to_close.to_account_info(),
                    destination : ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info()
                }, 
                &[&[&[], &[mint_bump]]],
                )
        )?;
        Ok(())
    }

    pub fn approve(ctx: Context<approve>, mint_bump: u8,amount: u64) -> ProgramResult{
        anchor_spl::token::approve(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Approve{
                    to: ctx.accounts.to.to_account_info(),
                    delegate: ctx.accounts.delegate.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info()
                },
                &[&[&[], &[mint_bump]]],
            ),
             amount)?;
        Ok(())
    }
}

//b"mint-authority13".as_ref()



#[derive(Accounts)]
#[instruction(mint_bump:u8)]
pub struct Initialize<'info>{
    #[account(
        init_if_needed,
        payer = user, 
        seeds=[],
        bump =mint_bump,
        mint::decimals = 6,
        mint::authority = mint
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct mintToken<'info>{
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub destination: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Burn<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(mut, associated_token::mint = mint, associated_token::authority = owner)]
    pub source: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}



#[derive(Accounts)]
pub struct TransferToken<'info>{
    #[account(mut)]
    pub source: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]

pub struct CloseAcc<'info>{
    #[account(mut)]
    pub account_to_close: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]

pub struct approve<'info>{
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub delegate: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub token_program: Program<'info, Token>,
}