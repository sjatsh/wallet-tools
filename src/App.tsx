import React from 'react';
import {Col, Layout, Row, theme} from 'antd';
import './App.css';
import Wallet from "./wallet";
import SignContent from "./content";

const {Header, Content, Footer} = Layout;

const App: React.FC = () => {

    const {
        token: {colorBgContainer},
    } = theme.useToken();


    return (
        <Layout style={{height: '100vh'}}>
            <Header
                style={{
                    width: '100%',
                    background: colorBgContainer,
                    boxShadow: '0 1px 0 0 rgb(182 196 217 / 40%)',
                }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={18}/>
                    <Wallet/>
                </Row>
            </Header>
            <Content className="site-layout" style={{paddingTop: '30px', alignSelf: 'center'}}>
                <div style={{
                    padding: 24,
                    background: colorBgContainer,
                    minHeight: '800px',
                    width: '500px',
                    borderRadius: '16px',
                    boxShadow: '0 6px 8px 0 rgb(223 231 227 / 86%)',
                    border: '1px solid rgba(182,196,217,.4)',
                    textAlign: 'center',
                }}>
                    <SignContent/>
                </div>
            </Content>
            <Footer style={{textAlign: 'center'}}>wallet-tools ©2023 Created by Jerry</Footer>
        </Layout>
    );
};


export default App;