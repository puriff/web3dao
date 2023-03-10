import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../../constants";

export const getEtherBalance = async(provider, address, contract = false) => {
    try {
      if(contract) {
        const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS)
        return balance
      }
      else {
        const balance = await provider.getBalance();
        return balance
      }
    } catch (err) {
      console.log(err)
    }
  }

export const getDevTokenBalance = async(provider, address) => {
    try {
        let tokenDevContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider)
        let balance = await tokenDevContract.balanceOf(address);
        return balance
    } catch (err) {
        console.log(err)
    }
}

export const getLPBalance = async(provider, address)=> {
    try {
      let exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider)
      let balance = await exchangeContract.balanceOf(address);
      return balance
    } catch (err) {
      console.log(err)
    }
  }

export const getReserveCDTokens = async(provider, address) => {
    try {
        let exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider)
        let reserve = await exchangeContract.getReserves();
        return reserve
      } catch (err) {
        console.log(err)
      }
  }