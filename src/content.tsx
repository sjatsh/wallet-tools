import TextArea from "antd/es/input/TextArea";
import {Button, Col, notification, Row} from "antd";
import React, {useMemo, useState} from "react";

const SignContent: React.FC = () => {
    const [signMsg, setSignMsg] = useState("")
    const [signRes, setSignRes] = useState("")
    const Context = React.createContext({name: 'SignRes'});
    const contextValue = useMemo(() => ({name: 'Copy Sign Result'}), []);
    const [api, contextHolder] = notification.useNotification();

    async function signMsgChange(e: any) {
        setSignMsg(e.target.value)
        if (signRes != "") {
            setSignRes("")
        }
    }


    async function personalSign() {
        // @ts-ignore
        window.provider.getSigner().signMessage(signMsg).then(function (res) {
            setSignRes(res)
        })
    }

    async function copySignRes() {
        if (signRes != "") {
            await navigator.clipboard.writeText(signRes);
            api.info({
                message: `sign result copied`,
            });
        }
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
                    autoSize={{minRows: 3}}
                    style={{borderRadius: "16px"}}
                />
            </div>

            <Row style={{paddingTop: "10px"}}>
                <Col>
                    <Button type={"primary"} onClick={personalSign}>
                        Personal Sign
                    </Button>
                </Col>
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