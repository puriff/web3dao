import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../../constants";

export const calculateCD = async(_addEther = "0", etherBalanceContract, CDTokenReserve) => {
    const _addEtherAmountWei = utils.parseEther(_addEther)
    const cryptoDevTokenAmount = _addEtherAmountWei.mul(CDTokenReserve).div(etherBalanceContract)
    return cryptoDevTokenAmount
}

export const addLiquidity = async(provider, CDTokenAmount, etherAmount) => {
    try {
        const exchangeContract = new Contract(EXCHANGE_CONTRACT_ADDRESS, EXCHANGE_CONTRACT_ABI, provider)
        const tokenDevContract = new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_CONTRACT_ABI, provider)
        let approve = await tokenDevContract.approve(EXCHANGE_CONTRACT_ADDRESS, CDTokenAmount)
        await approve.wait()
        let addLiquidity = await exchangeContract.addLiquidity(CDTokenAmount, {value: etherAmount})
        await addLiquidity.wait()
    }
    catch (error) {
        console.log(error)
    }
}