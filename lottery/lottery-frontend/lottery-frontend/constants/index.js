export const LOTTERY_CONTRACT_ADDRESS = "0x4d0c53fdeD427372D3c2776f346BB6545e6FD487"
export const LOTTERY_CONTRACT_ABI = [
    "function gameId() external view returns (uint256)",
    "function gameStarted() external view returns (bool)",
    "function joinGame() external payable",
    "function owner() external view returns (address)",
    "function players(uint256) external view returns (address)",
    "function startGame(uint8 _maxPlayers, uint256 _entryFee) external",
]