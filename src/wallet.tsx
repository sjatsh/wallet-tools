import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Col, notification} from "antd";
import {CopyOutlined} from "@ant-design/icons";
import {SiEthereum} from "react-icons/si";
import "./global.d.ts";
import {providers} from "ethers";

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
    disableInjectedProvider: false,
})

const Wallet: React.FC = () => {

    const Context = React.createContext({name: 'Address'});
    const contextValue = useMemo(() => ({name: 'Copy Address'}), []);
    const [api, contextHolder] = notification.useNotification();

    const addressRef = useRef<HTMLDivElement | null>(null);
    const [address, setAddress] = useState("")
    const [showAddress, setShowAddress] = useState("")

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            web3Modal.connect().then(function (wallet) {
                addListeners(wallet)
                window.wallet = wallet

                const provider = new providers.Web3Provider(wallet)
                window.provider = provider
                showAddressEle()
            }).catch(function (err) {
                console.log(err)
            })
        }
    })

    const connectWallet = async () => {
        if (web3Modal.cachedProvider) {
            web3Modal.clearCachedProvider()
        }

        web3Modal.connect().then(function (wallet) {
            addListeners(wallet)
            window.wallet = wallet

            const provider = new providers.Web3Provider(wallet)
            window.provider = provider
            showAddressEle()
        })
    }

    const showAddressEle = async () => {
        if (window.provider) {
            window.provider.getSigner().getAddress().then(function (address) {
                setAddress(address)
                window.address = address

                let showAddr = address.substring(0, 6) + "..."
                showAddr += address.substring(address.length - 4, address.length)
                setShowAddress(showAddr)

                if (addressRef.current) {
                    addressRef.current.style.visibility = "visible"
                }
            });
        }
    }

    const disconnectWeb3Modal = async () => {
        web3Modal.clearCachedProvider()
        setAddress("");
        window.address = ""
    }

    async function addListeners(wallet: any) {
        wallet.on("accountsChanged", (accounts: string[]) => {
            const address = accounts[0] ? accounts[0] : ""
            setAddress(address);
            window.address = address
        });

        wallet.on("chainChanged", (chainId: any) => {
            window.provider.network.chainId = chainId
            window.wallet.chainId = chainId
        });

        wallet.on("disconnect", function () {
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
                <Button type="primary" onClick={connectWallet}>
                    Connect Wallet
                </Button>
            </Col>
        </>
    )
}

export default Wallet;
