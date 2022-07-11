import React, { FC, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import useSWR from 'swr';
import LoginCart from './login&cart';
import Menu from './menu';

type Props = {};

const Layout: FC<Props> = ({ children }) => {
  // const fetchManufacturers = (url: string, type: string) =>
  //   fetch(url, {
  //     signal: signal,
  //     method: 'POST',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/text',
  //     },
  //     body: type,
  //   }).then((r) => r.json());

  // let { data, error } = useSWR(
  //   ['/api/getDbData', 'Manufacturer'],
  //   fetchManufacturers,
  //   {  }
  // );

  // if (Object?.keys(data)?.includes('message')) {
  //   toast.error(data.message);
  // }

  // if (error) {
  //   toast.error(`An unexpected error has occurred:${error}`);
  // }
  // const controller = new AbortController();
  // const signal = controller.signal;

  // useEffect(() => {
  //   return () => {
  //     controller.abort();
  //   };
  // }, []);

  return (
    <div>
      <div className="w-full flex flex-row relative justify-between">
        <Menu />
        {/* <Menu manufacturers={data} /> */}
        <LoginCart />
      </div>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
