import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
} from "../constants";

export const getAmountOfTokenReceivedFromSwap = async(provider, swapAmount, ethSelected, ethBalance, CDBalance) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider)
        let amountToken
        if(ethSelected) {
            amountToken = await exchangeContract.getAmountOfTokens(swapAmount, ethBalance, CDBalance)
        }
        else {
            amountToken = await exchangeContract.getAmountOfTokens(swapAmount, CDBalance, ethBalance)
        }
        return amountToken
    }
    catch(error) {
        console.log(error)
    }
}

export const swapTokens = async(provider, swapAmount, outputAmount, ethSelected) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider)
        let tx
        if(ethSelected) {
            tx = await exchangeContract.swapETHToCryptoDev(outputAmount, {value: swapAmount})
        }
        else {
            tx = await tokenContract.approve(EXCHANGE_CONTRACT_ADDRESS,swapAmount.toString());
            await tx.wait();
            tx = await exchangeContract.cryptoDevTokenToEth(swapAmount,outputAmount);
        }
        await tx.wait()
    }
    catch(error) {
        console.log(error)
    }
}