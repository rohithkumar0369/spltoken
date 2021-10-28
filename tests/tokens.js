const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;
const spl = require("@solana/spl-token");
const assert = require("assert");
const kp = require('./keypair.json')
describe('tokens', () => {
  const program = anchor.workspace.Tokens;
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);


  let ourAssociatedTokens
  let mint;
  let mint_bump;
  const amount = new anchor.BN(0 * 10 ** 5)
  const amount2 = new anchor.BN(2 * 10 ** 5)
  const amount3 = new anchor.BN(2 * 10 ** 2)
  const arr = Object.values(kp);
  const secret = new Uint8Array(arr);

  // console.log(anchor.web3.Keypair.generate())

  let friend =   anchor.web3.Keypair.fromSecretKey(secret);
  console.log('friend account',friend.publicKey.toBase58());
  let friendsAssociatedTokenAccount;

  //Buffer.from("mint-authority13")


  it('Is initialized!', async () => {

    [mint, mint_bump] = await anchor.web3.PublicKey.findProgramAddress([], program.programId);

    console.log('mint',mint.toBase58())
    await program.rpc.initialize(mint_bump,{
      accounts: {
        mint: mint,
        user: program.provider.wallet.publicKey,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      }
    });
  });
  
  it('Is minted1!', async () => {
     ourAssociatedTokens = await spl.Token.getAssociatedTokenAddress(
      spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      spl.TOKEN_PROGRAM_ID,
      mint,
      program.provider.wallet.publicKey,
    );
    
    console.log(' token account',ourAssociatedTokens.toBase58())

    await program.rpc.mintTokens(mint_bump,amount ,{
      accounts: {
        mint: mint,
        destination: ourAssociatedTokens,
        payer: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY
      },
    });
    console.log('mint 1 completed')
  });


  it('Is burned',async ()=>{

    await program.rpc.burn(mint_bump,amount2 ,{
      accounts: {
        mint: mint,
        source: ourAssociatedTokens,
        owner: program.provider.wallet.publicKey,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      }
    });
  })


  it('Is minted2!', async () => {

    friendsAssociatedTokenAccount = await spl.Token.getAssociatedTokenAddress(
      spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      spl.TOKEN_PROGRAM_ID,
      mint,
      friend.publicKey,
    );
  //   let accountInfo = await provider.getAccountInfo(friendsAssociatedTokenAccount);
  //  console.log('accountinfo',accountInfo);
   console.log(' destination token account',friendsAssociatedTokenAccount.toBase58())

   await program.rpc.mintTokens(mint_bump,amount, {
     accounts: {
       mint: mint,
       destination: friendsAssociatedTokenAccount,
       payer: friend.publicKey,
       systemProgram: anchor.web3.SystemProgram.programId,
       tokenProgram: spl.TOKEN_PROGRAM_ID,
       associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
       rent: anchor.web3.SYSVAR_RENT_PUBKEY
     },
     signers: [friend]
   });
   console.log('mint 2 completed')
 });


  // it('Is transferred',async ()=>{
  //   console.log('destination token account',ourAssociatedTokens.toBase58())
  //   console.log('total Amount', ourAssociatedTokens.amount)
  //   await program.rpc.transferTokens(mint_bump,amount3,{
  //     accounts: {
  //       source: ourAssociatedTokens ,
  //       destination: friendsAssociatedTokenAccount,
  //       owner: program.provider.wallet.publicKey,
  //       tokenProgram: spl.TOKEN_PROGRAM_ID,
  //     }
  //   })
  // })



  // it("Is closed", async()=>{

  //       friendsAssociatedTokenAccount = await spl.Token.getAssociatedTokenAddress(
  //     spl.ASSOCIATED_TOKEN_PROGRAM_ID,
  //     spl.TOKEN_PROGRAM_ID,
  //     mint,
  //     friend.publicKey,
  //   );

  //   await program.rpc.closeAccount(mint_bump, {
  //     accounts:{
  //       accountToClose: friendsAssociatedTokenAccount,
  //       destination: ourAssociatedTokens,
  //       owner: friend.publicKey,
  //       tokenProgram: spl.TOKEN_PROGRAM_ID,
  //     },
  //     signers:[friend]
  //   })
  // })


  // it("Is closed", async()=>{
  //       friendsAssociatedTokenAccount = await spl.Token.getAssociatedTokenAddress(
  //     spl.ASSOCIATED_TOKEN_PROGRAM_ID,
  //     spl.TOKEN_PROGRAM_ID,
  //     mint,
  //     friend.publicKey,
  //   );
  //   await program.rpc.closeAccount(mint_bump, {
  //     accounts:{
  //       accountToClose: friendsAssociatedTokenAccount,
  //       destination: ourAssociatedTokens,
  //       owner: friend.publicKey,
  //       tokenProgram: spl.TOKEN_PROGRAM_ID,
  //     },
  //     signers:[friend]
  //   })
  // })

  it("Is approved", async()=>{
    await program.rpc.closeAccount(mint_bump,amount, {
      accounts:{
        mint:mint,
        to:ourAssociatedTokens,
        delete:friendsAssociatedTokenAccount,
        owner: program.provider.wallet.publicKey,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      }
    })
  })
});
