import {providers} from "ethers";

declare global {
    interface Window {
        address: string;
        wallet: any;
        provider: any;
    }
}

export {}