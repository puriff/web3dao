import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { providers, Contract, ethers, utils } from "ethers";
import { useEffect, useRef, useState } from "react";
import { MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_ABI } from "../constants";
import { DAO_CONTRACT_ADDRESS, DAO_ABI } from "../constants";
import { NFT_COLLECTION_CONTRACT_ADDRESS, NFT_ABI } from "../constants";
import Web3Modal from "web3modal"


export default function Home() {

  const [walletConnected, setWalletConnected] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [DAOBalance, setDAOBalance] = useState(0)
  const [nftBalance, setNFTBalance] = useState(0)
  const [numberProposals, setNumberProposals] = useState(0)
  const [fakeNftTokenId, setFakeNftTokenId] = useState(0)
  const [proposals, setProposals] = useState([])
  const [selectedTab, setSelectedTab] = useState()

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

  const getDAOETHBalance = async() => {
    try {
      let provider = await getProviderOrSigner()
      let balance = await provider.getBalance(DAO_CONTRACT_ADDRESS)
      let readableBalance = toReadableValue(balance)
      setDAOBalance(readableBalance)
    } catch(error) {
      console.log(error)
    }
  }

  const getCryptoDevNFTsBalance = async() => {
    try {
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      let cryptoDevsNFTsContract = new ethers.Contract(NFT_COLLECTION_CONTRACT_ADDRESS, NFT_ABI, signer)
      let nftBalance = await cryptoDevsNFTsContract.balanceOf(address)
      setNFTBalance(Number(nftBalance))
    } catch(error) {
      console.log(error)
    }
  }

  const getNumberOfProposals = async() => {
    try {
      let provider = await getProviderOrSigner()
      let daoContract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, provider)
      let numberProposals = await daoContract.numberProposals()
      setNumberProposals(Number(numberProposals))
    } catch(error) {
      console.log(error)
    }
  }

  const getDAOOwner = async() => {
    try {
      let signer = await getProviderOrSigner(true)
      let address = await signer.getAddress()
      let daoContract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signer)
      let daoOwner = await daoContract.owner()
      console.log(daoOwner)
      if(daoOwner == address) {
        setIsOwner(true)
      }
    } catch(error) {
      console.log(error)
    }
  }

  const withdrawTreasury = async() => {
    try {
      if(isOwner) {
        let signer = await getProviderOrSigner(true)
        let address = await signer.getAddress()
        let daoContract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signer)
        let tx = await daoContract.withdrawFunds()
        setLoading(true)
        await tx.wait()
        setLoading(false)
        getDAOETHBalance()
      }
    } catch(error) {
      console.log(error)
    }
  }

  const createProposal = async() => {
    try {
      if(nftBalance > 0) {
        let signer = await getProviderOrSigner(true)
        let daoContract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signer)
        const txn = await daoContract.createProposal(fakeNftTokenId);
        setLoading(true);
        await txn.wait();
        await getNumberOfProposals();
        setLoading(false);
      }
    } catch(error) {
      console.log(error)
    }
  }

  const getProposalById = async (proposalId) => {
    try {
      let provider = await getProviderOrSigner()
      let daoContract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, provider)
      let proposal = await daoContract.proposals(proposalId)
      console.log(proposal)
      const parsedProposal = {
        proposalId: proposalId,
        nftTokenId: proposal.nftTokenId.toString(),
        deadline: new Date(parseInt(proposal.deadline.toString()) * 1000),
        yayVotes: proposal.votesYes.toString(),
        nayVotes: proposal.votesNo.toString(),
        executed: proposal.executed,
      };
      return parsedProposal
    } catch(error) {
      console.log(error)
    }
  }

  const getAllProposals = async() => {
    try {
      let proposals = []
      for (let index = 0; index < numberProposals; index++) {
        let proposal = await getProposalById(index)
        proposals.push(proposal)
      } 
      setProposals(proposals)
      return proposals
    } catch(error) {
      console.log(error)
    }
  }

  const voteOnProposal = async(proposalId, vote) => {
    try {
      if(nftBalance > 0) {
        let signer = await getProviderOrSigner(true)
        let address = await signer.getAddress()
        let daoContract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signer)
        let voteBool = vote === "YAY" ? 0 : 1;
        let tx = await daoContract.voteOnProposal(proposalId, voteBool)
        setLoading(true)
        await tx.wait()
        setLoading(false)
        await getAllProposals()
      }
    } catch(error) {
      console.log(error)
    }
  }

  const executeProposal = async(proposalId) => {
    try {
      if(nftBalance > 0) {
        let signer = await getProviderOrSigner(true)
        let address = await signer.getAddress()
        let daoContract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signer)
        let tx = await daoContract.executeProposal(proposalId)
        setLoading(true)
        await tx.wait()
        setLoading(false)
        await getAllProposals()
        await getDAOETHBalance()
      }
    } catch(error) {
      console.log(error)
    }
  }

  const toReadableValue = (bignumber) => {
    return Number(bignumber / Math.pow(10,18))
  }

  useEffect(() => {
    if(!walletConnected)
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getDAOETHBalance()
      getCryptoDevNFTsBalance()
      getNumberOfProposals()
      getAllProposals()
      getDAOOwner()
  }, [walletConnected])

  useEffect(() => {
    if (selectedTab === "View Proposals") {
      getAllProposals();
    }
  }, [selectedTab]);

  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  function renderCreateProposalTab() {
    if(loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      )
    }
    else if(nftBalance < 1) {
      return (
        <div className={styles.description}>
          You need a CryptoDev NFT to be able to create a proposal
        </div>
      )
    }
    else if(nftBalance > 0) {
      return (
        <div className={styles.tabs}>
          <div>
            <label className={styles.description}>Token ID to Purchase: </label>
            <input
              type="number"
              placeholder="Token ID"
              onChange={(e) => setFakeNftTokenId((e.target.value))}
              className={styles.input}
            />
          </div>
          <button className={styles.button} onClick={() => createProposal(numberProposals)} disabled={!(fakeNftTokenId != null)}>Create proposal</button>
        </div>
      )
    }
  }

  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    }
    return (
      <div className={styles.tabs}>
        {proposals.map((item, index) => ( 
          <div className={styles.proposal}>
            <h1 className={styles.title}>Proposal {item.proposalId}</h1>
            <div className={styles.description}>Token ID to buy : {item.nftTokenId.toString()}</div>
            <div className={styles.description}>Executed : {item.executed.toString()}</div>
            <div className={styles.description}>Deadline : {item.deadline.toLocaleString()}</div>
            <div className={styles.description}>YES : {item.yayVotes != null ? item.yayVotes : 0} - NO : {item.nayVotes != null ? item.nayVotes : 0}</div>
            {item.deadline.getTime() > Date.now() && !item.executed ? (
                <div className={styles.buttonDivProposal}>
                  <button className={styles.button} onClick={() => voteOnProposal(item.proposalId, "YAY")}>VOTE YES</button>
                  <button className={styles.button} onClick={() => voteOnProposal(item.proposalId, "NAY")}>VOTE NO</button>
                </div>
                ) : item.deadline.getTime() < Date.now() && !item.executed ? (
                  <div className={styles.buttonDivProposal}>
                    <button className={styles.button} onClick={() => executeProposal(item.proposalId)}>EXECUTE PROPOSAL {item.yayVotes > item.nayVotes ? "(YAY)" : "(NAY)"}</button>
                  </div>
                ) : (
                <div className={styles.description}>Proposal Executed</div>
                )
            }
          </div>
        ))} 
      </div>
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
          <div>
            <h1 className={styles.title}> Welcome to the CryptoDev DAO</h1>
            <div className={styles.description}>Here you can create and vote on proposals!</div>
            <div className={styles.description}>DAO treasury : {DAOBalance} ETH</div>
            <div className={styles.description}>You have {nftBalance} CryptoDev NFTs </div>
            <div className={styles.description}>{numberProposals} proposals have been created so far!</div>
            <div className={styles.buttonDiv}>
              <button className={styles.button} onClick={() => setSelectedTab("Create Proposal")}>Create proposal</button>
              <button className={styles.button} onClick={() => setSelectedTab("View Proposals")}>View proposals</button>
            </div>
            {renderTabs()}
          </div>
          <img className={styles.image} src="/read.png" ></img>

      </div>

    </div>
  )
}
