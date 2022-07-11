import React, { FC } from 'react';
import LoginCart from './login&cart';
import Menu from './menu';

type Props = {};

const Layout: FC<Props> = ({ children }) => {
  return (
    <div>
      <div className="w-full flex flex-row relative justify-between">
        <Menu />
        <LoginCart />
      </div>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
