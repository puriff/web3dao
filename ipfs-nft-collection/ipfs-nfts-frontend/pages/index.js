import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { Contract, providers, ethers, utils } from 'ethers'
import Web3Modal from "web3modal"
import { useRef, useState, useEffect } from 'react'
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from './constants'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [maxSupply, setMaxSupply] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (signer = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }
    if(signer) {
      const signer = web3Provider.getSigner();
      return signer
    }
    return web3Provider
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  const getMaxSupply = async() => {
    try {
      let provider = await getProviderOrSigner()
      let NFTContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider)
      let maxSupply = await NFTContract.maxID()
      setMaxSupply(maxSupply)
    } catch (err) {
      console.error(err);
    }
  }

  const getTotalSupply = async() => {
    try {
      let provider = await getProviderOrSigner()
      let NFTContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider)
      let totalSupply = await NFTContract.totalSupply()
      console.log(totalSupply)
      setTotalSupply(Number(totalSupply))
    } catch (err) {
      console.error(err);
    }
  }

  const mint = async() => {
    try {
      let signer = await getProviderOrSigner(true)
      let NFTContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
      let mintTx = await NFTContract.mint({value: utils.parseEther("0.001")})
      setLoading(true)
      await mintTx.wait()
      setLoading(false)
      await getTotalSupply()
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()
      getMaxSupply()
      getTotalSupply()
    }
  }, [walletConnected])

  const renderButton = () => {
    if(!walletConnected) {
      return(
        <button className={styles.button} onClick={() => connectWallet()}>Connect wallet</button>
      )
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    return(
      <button className={styles.button} onClick={() => mint()}>Mint a fren</button>
    )
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div className={styles.box}>
          <h1 className={styles.title}>Welcome to the LW3Frens mint page!</h1>
          <div className={styles.description}>Here you can mint some super cool, immutable and decentralized frens!</div>
          <div className={styles.description}> {totalSupply} / {maxSupply} have been minted so far!</div>
          {renderButton()}
        </div>
        <img className={styles.image} src="./pepe-calculates.jpg"></img>
      </div>
      <footer className={styles.footer}> Made with &#10084; by Purif </footer>
    </div>
  )
}
