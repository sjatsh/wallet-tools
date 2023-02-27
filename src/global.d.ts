declare global {
    interface Window {
        address: string;
        wallet: any;
        provider: any;
        chainId: any;
    }
}

export {}