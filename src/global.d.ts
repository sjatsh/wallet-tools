import {ethers} from "ethers";

declare global {
    interface Window {
        address: string;
        provider: ethers.providers.Web3Provider;
    }
}

export {}