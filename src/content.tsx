import TextArea from "antd/es/input/TextArea";
import {Button, notification, Row, Switch} from "antd";
import React, {useMemo, useState} from "react";
import {ConnectDID} from "connect-did-sdk";
import {SwitchChangeEventHandler} from "antd/es/switch";

const SignContent: React.FC = () => {
    const [signMsg, setSignMsg] = useState("")
    const [signRes, setSignRes] = useState("")
    const [eip712, setEip712] = useState(false)
    const Context = React.createContext({name: 'SignRes'});
    const contextValue = useMemo(() => ({name: 'Copy Sign Result'}), []);
    const [api, contextHolder] = notification.useNotification();

    async function signMsgChange(e: any) {
        const signMsg = e.target.value
        setSignMsg(signMsg)
        if (signRes !== "") {
            setSignRes("")
        }
    }

    async function copySignRes() {
        if (signRes !== "") {
            await navigator.clipboard.writeText(signRes);
            api.info({
                message: `sign result copied`,
            });
        }
    }

    async function personalSign() {
        const {provider, address} = window
        if (!address) {
            api.error({message: "Please connect wallet before"})
            return
        }
        provider.send("personal_sign", [address.toLowerCase(), signMsg]).then(function (res: any) {
            setSignRes(res)
        }).catch(function (err: any) {
            if (err.code === 4001 || err.code === "ACTION_REJECTED") {
                return
            }
            api.error({
                "message": JSON.stringify({"code": err.code, "message": err.message}),
            })
        })
    }

    async function webAuthnSign() {
        try {
            const signData = await window.connectDID.requestSignData({
                msg: signMsg,
            });
            if (signData.code !== 2000) {
                api.error({message: signData.message})
                return
            }
            setSignRes(signData.data)
        } catch (e: any) {
            console.warn(e)
            return
        }
    }

    async function eip712Sign() {
        const {provider, address} = window
        if (!address) {
            api.error({message: "Please connect wallet before"})
            return
        }
        const mmJson = JSON.parse(signMsg)

        if (provider && mmJson.domain.chainId && mmJson.domain.chainId != provider.network.chainId) {
            await provider.send(
                "wallet_switchEthereumChain",
                [{"chainId": '0x' + mmJson.domain.chainId}]).then(function (res: any) {
                console.log(res)
            }).catch(function (err: any) {
                console.error(err)
            })
        }

        provider.send("eth_signTypedData_v4", [address.toLowerCase(), signMsg]).then(function (res: any) {
            setSignRes(res)
        }).catch(function (err: any) {
            if (err.code === 4001 || err.code === "ACTION_REJECTED") {
                return
            }
            api.error({
                "message": JSON.stringify({"code": err.code, "message": err.message}),
            })
        })
    }

    const netSwitch = (checked: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log(checked)
        window.connectDID = new ConnectDID(checked);
    }

    function SignButton() {
        return (<div>
                <Button type={"primary"} onClick={personalSign} style={{margin: "5px"}}>
                    Personal
                </Button>
                <Button type={"primary"} onClick={eip712Sign} style={{margin: "5px"}}>
                    EIP712
                </Button>
                <Button type={"primary"} onClick={webAuthnSign} style={{margin: "5px"}}>
                    WebAuthn
                </Button>
                <Switch checkedChildren="TestNet" unCheckedChildren="MainNet" defaultChecked onChange={netSwitch}/>
            </div>
        )
    }


    return (
        <>
            <div style={{
                padding: "2px",
                borderRadius: "18px",
                background: "linear-gradient(90deg,#00df9b,#0e7dff 50%)",
            }}>
                <TextArea
                    onChange={signMsgChange}
                    placeholder="sign msg"
                    autoSize={{minRows: 3, maxRows: 10}}
                    style={{borderRadius: "16px"}}
                />
            </div>

            <Row style={{paddingTop: "10px"}}>
                <SignButton/>
            </Row>

            <Row style={{paddingTop: "10px"}}>
                <Context.Provider value={contextValue}>
                    {contextHolder}
                    <a style={{wordBreak: "break-all"}} onClick={copySignRes}>
                        {signRes}
                    </a>
                </Context.Provider>
            </Row>

        </>
    )
}

export default SignContent;