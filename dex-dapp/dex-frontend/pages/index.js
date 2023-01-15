import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Web3Modal from "web3modal"
import { providers, Contract, ethers, utils } from "ethers";
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from "../constants";
import { EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI } from "../constants";
import { useEffect, useState, useRef } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false)
  const [tokenDevBalance, setTokenDevBalance] = useState(0)
  const [etherBalance, setEtherBalance] = useState(0)
  const [LPBalance, setLPBalance] = useState(0)
  const [selectedTab, setSelectedTab] = useState("Liquidity")
  const [tokenValue, setTokenValue] = useState("ETH")
  const [tokenSwapAmount, setTokenSwapAmount] = useState(0)
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

  const getDevTokenBalance = async() => {
    try {
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      let tokenDevContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, signer)
      let balance = await tokenDevContract.balanceOf(address);
      let balanceReadable = toReadableValue(balance)
      setTokenDevBalance(balanceReadable)
    } catch (err) {
      console.log(err)
    }
  }

  const getEtherBalance = async() => {
    try {
      let signer = await getProviderOrSigner(true)
      let balance = await signer.getBalance();
      let balanceReadable = toReadableValue(balance)
      setEtherBalance(balanceReadable)
    } catch (err) {
      console.log(err)
    }
  }

  const getLPBalance = async()=> {
    try {
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      let exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer)
      let balance = await exchangeContract.balanceOf(address);
      let balanceReadable = toReadableValue(balance)
      setLPBalance(balanceReadable)
    } catch (err) {
      console.log(err)
    }
  }

  const getDexReserves = async() => {
    
  }

  const getAmountCryptoDevTokens = async(inputTokenAmount) => {
    try {
      let signer = await getProviderOrSigner(true)
      let exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer)

      uint ethReserve =  ethBalance - msg.value;
            uint cryptoDevTokenAmount = (msg.value * cryptoDevReserve)/(ethReserve);
            require(cryptoDevAmount >= cryptoDevTokenAmount, "Amount of tokens sent is less than the minimum tokens required");
    } catch (err) {
      console.log(err)
    }
  }

  const addLiquidity = async(amountETH, amountCryptoDev) => {
    try {
      let signer = await getProviderOrSigner(true)
      let exchangeContract = new ethers.Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, signer)
      let balance = await exchangeContract.balanceOf(address);
      let balanceReadable = toReadableValue(balance)
      setLPBalance(balanceReadable)
    } catch (err) {
      console.log(err)
    }
  }

  const toReadableValue = (bignumber) => {
    return Number(bignumber / Math.pow(10,18))
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getDevTokenBalance();
      getEtherBalance();
      getLPBalance();
    }
  }, [walletConnected])

  function renderTabs() {
    if (selectedTab === "Swap") {
      return renderSwapTab();
    } else if (selectedTab === "Liquidity") {
      return renderManageLiquidityTab();
    }
    return null;
  }

  const renderSwapTab = () => {
    return ( 
      <div className={styles.swapBox}>
        <div className={styles.inputBox}>
          <input className={styles.input} type="number"
            placeholder="Amount of tokens"
            onChange={(e) => setTokenSwapAmount((e.target.value))}
            ></input>
          <select className={styles.select} onChange={(e) => setTokenValue(e.target.value)}>
            <option value="ETH">ETH</option>
            <option value="CryptoDev">CryptoDev</option>
          </select>
        </div>
        <div className={styles.description}>You will get x CryptoDev tokens</div>
        <button className={styles.button}>Swap {tokenValue == "ETH" ? "ETH" : "CryptoDev"}</button>
      </div>
    )
  }

  const renderManageLiquidityTab = () => {
    return ( 
      <div>
          <div className={styles.description}>Your balances :</div>
          <div className={styles.description}>{etherBalance} ETH</div>
          <div className={styles.description}>{tokenDevBalance} CryptoDev token</div>
          <div className={styles.description}>{LPBalance} CryptoDev LP tokens</div>
          <div className={styles.liquidityBoxes}>
            <input className={styles.input} type="number"
              placeholder="Amount of ETH"
              onChange={(e) => console.log((e.target.value))}
              ></input>
            <div className={styles.description}>You will need x CryptoDev tokens</div>
            <button className={styles.button}>Add liquidity</button>
          </div>
          <div className={styles.liquidityBoxes}>
            <input className={styles.input} type="number"
              placeholder="Amount of LP tokens"
              onChange={(e) => console.log((e.target.value))}></input>
            <div className={styles.description}>You will get x CryptoDev tokens and x ETH</div>
            <button className={styles.button}>Remove liquidity</button>
          </div>
      </div>
    )
  }
  
  return (
    <div>
      <Head>
        <title>DEX dApp</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to the CryptoDev DEX!</h1>
            <div className={styles.description}>Here you can exchange Ethereum and CryptoDev tokens!</div>
            <div className={styles.buttonDiv}>
              <button className={styles.button} onClick={() => setSelectedTab("Liquidity")}>Manage Liquidity</button>
              <button className={styles.button} onClick={() => setSelectedTab("Swap")}>Swap tokens</button>
            </div>
            {renderTabs()}
          </div>
            <img className={styles.image} src="./cryptodev.svg"></img>
      </div>

      <footer className={styles.footer}> Made with &#10084; by Purif </footer>
    </div>
  )
}
