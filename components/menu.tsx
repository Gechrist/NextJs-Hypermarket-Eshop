import { useEffect, useState } from 'react';
import { Manufacturer } from '../data/seedData';
import { byPropertiesOf } from '../utils/sort';
import { useRouter } from 'next/router';
import { Turn as Hamburger } from 'hamburger-react';
import { useTransition, animated } from '@react-spring/web';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'react-toastify';

type SortingProperties = {
  brand: string;
};
const Menu = () => {
  const [manufacturers, setManufacturers] = useState<Array<Manufacturer>>([]);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { data: session } = useSession();

  const fetchManufacturers = async () => {
    try {
      const response = await fetch('/api/getDbData', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/text',
        },
        body: 'Manufacturer',
      });

      const data = await response.json();
      if (data?.message) {
        toast.error(data.message);
        return;
      } else {
        setManufacturers(data);
      }
    } catch (e) {
      if (e as Error) {
        toast.error(`An unexpected error has occurred:${e}`);
        return;
      }
    }
  };
  useEffect(() => {
    fetchManufacturers();
  }, []);

  const router = useRouter();

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  const animationMenu = useTransition(showMenu, {
    enter: {
      x: 0,
    },
    from: {
      x: -100,
    },
  });

  return (
    <div
      className={`w-full z-40 Menu  ${
        showMenu ? 'fixed' : 'md:w-2/6 absolute'
      }`}
    >
      <div
        onClick={() => setShowMenu((prevState) => !prevState)}
        className="absolute z-40 top-2 left-0"
      >
        <Hamburger
          label="show menu"
          toggled={showMenu}
          color={showMenu ? 'black' : 'white'}
          size={30}
        />
      </div>
      {animationMenu(
        (styles, item) =>
          item && (
            <animated.div style={styles}>
              <div className="min-h-screen space-y-8 w-full md:w-1/6 bg-white border-r-2 border-gray-400 absolute">
                <div className="flex flex-col top-20 w-full absolute text-black">
                  {session?.isAdmin && (
                    <div
                      className="h-auto w-auto text-center link pb-2"
                      onClick={() => {
                        router.push('/admin');
                        setShowMenu(false);
                      }}
                    >
                      Admin Board
                    </div>
                  )}
                  <div
                    className="h-auto w-auto text-center link pb-2"
                    onClick={() => {
                      router.push('/about');
                      setShowMenu(false);
                    }}
                  >
                    About this project
                  </div>
                  <div
                    className="h-auto w-auto text-center link pb-2"
                    onClick={() => {
                      router.push('/');
                      setShowMenu(false);
                    }}
                  >
                    Home
                  </div>
                  <div className="w-full bg-white text-black divide-y-2 divide-grey-400 overflow-y-auto md:h-96 h-5/6 scrollbar-hide border-b-2 border-t-2 border-grey-400">
                    {manufacturers?.length > 0 &&
                      manufacturers
                        .sort(byPropertiesOf<SortingProperties>(['brand']))
                        .map((item: Manufacturer, index) =>
                          item.icon ? (
                            <div
                              key={index}
                              className="relative h-14 hover:bg-gray-200 cursor-pointer"
                              aria-label={`${item.brand} menu logo`}
                              onClick={() => {
                                window.location.assign(
                                  `/#${item.brand.replace(/ /g, '')}`
                                );
                                setShowMenu(false);
                              }}
                            >
                              <Image
                                className="absolute"
                                src={item.icon}
                                alt="manufacturer icon image"
                                objectFit="contain"
                                layout="fill"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-full h-8"
                              onClick={() => {
                                window.location.assign(
                                  `/#${item.brand.replace(/ /g, '')}`
                                );
                                setShowMenu(false);
                              }}
                            >
                              <p className="text-center">{item.brand}</p>
                            </div>
                          )
                        )}
                  </div>
                </div>
              </div>
            </animated.div>
          )
      )}
    </div>
  );
};

export default Menu;
