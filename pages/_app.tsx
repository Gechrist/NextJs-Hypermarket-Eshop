import type { AppProps } from 'next/app';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { StateContextProvider } from '../utils/context';
import { SessionProvider } from 'next-auth/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Layout from '../components/layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <StateContextProvider>
        <Layout>
          <PayPalScriptProvider
            deferLoading={true}
            options={{ 'client-id': 'YOUR_CLIENT_ID' }}
          >
            <ToastContainer
              limit={1}
              hideProgressBar={true}
              position="bottom-center"
              theme="dark"
              toastClassName="bg-black border-2 border-white w-full"
              transition={Slide}
              pauseOnHover
            />
            <Component {...pageProps} />
          </PayPalScriptProvider>
        </Layout>
      </StateContextProvider>
    </SessionProvider>
  );
}

export default MyApp;
