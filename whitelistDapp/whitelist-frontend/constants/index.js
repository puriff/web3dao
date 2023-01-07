export const WHITELIST_CONTRACT_ADDRESS = "0x8e7F9d61AD0f58aB7b2e1aE9ba2BD2918eEE59CB";
export const abi = [
        "function addToWhitelist() external",
        "function isWhitelisted(address _addrToCheck) external view returns (bool)",
        "function maxWhitelistedAddresses() external view returns (uint8)",
        "function numAddressesWhitelisted() external view returns (uint8)",
        "function whitelistedAddress(address) external view returns (bool)"
]