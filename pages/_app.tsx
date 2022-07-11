import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Layout from '../components/layout';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { StateContextProvider } from '../utils/context';
import { SessionProvider } from 'next-auth/react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

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
              toastClassName="bg-black border-2 border-white w-96"
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
