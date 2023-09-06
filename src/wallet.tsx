import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Button, Col, notification} from "antd";
import {CopyOutlined} from "@ant-design/icons";
import {SiEthereum} from "react-icons/si";
import "./global.d.ts";
import {providers} from "ethers";
import {ConnectDID} from "connect-did-sdk";

const providerOptions: any = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: process.env.REACT_APP_INFURA_ID,
            autoRefreshOnNetworkChange: true,
        },
    },
}

const web3Modal = new Web3Modal({
    providerOptions,
    cacheProvider: true,
    disableInjectedProvider: false,
})

const Wallet: React.FC = () => {
    const [api, contextHolder] = notification.useNotification();
    const Context = React.createContext({name: 'Address'});
    const contextValue = useMemo(() => ({name: 'Copy Address'}), []);
    const [address, setAddress] = useState("")
    const [showAddress, setShowAddress] = useState("")
    const [inited, setInited] = useState(false)
    const [chainIdIcon, setChainIdIcon] = useState<any>()
    const addressRef = useRef<HTMLDivElement | null>(null);
    window.connectDID = new ConnectDID();

    useEffect(() => {
        if (inited) {
            return
        }
        setInited(true)
        if (!web3Modal.cachedProvider) {
            return
        }
        web3Modal.connect().then(function (wallet) {
            connect(wallet)
        }).catch(function (err) {
            console.error(err)
        })
    })

    const connectWallet = async () => {
        if (web3Modal.cachedProvider) {
            web3Modal.clearCachedProvider()
        }
        web3Modal.connect().then(function (wallet) {
            connect(wallet)
        })
    }

    function connect(wallet: any) {
        window.wallet = wallet
        addListeners(wallet)
        window.chainId = wallet.chainId
        chainIcon()
        window.provider = new providers.Web3Provider(wallet)
        showAddressEle()
    }

    const showAddressEle = () => {
        if (!window.provider) {
            return
        }
        window.provider.getSigner().getAddress().then(function (address: any) {
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

    const disconnectWeb3Modal = () => {
        if (window.wallet) {
            window.wallet.disconnect()
        }
        window.wallet = null
        window.provider = null
        window.address = ""
        web3Modal.clearCachedProvider()
        setAddress("");
    }

    function addListeners(wallet: any) {
        wallet.on("accountsChanged", (accounts: string[]) => {
            const address = accounts[0] ? accounts[0] : ""
            setAddress(address);
            window.address = address
        });

        wallet.on("chainChanged", (chainId: any) => {
            window.chainId = chainId
            chainIcon()
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

    function chainIcon() {
        switch (window.chainId) {
            case "0x1":
            case "0x5":
                setChainIdIcon(<SiEthereum/>)
        }
    }

    return (
        <>
            <Col ref={addressRef} span={20} style={{visibility: "hidden", display: 'flex', justifyContent: 'flex-end'}}>
                <div>{chainIdIcon}</div>
                <div style={{paddingLeft: "8px"}}>{showAddress}</div>
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
