import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { providers, Contract, ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { ICO_CONTRACT_ADDRESS, abi } from "../constants";
import Web3Modal from "web3modal"

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false)
  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
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
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, abi, provider)
      let maxSupply = await ICOContract.maxSupply()
      console.log(maxSupply / Math.pow(10,18))
      setMaxSupply(maxSupply / Math.pow(10,18))
    } catch (err) {
      console.error(err);
    }
  }

  const getCurrentSupply = async () => {
    try {
      let provider = await getProviderOrSigner()
      let ICOContract = new ethers.Contract(ICO_CONTRACT_ADDRESS, abi, provider)
      let totalSupply = await ICOContract.totalSupply()
      setTotalSupply(totalSupply / Math.pow(10,18))
    } catch (err) {
      console.error(err);
    }
  }

  const getICOPrice = async () => {
    
  }

  const claimTokens = async () => {

  }

  const buyTokens = async () => {
    
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getMaxSupply();
    }
  }, [walletConnected])

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
            <div className={styles.description}>{totalSupply} / {maxSupply} tokens sold</div>
          </div>
      </div>

      <footer className={styles.footer}> Made with &#10084; by Purif </footer>
    </div>
  )
}
