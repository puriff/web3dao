import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Web3Modal from "web3modal"
import { providers, Contract, ethers, utils, BigNumber } from "ethers";
import { TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI } from "../constants";
import { EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI } from "../constants";
import { useEffect, useState, useRef } from 'react'
import {calculateCD, addLiquidity} from "./utils/addLiquidity"
import {getTokensAfterRemove, removeLiquidity} from "./utils/removeLiquidity"
import {getEtherBalance, getDevTokenBalance, getLPBalance, getReserveCDTokens} from "./utils/getAmount"
import {getAmountOfTokensReceivedFromSwap, swapTokens} from "./utils/swap"

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false)
  const [tokenDevBalance, setTokenDevBalance] = useState(0)
  const [etherBalance, setEtherBalance] = useState(0)
  const [LPBalance, setLPBalance] = useState(0)
  const [reserveCDToken, setReserveCDToken] = useState(0)
  const [ethBalanceContract, setEtherBalanceContract] = useState(0)
  const [selectedTab, setSelectedTab] = useState("Liquidity")
  const [tokenValue, setTokenValue] = useState("ETH")
  const [swapAmount, setSwapAmount] = useState(0)
  const [outputAmount, setOutputAmount] = useState(0)
  const [addCDTokens, setAddCDTokens] = useState(0)
  const [addEther, setAddEther] = useState(0);
  const [removeLPTokens, setRemoveLPTokens] = useState(0)
  const [removeCDTokens, setRemoveCDTokens] = useState(0)
  const [removeEther, setRemoveEther] = useState(0)
  const [ethSelected, setETHSelected] = useState(true)
  const [loading, setLoading] = useState(false)
  const web3ModalRef = useRef()
  var zero = BigNumber.from("0")

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

  const getAmounts = async() => {
    try {
      let provider = await getProviderOrSigner(false)
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      let ethBalance = await getEtherBalance(signer, address, false)
      let devTokenBalance = await getDevTokenBalance(signer, address)
      let LPBalance = await getLPBalance(signer, address)
      let reserveCDToken = await getReserveCDTokens(signer, address)
      let ethBalanceContract = await getEtherBalance(provider, null, true)
      setEtherBalance(ethBalance)
      setTokenDevBalance(devTokenBalance)
      setLPBalance(LPBalance)
      setReserveCDToken(reserveCDToken)
      setEtherBalanceContract(ethBalanceContract)
    } catch (err) {
      console.error(err);
    }
  }

  const _swapTokens = async() => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);
      if (!swapAmountWei.eq(0)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swapTokens(
          signer,
          swapAmountWei,
          outputAmount,
          ethSelected
        );
        setLoading(false);
        await getAmounts();
        setSwapAmount("");
      }
    } catch(error) {
      console.log(error)
      setLoading(false);
      setSwapAmount("");
    }
  }

  const _getSwapOutputAmount = async(_swapAmount) => {
    try {
      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());
      if (!_swapAmountWEI.eq(0)) {
        const provider = await getProviderOrSigner();
        const _ethBalance = await getEtherBalance(provider, null, true);
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          provider,
          _swapAmountWEI,
          ethSelected,
          _ethBalance,
          reserveCDToken
        );
        setOutputAmount(amountOfTokens);
      } else {
        setOutputAmount(0);
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  const _addLiquidity = async() => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString());
      if (!addCDTokens.eq(zero) && !addEtherWei.eq(0)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);
        setAddCDTokens(zero);
        await getAmounts();
      } else {
        setAddCDTokens(zero);
      }
    } catch (error) {
      console.log(error)
      setLoading(false);
      setAddCDTokens(zero);
    }
  }

  const _removeLiquidity = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
      await getAmounts();
      setRemoveCDTokens(0);
      setRemoveEther(0);
    } catch (error) {
      console.error(err);
      setLoading(false);
      setRemoveCDTokens(0);
      setRemoveEther(0);
    }
  }

  const _getTokensAfterRemove = async(_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEtherBalance(provider, null, true);
      const cryptoDevTokenReserve = await getReserveCDTokens(provider);
      const results = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        cryptoDevTokenReserve
      );
      setRemoveEther(results[0]);
      setRemoveCDTokens(results[1]);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getAmounts()
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
            onChange={async (e) => {setSwapAmount((e.target.value))
                              await _getSwapOutputAmount(e.target.value)
                              }}
            value={swapAmount}
            ></input>
          <select className={styles.select} onChange={async() => {setETHSelected(!ethSelected)
                                                                await _getSwapOutputAmount(0)
                                                                setSwapAmount("");}}>
            <option value="ETH">ETH</option>
            <option value="CryptoDev">CryptoDev</option>
          </select>
        </div>
        <div className={styles.description}>You will get {utils.formatEther(outputAmount)} {ethSelected ? "CryptoDev" : "Eth"} tokens</div>
        <button className={styles.button} onClick={() => _swapTokens()}>Swap {ethSelected ? "ETH" : "CryptoDev"}</button>
      </div>
    )
  }

  const renderManageLiquidityTab = () => {
    return ( 
      <div>
          <div className={styles.description}>Your balances :</div>
          <div className={styles.description}>{Number(utils.formatEther(etherBalance)).toFixed(3)} ETH</div>
          <div className={styles.description}>{utils.formatEther(tokenDevBalance)} CryptoDev token</div>
          <div className={styles.description}>{utils.formatEther(LPBalance)} CryptoDev LP tokens</div>
          {utils.parseEther(reserveCDToken.toString()).eq(0) ? ( 
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.inputInitialLiq}
                />
                <input
                  type="number"
                  placeholder="Amount of CryptoDev tokens"
                  onChange={(e) =>
                    setAddCDTokens(
                      BigNumber.from(utils.parseEther(e.target.value || "0"))
                    )
                  }
                  className={styles.inputInitialLiq}
                />
                <button className={styles.button} onClick={_addLiquidity}>
                  Add liquidity
                </button>
              </div>
            ) :
            <div>
              <div className={styles.liquidityBoxes}>
                <input className={styles.input} type="number"
                  placeholder="Amount of ETH"
                  onChange={async(e) => {setAddEther(e.target.value || "0");
                          const _addCDTokens = await calculateCD(
                            e.target.value || "0",
                            ethBalanceContract,
                            reserveCDToken
                          );
                          setAddCDTokens(_addCDTokens);
                  }}
                  ></input>
                <div className={styles.description}>{"You will need "+utils.formatEther(addCDTokens)+" CryptoDev tokens"}</div>
                <button className={styles.button} onClick={() => _addLiquidity()}>Add liquidity</button>
              </div>
              <div className={styles.liquidityBoxes}>
              <input className={styles.input} type="number"
                placeholder="Amount of LP tokens"
                onChange={async(e) => {setRemoveLPTokens(e.target.value || "0");
                                      await _getTokensAfterRemove(e.target.value)
                                      }}
              ></input>
              <div className={styles.description}>{"You will get "+(utils.formatEther(removeCDTokens)) +" CryptoDev tokens and "+(utils.formatEther(removeEther)) +" ETH"}</div>
              <button className={styles.button} onClick={() => _removeLiquidity()}>Remove liquidity</button>
            </div>
          </div>
          }
          
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
