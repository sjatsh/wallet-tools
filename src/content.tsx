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
        if (signRes != "") {
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
            if (signMsgObj.sign_list.length>0){
                mmJson.message.digest = signMsgObj.sign_list[0].sign_msg
            }

            if (mmJson.types.EIP712Domain.length > 0 &&
                mmJson.primaryType != "" &&
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
        if (signRes != "") {
            await navigator.clipboard.writeText(signRes);
            api.info({
                message: `sign result copied`,
            });
        }
    }

    async function personalSign() {
        try {
            const {ethereum, address} = window
            const res = await ethereum.request({
                method: 'personal_sign',
                params: [signMsg, address]
            })
            if (res) {
                setSignRes(res)
            }
        } catch (err: any) {
            console.error(err)
            if (err.code == 4001) {
                return
            }
            api.error({
                "message": JSON.stringify({"code": err.code, "message": err.message}),
            })
        }
    }

    async function eip712Sign() {
        try {
            const {ethereum, address} = window
            const res = await ethereum.request({
                method: 'eth_signTypedData_v4',
                params: [address, signMsg],
                from: address
            })
            if (res) {
                setSignRes(res)
            }
        } catch (err: any) {
            console.error(err)
            if (err.code == 4001) {
                return
            }
            api.error({
                "message": JSON.stringify({"code": err.code, "message": err.message}),
            })
        }
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