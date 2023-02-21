import TextArea from "antd/es/input/TextArea";
import {Button, notification, Row} from "antd";
import React, {useMemo, useState} from "react";

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

        try {
            let signMsgObj = JSON.parse(signMsg)
            if (signMsgObj.data) {
                signMsgObj = signMsgObj.data
            }

            let mmJson = signMsgObj
            if (signMsgObj.mm_json) {
                mmJson = signMsgObj.mm_json
            }
            if (signMsgObj.sign_list.length > 0) {
                mmJson.message.digest = signMsgObj.sign_list[0].sign_msg
            }

            if (mmJson.types.EIP712Domain.length > 0 &&
                mmJson.primaryType !== "" &&
                mmJson.domain && mmJson.message) {
                setEip712(true)
                setSignMsg(JSON.stringify(mmJson))
            } else {
                setEip712(false)
            }

        } catch (e) {
            setEip712(false)
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

        provider.getSigner().signMessage(signMsg).then(function (res) {
            setSignRes(res)
        }).catch(function (err) {
            if (err.code === 4001 || err.code === "ACTION_REJECTED") {
                return
            }
            api.error({
                "message": JSON.stringify({"code": err.code, "message": err.message}),
            })
        })
    }

    async function eip712Sign() {
        const {provider, address} = window
        if (!address) {
            api.error({message: "Please connect wallet before"})
            return
        }
        const mmJson = JSON.parse(signMsg)

        if (provider && mmJson.domain.chainId && mmJson.domain.chainId != provider.network.chainId) {
            provider.send(
                "wallet_switchEthereumChain",
                [{"chainId": '0x' + mmJson.domain.chainId}]).then(function (res) {
                console.log(res)
            }).catch(function (err) {
                console.log(err)
            })
        }

        provider.send("eth_signTypedData_v4", [address.toLowerCase(), signMsg]).then(function (res) {
            setSignRes(res)
        }).catch(function (err) {
            if (err.code === 4001 || err.code === "ACTION_REJECTED") {
                return
            }
            api.error({
                "message": JSON.stringify({"code": err.code, "message": err.message}),
            })
        })
    }

    function SignButton() {
        if (eip712) {
            return (
                <Button type={"primary"} onClick={eip712Sign}>
                    EIP712 Sign
                </Button>
            )
        }
        return (
            <Button type={"primary"} onClick={personalSign}>
                Personal Sign
            </Button>
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