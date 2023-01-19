import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { providers, ethers, utils, BigNumber } from 'ethers'
import Web3Modal from "web3modal"
import { useState, useRef, useEffect, useReducer } from 'react'
import { LOTTERY_CONTRACT_ABI, LOTTERY_CONTRACT_ADDRESS } from '@/constants'
import { FETCH_CREATED_GAME } from "../queries";
import { subgraphQuery } from "../utils";

export default function Home() {
  const web3ModalRef = useRef()
  const [walletConnected, setWalletConnected] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [entryFee, setEntryFee] = useState(0)
  const [maxPlayers, setMaxPlayers] = useState(0)
  const [loading, setLoading] = useState(false)
  const [winner, setWinner] = useState("")
  const [players, setPlayers] = useState([])
  const [logs, setLogs] = useState([]);
  const [address, setAddress] = useState("")

  const forceUpdate = useReducer(() => ({}), {})[1];

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    let accounts = await web3Provider.send("eth_requestAccounts", []);
    let account = accounts[0];
    if(account != address) {setAddress(account)}

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
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

  const getOwner = async() => {
    try {
      let signer = await getProviderOrSigner(true);
      let address = await signer.getAddress()
      let lotteryContract = new ethers.Contract(LOTTERY_CONTRACT_ADDRESS, LOTTERY_CONTRACT_ABI, signer)
      let owner = await lotteryContract.owner();
      if(address == owner) {
        setIsOwner(true)
      }
      else {
        setIsOwner(false)
      }
    } catch (err) {
      console.error(err);
    }
  }

  const checkIfGameStarted = async() => {
    try {
      let provider = await getProviderOrSigner();
      let lotteryContract = new ethers.Contract(LOTTERY_CONTRACT_ADDRESS, LOTTERY_CONTRACT_ABI, provider)
      let result = await lotteryContract.gameStarted();

      const _gameArray = await subgraphQuery(FETCH_CREATED_GAME())
      const _game = _gameArray.games[0]
      let _logs = []

      if (result) {
        _logs = [`Game has started with ID: ${_game.id}`];
        if (_game.players && _game.players.length > 0) {
          _logs.push(
            `${_game.players.length} / ${_game.maxPlayers} already joined 👀 `
          );
          _game.players.forEach((player) => {
            _logs.push(`${player.substring(0,6)}...${player.substring(player.length-6)} joined 🏃‍♂️`);
          });
        }
        setEntryFee(BigNumber.from(_game.entryFee));
        setMaxPlayers(_game.maxPlayers);
      } else if (!result && _game.winner) {
        _logs = [
          `Last game ID: ${_game.id}`,
          `Winner is: ${_game.winner.substring(0,6)}...${_game.winner.substring(_game.winner.length-6)} 🎉 `,
          `Waiting for host to start new game....`,
        ];
        setWinner(_game.winner);
      }
      setLogs(_logs);
      setPlayers(_game.players);
      setGameStarted(result);
      forceUpdate();
      setGameStarted(result)
    } catch (err) {
      console.error(err);
    }
  }

  const startGame = async() => {
    try {
      let signer = await getProviderOrSigner(true);
      let lotteryContract = new ethers.Contract(LOTTERY_CONTRACT_ADDRESS, LOTTERY_CONTRACT_ABI, signer)
      setLoading(true)
      let result = await lotteryContract.startGame(maxPlayers, entryFee);
      await result.wait()
      setLoading(false)
      setGameStarted(true)
    } catch (err) {
      console.error(err);
    }
  }

  const joinGame = async() => {
    try {
      let signer = await getProviderOrSigner(true);
      let lotteryContract = new ethers.Contract(LOTTERY_CONTRACT_ADDRESS, LOTTERY_CONTRACT_ABI, signer)
      let result = await lotteryContract.joinGame({value: entryFee});
      setLoading(true)
      await result.wait()
      setLoading(false)
      checkIfGameStarted()
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
      });
      connectWallet();
      getOwner()
      checkIfGameStarted()
      setInterval(() => {
        checkIfGameStarted();
      }, 2000);
    }
  }, [walletConnected])

  useEffect(() => {
    getOwner()
    checkIfGameStarted()
  }, [address])


  const renderTabs = () => {
    //not connected
    if(!walletConnected) {
      return (
        <button className={styles.button} onClick={() => connectWallet()}>Connect wallet</button>
      )
    }

    if(loading) {
      return (<button className={styles.button} >Loading...</button>)
    }
    
    //owner, start game => check if no ongoing game first
    if(isOwner && !gameStarted) {
      return (
        <div>
          <div className={styles.inputDiv}>
            <input className={styles.input} type="number"
              placeholder="Entry fee in eth"
              onChange={async (e) => {setEntryFee(utils.parseEther(e.target.value.toString()))}}
            ></input>
            <input className={styles.input} type="number"
              placeholder="Max players"
              onChange={async (e) => {setMaxPlayers(e.target.value)}}></input>
          </div>
          <button className={styles.button} onClick={() => startGame()}>Start game</button>
        </div>
      )
    }

    //owner-player, join game
    if(gameStarted) {
      if (players.length === maxPlayers) {
        return (
          <button className={styles.button} disabled>
            Choosing winner...
          </button>
        );
      }
      return (
        <button className={styles.button} onClick={() => joinGame()}>Join game</button>
      )
    }

    //player, no game
    return (
      <div className={styles.description}>There is no game to join at the moment, wait for the owner to create one</div>
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
        <div className={styles.leftSide}>
          <h1 className={styles.title}>Welcome to the frens lottery!</h1>
          <div className={styles.description}>This is a lottery game where one random winner gets the entire lottery pool! </div>
          {renderTabs()}
          {logs &&
              logs.map((log, index) => (
                <div className={styles.description} key={index}>
                  {log}
                </div>
              ))}
        </div>
        <img className={styles.image} src="./nft.jpg"></img>
      </div>
      <footer className={styles.footer}> Made with &#10084; by Purif </footer>
    </div>
  )
}
