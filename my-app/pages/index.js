import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';
import Web3Modal from "web3modal";
import React, { useEffect,useRef, useState } from 'react';
import { BigNumber, Contract, utils, providers } from 'ethers';
import {TOKEN_CONTRACT_ABI,TOKEN_CONTRACT_ADDRESS,NFT_CONTRACT_ABI,NFT_CONTRACT_ADDRESS} from "../constants";

export default function Home() {
  const web3ModalRef = useRef();
  const zero = BigNumber.from(0);
  const [ walletConnected , setWalletConnected ] = useState(false);
  const [tokensMinted, setTokensMinted] = useState(zero);
  const [balanceOfSpiderVerseToken, setBalanceOfSpiderVerseToken] = useState(zero);
  const [tokenAmount, setTokenAmount] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [tokensToBeClaimed, setTokensToBeClaimed] = useState(zero);
  const [isOwner, setIsOwner] = useState(false);


  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 11155111){
      //Popup error to change the network to sepolia testnet network
      window.alert("please switch to Sepolia Testnet Network");
      //Throwing error to change the network to sepolia testnet network
      throw new Error("please switch to Sepolia Testnet Network"); 
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async() => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);     
    }
  };

  const mintSpiderVerseToken = async(amount) => {
    try{
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer        
      );
      const value = 0.001*amount;
      
      const tx = await tokenContract.mint(amount, {
        value:utils.parseEther(value.toString()),
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Successfully Minted Spider Verse Tokens!");
      await getBalanceOfSpiderVerseToken();
      await getTotalTokensMinted();
      await getTokensToBeClaimed();

    } catch(err){
      console.error(err);
    }
  }

  const claimSpiderVerseTokens = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )
      const tx = await tokenContract.claim()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("Successfully Claimed Crypto Dev tokens")
      await getBalanceOfSpiderVerseToken();
      await getTotalTokensMinted();
      await getTokensToBeClaimed(); 
      console.log(isOwner);
    } catch (err) {
      console.error(err);
    }
  }

  const getTokensToBeClaimed = async() => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await nftContract.balanceOf(address);

      if(balance === zero) {
        setTokensToBeClaimed(zero);
      }else {
        var amount = 0;

        for(var i=0; i<balance; i++){
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await tokenContract.tokenIdsClaimed(tokenId);
          if(!claimed){
            amount++;
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount));
      }
    } catch (err) {
      console.error(err);
      setTokensToBeClaimed(zero);
    }
  };


  const getBalanceOfSpiderVerseToken = async() => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      setBalanceOfSpiderVerseToken(balance);
    } catch (err) {
      console.error(err);
      setBalanceOfSpiderVerseToken(zero);
    }
  };

  const getTotalTokensMinted = async() => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      )
      const _tokenMinted = await tokenContract.totalSupply();
      console.log(_tokenMinted)
      setTokensMinted(_tokenMinted);
    } catch (err) {
      console.error(err);      
    }
  }
  
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        provider
      );
      // call the owner function from the contract
      const _owner = await tokenContract.owner();
      console.log(_owner)
      
      const signer = await getProviderOrSigner(true);
      // Get the address associated to signer which is connected to Metamask
      const userAddress = await signer.getAddress();
      console.log(userAddress)
      if (userAddress.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdraw();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You Have Successfully withdraw")
      await getOwner();
      
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current =  new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider : false,
      });
      connectWallet();
      getTotalTokensMinted();
      getBalanceOfSpiderVerseToken();
      getTokensToBeClaimed();
      getOwner();
    }
  }, [walletConnected]);

  const renderButton = () => {
    if(loading) {
      return (
      <div>
        <button className={styles.button}>
          Loading....
        </button>
      </div>
      );
    }

    // if (walletConnected && isOwner) {
    //   return (
    //     <div>
    //       <button className={styles.button} onClick={withdrawCoins}>
    //         Withdraw Coins
    //       </button>
    //     </div>
    //   );
    // }

    if(tokensToBeClaimed > 0) {
      return (
        <div>
          <div className={styles.description}>
            {tokensToBeClaimed * 10} Tokens can be claimed! 
          </div>
          <button className={styles.button} onClick={claimSpiderVerseTokens}>
            Claim Tokens
          </button>
        </div>
      )
    }

    return (
      <div style={{display: "flex-col"}}>
        <div>
          <input type='number'
          placeholder='Amount of Tokens' 
          onChange={(e) => setTokenAmount(BigNumber.from(e.target.value))}
          className={styles.input}
          />
          
        </div>
        <button className={styles.button} disabled={!(tokenAmount > 0)} onClick={() => mintSpiderVerseToken(tokenAmount)}>
            Mint Tokens
        </button>
      </div>
    );
  }


  return (
    <div>
      <Head>
        <title>Spider Verse ICO</title>
        <meta name='description' content='ICO-dApp' />
        <link rel='icon' href='./favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}> Welcome to Spider Verse ICO</h1>
          <div className={styles.description}>
            You can claim or mint Spider Verse tokens here
          </div>
          {
            walletConnected ? (
            <div>
              <div className={styles.description}>
                You have minted {utils.formatEther(balanceOfSpiderVerseToken)}{" "}SpiderVerse Tokens
              </div>
              <div className={styles.description}>
                Total Tokens minted - {utils.formatEther(tokensMinted)} / 10000 
              </div>
              {renderButton()}
            </div>
            ) : (<button onClick={connectWallet} className={styles.button}>
              Connect Wallet
            </button>
          )
          
          }
          {/* {isOwner ? (
            <button className={styles.button} onClick={withdrawCoins}>
              Withdraw
            </button>
        ) : (" ")}
           */}
        </div>
        
        <div>
          <img className={styles.image} src='./spiderman.svg' />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Sourabh
      </footer>
    </div>
  );
}
