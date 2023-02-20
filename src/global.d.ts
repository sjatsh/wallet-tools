import {providers} from "ethers";

declare global {
    interface Window {
        address: string;
        wallet: any;
        provider: providers.Web3Provider;
    }
}

export {}