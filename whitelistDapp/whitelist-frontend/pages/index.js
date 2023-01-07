import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract, ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [numberAddressWhitelisted, setNumberAddressWhitelisted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false)
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
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

  const checkIfAddressInWhitelist = async () => {
    try {
      let signer = await getProviderOrSigner(true)
      let whitelistContract = new ethers.Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer)
      let address = await signer.getAddress()
      let checkIfWhitelisted = await whitelistContract.isWhitelisted(address)
      setIsWhitelisted(checkIfWhitelisted)
    } catch (error) {
      console.log(error)
    }
  }

  const getNumberOfWhitelisted = async () => {
    try {
      let provider = await getProviderOrSigner()
      let whitelistContract = new ethers.Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider)
      let numberAddressWhitelisted = await whitelistContract.numAddressesWhitelisted()
      setNumberAddressWhitelisted(numberAddressWhitelisted)
    } catch (error) {
      console.log(error)
    }
  }

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.addToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  }

  const renderButton = () => {
    if (walletConnected) {
      if (isWhitelisted) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
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
      }
  }, [walletConnected]);

  return (
    <div >
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
            <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
            <div className={styles.description}>
              Its an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {numberAddressWhitelisted} have already joined the Whitelist
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image} src="./crypto-devs.svg" />
          </div>
        </div>

        <footer className={styles.footer}>
          Made with &#10084; by Purif
        </footer>
    </div>
  )

}