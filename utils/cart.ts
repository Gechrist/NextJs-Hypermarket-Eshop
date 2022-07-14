import { useContext } from 'react';
import { StateContext } from '../utils/context';

type ItemCart = {
  _id: string;
  model: string;
  price: number;
};

const AddtoCart = (_id: string, quantity: number, price: number) => {
  const { dispatch } = useContext<any>(StateContext);
  dispatch({
    type: 'ADDTO_CART',
    payload: { item: _id, quantity, price: price },
  });
};

const DeduplicateCart = (cartItems: Array<ItemCart>) => {
  const newArray = cartItems.reduce((acc: any, current) => {
    const x = acc.find((item: ItemCart) => item._id === current._id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  return newArray;
};

const CalcCartPrice = (cartItems: Array<ItemCart>) => {
  const cartPrice = cartItems.reduce(
    (acc: any, current) => acc + current.price,
    0
  ) as unknown as number;
  return cartPrice;
};

const CheckQuantity = async (item: {
  _id: string;
  quantity: number;
  model: string;
}) => {
  try {
    const response = await fetch('/api/getSingleDbData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: item._id, type: 'Car' }),
    });

    const carResponse = await response.json();
    if (carResponse.car.quantity < item.quantity) {
      return {
        error: `Insufficient stock for ${item.model}. Please contact the administrator if you have already completed the payment.`,
      };
    } else {
      return { quantity: carResponse.car.quantity };
    }
  } catch (e) {
    console.log((e as Error).message);
    return {
      error: `An error occurred. Please contact the administrator:${
        (e as Error).message
      }`,
    };
  }
};

const UpdateQuantity = async (item: { _id: string; quantity: number }) => {
  try {
    const response = await fetch('/api/updateDbData', {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { quantity: item.quantity },
        id: item._id,
        type: 'Car',
      }),
    });

    const carResponse = await response.json();
    if (carResponse.message.includes('not found')) {
      return 'error';
    } else {
      return 'ok';
    }
  } catch (e) {
    console.log((e as Error).message);
    return 'error';
  }
};

const cartUtils = {
  AddtoCart,
  DeduplicateCart,
  CalcCartPrice,
  CheckQuantity,
  UpdateQuantity,
};
export type { ItemCart };
export default cartUtils;
