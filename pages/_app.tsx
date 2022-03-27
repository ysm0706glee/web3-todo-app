import React from "react";
import type { AppProps } from "next/app";
import { ChakraProvider, localStorageManager } from "@chakra-ui/react";

import { Web3ReactProvider } from "@web3-react/core";
import {
  ExternalProvider,
  JsonRpcFetchFunc,
  Web3Provider,
} from "@ethersproject/providers";

function getLibrary(provider: ExternalProvider | JsonRpcFetchFunc) {
  return new Web3Provider(provider);
}

const MyApp: React.VFC<AppProps> = ({ Component, pageProps }) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider colorModeManager={localStorageManager}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Web3ReactProvider>
  );
};

export default MyApp;
