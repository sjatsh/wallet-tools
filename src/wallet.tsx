import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import React, {useMemo, useRef, useState} from 'react';
import {Button, Col, notification} from "antd";
import {ethers} from "ethers";
import {CopyOutlined} from "@ant-design/icons";
import {SiEthereum} from "react-icons/si";
import "./global.d.ts";

let providerOptions: any = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: 'f62b13efac034161adb35e1b7cdbafeb',
        },
    }
}

const web3Modal = new Web3Modal({
    providerOptions,
    cacheProvider: true,
    disableInjectedProvider: false
})

const Wallet: React.FC = () => {

    const Context = React.createContext({name: 'Address'});
    const contextValue = useMemo(() => ({name: 'Copy Address'}), []);
    const [api, contextHolder] = notification.useNotification();

    const addressRef = useRef<HTMLDivElement | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
    const [address, setAddress] = useState("")
    const [showAddress, setShowAddress] = useState("")

    const connectWallet = async () => {
        web3Modal.connect().then(function (wallet) {
            const provider = new ethers.providers.Web3Provider(wallet)
            window.provider = provider

            setProvider(provider)
            addListeners(provider)

            provider.getSigner().getAddress().then(function (address) {
                setAddress(address)
                window.address = address

                let showAddr = address.substring(0, 6) + "..."
                showAddr += address.substring(address.length - 4, address.length)
                setShowAddress(showAddr)

                if (addressRef.current) {
                    addressRef.current.style.visibility = "visible"
                }
            })
        })
    }

    const connectWeb3Modal = async () => {
        if (web3Modal.cachedProvider) {
            web3Modal.clearCachedProvider()
        }
        await connectWallet()
    }

    const disconnectWeb3Modal = async () => {
        web3Modal.clearCachedProvider()
        setProvider(null)
    }

    async function addListeners(provider: ethers.providers.Web3Provider) {
        provider.addListener("accountsChanged", (accounts: string[]) => {
            console.log(accounts)
            setAddress(accounts[0] ? accounts[0] : "");
        });
        //
        // provider.addListener("chainChanged", (chainId: any) => {
        //     console.log(chainId)
        //     // window.location.reload()
        // });
        //
        provider.addListener("disconnect", function () {
            disconnectWeb3Modal()
        })
    }

    async function copyAddress() {
        await navigator.clipboard.writeText(address);
        api.info({
            message: `address copied`,
        });
    }

    return (
        <>
            <Col ref={addressRef} span={20} style={{visibility: "hidden", display: 'flex', justifyContent: 'flex-end'}}>
                <span><SiEthereum/></span>
                <span style={{paddingLeft: "8px"}}>{showAddress}</span>
                <Context.Provider value={contextValue}>
                    {contextHolder}
                    <span><CopyOutlined style={{paddingLeft: '8px'}} onClick={copyAddress}/></span>
                </Context.Provider>
            </Col>
            <Col span={4}>
                <Button type="primary" onClick={connectWeb3Modal}>
                    Connect Wallet
                </Button>
            </Col>
        </>
    )
}

export default Wallet;
