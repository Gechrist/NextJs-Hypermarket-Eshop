import Link from 'next/link';
import Image from 'next/image';
import { FC, useEffect, useState, useContext } from 'react';
import { StateContext } from '../utils/context';
import formatter from '../utils/prices';
import cartUtils from '../utils/cart';
import { ItemCart } from '../utils/cart';
import DeleteItem from '../public/icons/deleteItem.svg';
import Increment from '../public/icons/incrementItem.svg';
import Decrement from '../public/icons/decrementItem.svg';
import { byPropertiesOf } from '../utils/sort';

type Props = {
  cartItems: [
    {
      _id: string;
      model: string;
      price: number;
    }
  ];
};

type SortingProperties = {
  model: string;
};

const Cart: FC<Props> = ({ cartItems }: Props) => {
  const [deDuplicatedCartItems, setDeDuplicatedCartItems] = useState<
    Array<ItemCart>
  >([]);

  const [cartPrice, setCartPrice] = useState<number>(0);

  const { dispatch } = useContext<any>(StateContext);

  useEffect(() => {
    const newCartArray = cartUtils.DeduplicateCart(cartItems);
    setDeDuplicatedCartItems([...newCartArray]);
  }, [cartItems]);

  useEffect(() => {
    const calcCartPrice = cartUtils.CalcCartPrice(cartItems);
    setCartPrice(calcCartPrice);
  }, [cartItems]);

  return (
    <div>
      <div className="overflow-y-auto scrollbar-hide w-full h-72">
        <ul className="w-full bg-gray-200">
          {deDuplicatedCartItems.length > 0 ? (
            deDuplicatedCartItems
              .sort(byPropertiesOf<SortingProperties>(['model']))
              .map((cartItem: ItemCart) => (
                <div
                  key={cartItem._id}
                  className="py-2 flex flex-col space-y-2 border-b-2 border-gray-400"
                >
                  <Link href={`/cars/${cartItem._id}`} passHref>
                    <li className="font-bold cursor-pointer">
                      {cartItem.model}
                    </li>
                  </Link>
                  <li>
                    <div className="flex flex-row space-x-4 justify-center items-center">
                      <Image
                        className="cursor-pointer"
                        src={Increment}
                        alt="increment item quantity"
                        onClick={() =>
                          dispatch({
                            type: 'INCREMENT_CART',
                            payload: cartItem,
                          })
                        }
                      />
                      <div>
                        {
                          cartItems.filter(
                            (item: ItemCart) => item._id === cartItem._id
                          ).length
                        }
                      </div>
                      <Image
                        className="cursor-pointer"
                        src={Decrement}
                        alt="decrement item quantity"
                        onClick={() =>
                          dispatch({
                            type: 'DECREMENT_CART',
                            payload: cartItem._id,
                          })
                        }
                      />
                      <Image
                        src={DeleteItem}
                        className="cursor-pointer"
                        alt="remove items from cart"
                        onClick={(e) => {
                          dispatch({
                            type: 'REMOVE_ONE_ITEM',
                            payload: cartItem._id,
                          });
                          e!.preventDefault();
                        }}
                      />
                    </div>
                  </li>
                  <li>
                    {formatter.format(
                      cartItems.filter(
                        (item: ItemCart) => item._id === cartItem._id
                      ).length * cartItem.price
                    )}
                  </li>
                </div>
              ))
          ) : (
            <li className="bg-white">The cart is empty</li>
          )}
        </ul>
      </div>
      <div className="font-bold py-2">Total: {formatter.format(cartPrice)}</div>
      <div>
        <Link passHref href="/checkout">
          <button disabled={deDuplicatedCartItems.length === 0 ? true : false}>
            Checkout
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Cart;
