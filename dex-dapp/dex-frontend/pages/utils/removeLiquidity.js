import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
} from "../constants";

export const getTokensAfterRemove = async(provider, LPTokensAmount, ethReserve, CDReserves) => {
    const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider)
    const totalSupply = await exchangeContract.totalSupply()
    const ethAmount = (ethReserve.mul(LPTokensAmount)).div(totalSupply)
    const tokenAmount = (CDReserves.mul(LPTokensAmount)).div(totalSupply)
    return {ethAmount, tokenAmount}
}

export const removeLiquidity = async(provider, LPTokensAmount) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider)
        let removeLiquidityTx = await exchangeContract.removeLiquidity(LPTokensAmount)
        await removeLiquidityTx.wait()
    }
    catch (error) {
        console.log(error)
    }
}