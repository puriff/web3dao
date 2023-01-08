import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { providers, Contract, ethers } from "ethers";
import { useEffect, useRef, useState } from "react";
import { NFT_COLLECTION_CONTRACT_ADDRESS, abi } from "../constants";
import Web3Modal from "web3modal"

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false)
  const [presaleStarted, setPresaleStarted] = useState(false)
  const [presaleEnded, setPresaleEnded] = useState(false)
  const [numberNFTMinted, setNumberNFTMinted] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(false)
  const web3ModalRef = useRef()

  //button to mint nft

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

  const getAmountOfNFTMinted = async () => {
    try {
      let provider = await getProviderOrSigner()
      let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, provider)
      let numberNFTMinted = await collectionContract.currentSupply()
      setNumberNFTMinted(numberNFTMinted)
      console.log(numberNFTMinted)
    } catch (error) {
      console.log(error)
    }
  }

  const getMaxSupply = async () => {
    try {
      let provider = await getProviderOrSigner()
      let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, provider)
      let totalSupply = await collectionContract.maxSupply()
      setMaxSupply(totalSupply)
    } catch (error) {
      console.log(error)
    }
  }

  const startPresale = async() => {
    try {
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      if(isOwner) {
        let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, signer)
        let tx = await collectionContract.startPresale()
        setLoading(true)
        await tx.wait();
        setLoading(false)
        await checkIfPresaleStarted();
      }
      else {
        console.log("You're not the owner")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfPresaleStarted = async () => {
    try {
      let provider = await getProviderOrSigner()
      let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, provider)
      let presaleStarted = await collectionContract.presaleStarted()
      if(!presaleStarted) {
        await getOwner()
      }
      setPresaleStarted(presaleStarted)
      return presaleStarted
    } catch (error) {
      console.log(error)
      return false
    }
  }

  const checkIfPresaleEnded = async () => {
    try {
      let provider = await getProviderOrSigner()
      let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, provider)
      let presaleEnded = await collectionContract.presaleEnded()
      const hasEnded = presaleEnded.lt(Math.floor(Date.now() / 1000));
      setPresaleEnded(hasEnded)
      return hasEnded
    } catch (error) {
      console.log(error)
      return false
    }
  }

  const getOwner = async () => {
    try {
      let provider = await getProviderOrSigner()
      let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, provider)
      let owner = await collectionContract.owner()
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const presaleMint = async () => {
    try {
      let signer = await getProviderOrSigner(true)
      if(presaleStarted && !presaleEnded) {
        let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, signer)
        let tx = await collectionContract.presaleMint()
        setLoading(true)
        await tx.wait()
        setLoading(false)
        window.alert("You minted a happy frens group!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const publicMint = async () => {
    try {
      let signer = await getProviderOrSigner(true)
      if(presaleStarted && presaleEnded) {
        let collectionContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, abi, signer)
        let tx = await collectionContract.publicMint()
        setLoading(true)
        await tx.wait()
        setLoading(false)
        window.alert("You minted a happy frens group!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      getAmountOfNFTMinted()
      getMaxSupply()

      const presaleStarted = checkIfPresaleStarted();
      console.log(presaleStarted)
      if (presaleStarted) {
        checkIfPresaleEnded();
      }

      //check presale state every 5s
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        console.log(presaleStarted)
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      //check for newly minted nfts
      setInterval(async function () {
        await getAmountOfNFTMinted();
      }, 5 * 1000);
    }
}, [walletConnected]);

const renderButton = () => {
  if(!walletConnected) {
    return (
        <button className={styles.mintButton} onClick={connectWallet}>
          Connect your wallet
        </button>
    )
  }

  if(loading) {
    return (
      <button className={styles.mintButton}>
            Waiting...
      </button>
    )
  }

  if(isOwner && !presaleStarted) {
    return (
      <button className={styles.mintButton} onClick={startPresale}>
          Start the presale
      </button>
    )
  }

  if(!presaleStarted) {
    return (
      <button className={styles.mintButton}>
          Presale hasn't started
      </button>
    )
  }

  if (presaleStarted && !presaleEnded) {
    return (
      <div>
        <button className={styles.mintButton} onClick={presaleMint}>
          Presale Mint 🚀
        </button>
      </div>
    );
  }

  if (presaleEnded) {
    return (
      <div>
        <button className={styles.mintButton} onClick={publicMint}>
          Public Mint 🚀
        </button>
      </div>
    );
  }

}

  return (
    <div>
      <Head>
        <title>NFT Collection dApp</title>
        <meta name="description" content="NFT Collection dApp" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Frens Devs!</h1>
            <div className={styles.description}>
              Its an NFT collection for dev frens in Crypto.
            </div>
            <div className={styles.description}>
              {numberNFTMinted} / {maxSupply} have been minted
            </div>
            {renderButton()}
        </div>
        <div>
            <img className={styles.image} src="https://i.ytimg.com/vi/Dqg21yQwCzo/maxresdefault.jpg"></img>
        </div>
      </div>
        
      <footer className={styles.footer}>
        Made with &#10084; by Purif
      </footer>
    </div>
  )
}
