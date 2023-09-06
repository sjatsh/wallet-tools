import {ConnectDID} from "connect-did-sdk";

declare global {
    interface Window {
        address: string;
        wallet: any;
        provider: any;
        chainId: any;
        connectDID: any;
    }
}

export {}