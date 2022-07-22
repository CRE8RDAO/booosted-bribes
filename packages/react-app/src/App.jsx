import WalletConnectProvider from "@walletconnect/web3-provider";
import { Button, Affix, Layout, Space } from "antd";
import "antd/dist/antd.css";
import { useUserAddress } from "eth-hooks";
import { ethers } from "ethers";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import { GithubOutlined } from "@ant-design/icons";
import "./App.css";
import { Address, Header } from "./components";
import { INFURA_ID, NETWORKS } from "./constants";
import signatorLogo from "./images/sig-logo.png";
import Signator from "./Signator";
import SignatorViewer from "./SignatorViewer";
import snapshot from '@snapshot-labs/snapshot.js';
import addresses from "./addresses";
import useBribe from "./hooks/Bribe";
import BribesDisplay from './BribesDisplay'
import TagManager from 'react-gtm-module'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";


const tagManagerArgs = {
    gtmId: 'GTM-5PC69BZ'
}

TagManager.initialize(tagManagerArgs)




const hub = 'https://hub.snapshot.org'; // or https://testnet.snapshot.org for testnet
const client = new snapshot.Client712(hub);
const { Footer } = Layout;
/*
    Welcome to Signatorio !
*/

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.mainnet; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

const scaffoldEthProvider = new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544");
const mainnetInfura = new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  window.localStorage.removeItem("walletconnect");
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

const clientSnapshotGQL = new ApolloClient({
  uri: 'https://hub.snapshot.org/graphql',
  cache: new InMemoryCache()
});


function App() {
  const mainnetProvider = scaffoldEthProvider && scaffoldEthProvider._network ? scaffoldEthProvider : mainnetInfura;
  const [injectedProvider, setInjectedProvider] = useState();


  const [chainList, setChainList] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    const getChainList = async () => {
      try {
        const rawChainList = await fetch("https://chainid.network/chains.json");
        const chainListJson = await rawChainList.json();

        setChainList(chainListJson);
      } catch (e) {
        console.log(e);
      }
    };
    getChainList();
  }, []);

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const address = useUserAddress(injectedProvider);

  const {cre8rScore,beetsScore} = useBribe(injectedProvider, address);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const modalButtons = [];
  if (web3Modal) {
    if (web3Modal.cachedProvider) {
      modalButtons.push(
        <Button
          key="logoutbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 2 }}
          shape="round"
          size="large"
          onClick={logoutOfWeb3Modal}
        >
          logout
        </Button>,
      );
    } else {
      modalButtons.push(
        <Button
          key="loginbutton"
          style={{ verticalAlign: "top", marginLeft: 8, marginTop: 2 }}
          shape="round"
          size="large"
          /* type={minimized ? "default" : "primary"}     too many people just defaulting to MM and having a bad time */
          onClick={loadWeb3Modal}
        >
          connect
        </Button>,
      );
    }
  }

  return (
    <ApolloProvider client={clientSnapshotGQL}>
      <div className="App">
        {/* ✏️ Edit the header and change the title to your project name */}
        <Affix offsetTop={0}>
          <Header
            extra={[
              address && <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} />,
              ...modalButtons,
            ]}
          />
        </Affix>
        <div className="logo-wrapper">
          <img className="logo" src={signatorLogo} alt="Signatorio" />
        </div>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Signator style={{ textAlign: "center", fontSize: "16px" }}
                mainnetProvider={mainnetProvider}
                injectedProvider={injectedProvider}
                address={address}
                loadWeb3Modal={loadWeb3Modal}
                chainList={chainList}
              />
            </Route>
            <Route path="/view">
              <SignatorViewer
                mainnetProvider={mainnetProvider}
                injectedProvider={injectedProvider}
                address={address}
                loadWeb3Modal={loadWeb3Modal}
                chainList={chainList}
              />
            </Route>
            <Route exact path="/calc">
              <BribesDisplay style={{ textAlign: "center", fontSize: "16px" }}
                mainnetProvider={mainnetProvider}
                injectedProvider={injectedProvider}
                address={address}
                loadWeb3Modal={loadWeb3Modal}
                chainList={chainList}
              />
            </Route>
          </Switch>
        </BrowserRouter>

        {/* <ThemeSwitch /> */}
        <Footer style={{ textAlign: "center", fontSize: "16px" }}>
          <Space>
            <a href="https://github.com/CRE8RDAO/bb" target="_blank">
              <GithubOutlined />
            </a>
          {cre8rScore ? <span>Your CRE8R Holdings across Fantom Pools and Vaults <span style={{color: 'green'}}>${Math.round(cre8rScore*0.15)}</span> </span> : <span> Connect a wallet that voted to view your CRE8R Voting Power</span>}
          {beetsScore ? <span>Your $FBEETS voting power as of block #43050170: <span style={{color: 'green'}}>{Math.round(beetsScore)}</span></span> : <span> Connect a wallet that voted to view your CRE8R Voting Power</span>}
            <a href="https://cre8r.vip/boosted-bribes/" target="_blank">
              🧱 Boosted Bribes™ {" "}
            </a>
          </Space>
        </Footer>
      </div>
    </ApolloProvider>
  );
}

export default App;
