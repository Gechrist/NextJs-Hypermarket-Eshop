import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { StateContext } from '../utils/context';
import { useTransition, animated } from '@react-spring/web';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import AccountIcon from '../public/icons/account.svg';
import GarageIcon from '../public/icons/garageIcon.svg';
import LogIn from '../components/loginForm';
import Cart from './cart';
import Cookies from 'js-cookie';

type formData = { email: string; password: string };

const Login = () => {
  const { state } = useContext<any>(StateContext);
  const { data: session } = useSession();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setShowForm(false);
    setShowCart(false);
  }, [router.pathname]);

  useEffect(() => {
    setCartItemsNumber(state.orderItems.length);
  }, [state.orderItems]);

  const [cartItemsNumber, setCartItemsNumber] = useState<number>(0);

  const animationLogin = useTransition(showForm, {
    enter: { transform: `translate3d(${0},${34}%,${0})` },
    from: { transform: `translate3d(${100}%,${34}%,${0})` },
  });
  const animationCart = useTransition(showCart, {
    enter: { transform: `translate3d(${0},${50}%,${0})` },
    from: { transform: `translate3d(${100}%,${50}%,${0})` },
  });

  return (
    <div className="absolute right-0 z-30 flex flex-row">
      <div className="text-white text-right text-xs absolute top-14 right-1 w-56">
        {session?.user.name && <p>Welcome, {session.user.name}</p>}
      </div>
      <div className="text-white text-right text-xs absolute top-10 lg:top-8 right-11 md:right-20">
        {state?.orderItems.length > 0 && <p>{cartItemsNumber}</p>}
      </div>
      <div>
        <div
          className="absolute right-14 z-40 md:right-24 top-4 w-10 lg:w-8 h-10 lg:h-8 cursor-pointer"
          onClick={() => {
            setShowCart((prevState) => !prevState);
            setShowForm(false);
          }}
        >
          <Image
            src={GarageIcon}
            alt="cart icon"
            layout="fill"
            objectFit="contain"
          />
        </div>
        {animationCart(
          (styles, item) =>
            item && (
              <animated.div style={styles}>
                <div className="flex flex-col border-2 z-30 relative -top-28 border-black w-48 h-auto space-y-2 bg-white text-black rounded p-2">
                  <div className="text-center Cart">
                    <Cart cartItems={state.orderItems} />
                  </div>
                </div>
              </animated.div>
            )
        )}
      </div>
      <div>
        <div
          className="absolute right-1 z-30 top-4 w-10 lg:w-8 h-10 lg:h-8 cursor-pointer"
          onClick={() => {
            setShowForm((prevState) => !prevState);
            setShowCart(false);
          }}
        >
          <Image
            src={AccountIcon}
            alt="account icon"
            layout="fill"
            objectFit="contain"
          />
        </div>
        {animationLogin(
          (styles, item) =>
            item && (
              <animated.div style={styles}>
                {session === null ? (
                  <div className="flex flex-col  border-2 border-black w-48 h-auto space-y-2 bg-white text-black rounded p-2">
                    <LogIn loginWindow={setShowForm} />
                    <div className="text-center hover:text-red-700 focus:text-red-700">
                      <Link href="/passwordEmailReset" passHref>
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="text-center hover:text-red-700 focus:text-red-700">
                      <Link href="/register" passHref>
                        Register
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 flex flex-col divide-double border-2 border-black w-48 h-36 space-y-2 bg-white text-black rounded p-2">
                    <div className=" link text-center bg-gray-200 content-center">
                      <Link href={`/user/${session.userID}?profile`} passHref>
                        Profile
                      </Link>
                    </div>
                    <div className="link text-center bg-gray-200">
                      <Link href={`/user/${session.userID}?orders`} passHref>
                        Orders
                      </Link>
                    </div>
                    <div className="flex justify-center">
                      <button
                        className="w-full lg:w-3/6"
                        onClick={() => {
                          setShowForm(false);
                          signOut({ redirect: false });
                          Cookies.remove('userInfo');
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </animated.div>
            )
        )}
      </div>
    </div>
  );
};

export type { formData };
export default Login;
