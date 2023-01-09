import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { providers, Contract, ethers, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { ICO_CONTRACT_ADDRESS, ICO_ABI } from "../constants";
import { NFT_COLLECTION_CONTRACT_ADDRESS, NFT_ABI } from "../constants";
import Web3Modal from "web3modal"

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [icoPrice, setICOprice] = useState(0)
  const [tokensLeftToClaim, setTokensLeftToClaim] = useState(0)
  const [cryptoDevBalance, setcryptoDevBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [tokenAmount, setTokenAmount] = useState(0)
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  const getMaxSupply = async () => {
    try {
      let provider = await getProviderOrSigner()
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider)
      let maxSupply = await ICOContract.maxSupply()
      setMaxSupply(maxSupply / Math.pow(10,18))
    } catch (err) {
      console.error(err);
    }
  }

  const getCurrentSupply = async () => {
    try {
      let provider = await getProviderOrSigner()
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider)
      let totalSupply = await ICOContract.totalSupply()
      setTotalSupply(totalSupply / Math.pow(10,18))
    } catch (err) {
      console.error(err);
    }
  }

  const getICOPrice = async () => {
    try {
      let provider = await getProviderOrSigner()
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, provider)
      let ICOprice = await ICOContract.ico_price()
      setICOprice(ICOprice / Math.pow(10,18))
    } catch (err) {
      console.error(err);
    }
  }

  const getClaimableTokens = async() => {
    try {
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      let NFTContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, NFT_ABI, signer)
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, signer)
      let balance = Number(await NFTContract.balanceOf(address))
      if(balance == 0) {
        setTokensLeftToClaim(0)
      }
      else {
        var amount = 0;
        for (var i = 0; i < balance; i++) {
          const tokenId = await NFTContract.tokenOfOwnerByIndex(address, i);
          const claimed = await ICOContract.claimedTokens(tokenId);
          if (!claimed) {
            amount++;
          }
        }
        setTokensLeftToClaim(amount);
      }
    } catch (err) {
      console.error(err);
      setTokensLeftToClaim(0);
    }
  }

  const getCryptoDevBalance = async () => {
    try {
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, signer)
      let balance = await ICOContract.balanceOf(address)
      setcryptoDevBalance(balance / Math.pow(10,18))
    } catch (err) {
      console.error(err);
      setcryptoDevBalance(0)
    }
  }

  const claimTokens = async () => {
    try {
      let signer = await getProviderOrSigner(true)
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, signer)
      let tx = await ICOContract.claimAirdrop()
      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("You claimed your tokens!")
      await getCurrentSupply();
      await getClaimableTokens()
      await getCryptoDevBalance()
    } catch (error) {
      console.log(error)
    }
  }

  const buyTokens = async (amount) => {
    try {
      let signer = await getProviderOrSigner(true)
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, ICO_ABI, signer)
      let ethValue = amount * icoPrice
      console.log(amount)
      let tx = await ICOContract.buyTokens(amount, {
        value: utils.parseEther(ethValue.toString()),
      })
      setLoading(true)
      await tx.wait()
      setLoading(false)
      window.alert("You bought "+amount+" tokens!")
      await getCryptoDevBalance();
      await getCurrentSupply();
    } catch (error) {
      console.log(error)
    }
  }

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const ICOContract = new Contract(
        ICO_CONTRACT_ADDRESS,
        ICO_ABI,
        provider
      );
      const _owner = await ICOContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const ICOContract = new Contract(
        ICO_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      );

      const tx = await tokenContract.withdrawFunds();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getOwner();
    } catch (err) {
      console.error(err);
      window.alert(err.reason);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getMaxSupply();
      getCurrentSupply();
      getICOPrice();
      getClaimableTokens();
      getCryptoDevBalance()
      getOwner()
    }
  }, [walletConnected])

  const renderButton = () => {
    if(loading) {
      return (
          <button className={styles.button}>Loading...</button>
      )
    }
    //tokens to claim
    //buy tokens
    if(!walletConnected) {
      return (
        <button className={styles.button} onClick={connectWallet}>Connect wallet</button>
      )
    }

    if(tokensLeftToClaim > 0) {
      return (
        <div>
          <div className={styles.description}>{tokensLeftToClaim * 10} tokens left to claim </div>
          <button className={styles.button} onClick={claimTokens}>Claim tokens</button>
        </div>
      )
    }

    return (
        <div>
          <div>
            <input
              type="number"
              placeholder="Amount of Tokens"
              onChange={(e) => setTokenAmount((e.target.value))}
              className={styles.input}
            />
          </div>
          <button className={styles.button} onClick={() => buyTokens(tokenAmount)} disabled={!(tokenAmount > 0)}>Mint tokens</button>
        </div>
    )

  }

  return (
    <div>
      <Head>
        <title>ICO dApp</title>
        <meta name="description" content="ICO dApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to the CryptoDev ICO!</h1>
            <div className={styles.description}>ICO price : {icoPrice} ETH</div>
            <div className={styles.description}>{totalSupply} / {maxSupply} tokens sold!</div>
            <div className={styles.description}>You minted {cryptoDevBalance} tokens so far!</div>
            {renderButton()}
          </div>
            <img className={styles.image} src="https://www.memeatlas.com/images/pepes/pepe-happy-bitcoins.png"></img>
      </div>

      <footer className={styles.footer}> Made with &#10084; by Purif </footer>
    </div>
  )
}
