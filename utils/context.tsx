import React, { createContext, useReducer } from 'react';
import Cookies from 'js-cookie';

interface Props {
  children: React.ReactNode;
}

type State = {
  orderItems: [{ _id: string; model: string; price: number }] | [];
};
type Action = { type: string; payload: any };

const defaultValue: State = {
  orderItems: Cookies.get('orderItems')
    ? JSON.parse(Cookies.get('orderItems') as any)
    : [],
};
const StateContext = createContext<State | null>(defaultValue);

let cartItems: Array<{ _id: string; model: string; price: number }>;

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'ADDTO_CART': {
      cartItems = state.orderItems;
      for (var i = 0; i < action.payload.quantity; i++) {
        cartItems.push({
          _id: action.payload._id,
          model: action.payload.model,
          price: action.payload.price,
        });
      }

      Cookies.set('orderItems', JSON.stringify(cartItems));
      return { ...state, orderItems: [...cartItems] } as State;
    }
    case 'INCREMENT_CART': {
      cartItems = state.orderItems;
      cartItems.push(action.payload);
      Cookies.set('orderItems', JSON.stringify(cartItems));
      return { ...state, orderItems: [...cartItems] } as State;
    }
    case 'DECREMENT_CART': {
      cartItems = state.orderItems;
      const indexRemove = cartItems.findIndex(
        (item) => item._id === action.payload
      );
      cartItems.splice(indexRemove, 1);
      Cookies.set('orderItems', JSON.stringify(cartItems));
      return { ...state, orderItems: [...cartItems] } as State;
    }
    case 'REMOVE_ONE_ITEM': {
      cartItems = state.orderItems.filter(
        (item) => item._id !== action.payload
      );
      Cookies.set('orderItems', JSON.stringify(cartItems));
      return { ...state, orderItems: [...cartItems] } as State;
    }
    case 'ORDER_COMPLETED': {
      cartItems = [];
      Cookies.set('orderItems', []);
      return { ...state, orderItems: [] } as State;
    }
    default:
      return state;
  }
};
const StateContextProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(reducer, defaultValue);
  const value = { state, dispatch } as unknown as State;

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

export { StateContext, StateContextProvider };
