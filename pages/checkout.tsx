import React, { useContext, useEffect, useState } from 'react';
import { StateContext } from '../utils/context';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { byPropertiesOf } from '../utils/sort';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import cartUtils, { ItemCart } from '../utils/cart';
import Image from 'next/image';
import formatter from '../utils/prices';
import DeleteItem from '../public/icons/deleteItem.svg';
import UpChevron from '../public/icons/upchevron.svg';
import DownChevron from '../public/icons/downchevron.svg';
import PayPalSpinner from '../public/icons/paypalSpinner.svg';
import OrderSpinnerButton from '../public/icons/orderButtonSpinner.svg';
import Modal from '../components/creditCardModal';
import stripe from 'stripe';

type SortingProperties = {
  model: string;
};

const Checkout = () => {
  const { data: session } = useSession();
  const { state, dispatch } = useContext<any>(StateContext);
  const [formOrderItems, setFormOrderItems] = useState<Array<any>>([]);
  const [deDuplicatedCartItems, setDeDuplicatedCartItems] = useState<
    Array<ItemCart>
  >([]);
  const [cartPrice, setCartPrice] = useState<number>(0);
  const [payPalFormButtons, showPaypalFormButtons] = useState<boolean>(false);
  const [payPalLoaded, setPayPalLoaded] = useState<boolean>(false);
  const [payPalID, setPayPalID] = useState<string>('');
  const [payPalPaymentInfo, setPayPalPaymentInfo] = useState<{
    orderID: string;
    payer: {
      email_address: string;
      name: {
        given_name: string;
        surname: string;
      };
      payer_id: string;
    };
    paymentID: string;
    status: string;
    create_time: string;
    update_time: string;
  }>({
    orderID: '',
    payer: {
      email_address: '',
      name: {
        given_name: '',
        surname: '',
      },
      payer_id: '',
    },
    paymentID: '',
    status: '',
    create_time: '',
    update_time: '',
  });
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState<boolean>();
  const [creditCardPaymentInfo, setCreditPaymentInfo] = useState<{
    date: number;
    amount: string;
    currency: string;
    paymentID: string;
    status: string;
  }>({
    date: 0,
    amount: '',
    currency: '',
    paymentID: '',
    status: '',
  });
  const [stripeClientSecret, setStripeClientSecret] = useState<string>('');
  const [payWithCreditButton, showPayWithCreditButton] = useState<boolean>();
  const [stripeIntentID, setStripeIntentID] = useState<string>('');
  const [updatedStripeAmount, setUpdatedStripeAmount] =
    useState<boolean>(false);
  const [orderSpinner, showOrderSpinner] = useState<boolean>(false);

  useEffect(() => {
    if (state.orderItems.length > 0) {
      const newCartArray = cartUtils.DeduplicateCart(state.orderItems);
      setDeDuplicatedCartItems([...newCartArray]);
    }
  }, [state.orderItems]);

  useEffect(() => {
    if (state.orderItems.length > 0) {
      const calculCartPrice = cartUtils.CalcCartPrice(state.orderItems);
      setCartPrice(calculCartPrice);
    }
  }, [state.orderItems]);

  useEffect(() => {
    if (formOrderItems.length !== 0) {
      setFormOrderItems([]);
    }
    deDuplicatedCartItems.map((cartItem) => {
      setFormOrderItems((formOrderItems) => [
        ...formOrderItems,
        {
          item: cartItem._id,
          quantity: state.orderItems.filter(
            (item: ItemCart) => item._id === cartItem._id
          ).length,
          price: cartItem.price,
        },
      ]);
    });
  }, [deDuplicatedCartItems]);

  useEffect(() => {
    if (payPalPaymentInfo.orderID || creditCardPaymentInfo.paymentID) {
      toast.success('Payment completed successfully');
    }
  }, [payPalPaymentInfo, creditCardPaymentInfo]);

  useEffect(() => {
    if (session) {
      reset({
        fullName: session?.user.name as string,
        email: session?.user.email as string,
        address: session.address as string,
        city: session.city as string,
        postalCode: session.postalCode as string,
        country: session.country as string,
      });
    } else {
      reset({
        fullName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
      });
    }
  }, [session]);

  useEffect(() => {
    if (payWithCreditButton && stripeIntentID) {
      updateStripe();
    }
  }, [payWithCreditButton, cartPrice]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  const router = useRouter();

  //Paypal Methods
  const createPaypalOrder = (data: Record<string, unknown>, actions: any) => {
    if (data) {
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: (cartPrice + (cartPrice * 24) / 100 + 1).toFixed(2),
            },
          },
        ],
      });
    }
  };
  // paypal sandbox byer sb-43wqun16606549@personal.example.com
  // ^W/@cY2f

  const onApprovedPaypalOrder = async (
    data: Record<string, unknown>,
    actions: any
  ) => {
    if (data) {
      const payPalOrderData = await actions.order.capture();
      setPayPalPaymentInfo({
        ...payPalPaymentInfo,
        orderID: payPalOrderData.id,
        payer: payPalOrderData.payer,
        status: payPalOrderData.status,
        paymentID: payPalOrderData.purchase_units[0].payments.captures[0].id,
        create_time: payPalOrderData.create_time,
        update_time: payPalOrderData.update_time,
      });
    }
  };

  const onErrorPaypalOrder = (e: Record<string, unknown>) => {
    toast.error(e.message as string);
  };

  const loadPaypalScript = async () => {
    const response = await fetch('/api/payments/paypal', {
      method: 'GET',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/text',
      },
    });
    const paypalClientID = await response.text();
    setPayPalID(paypalClientID);

    setPayPalLoaded(true);
    paypalDispatch({
      type: 'resetOptions',
      value: {
        'client-id': paypalClientID,
        currency: 'EUR',
        commit: false,
      },
    });
  };

  //stripe modal functions

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_KEY as string
  );

  const stripeIntent = async () => {
    try {
      const intentPromise = await fetch('/api/payments/stripe/create', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: (cartPrice + (cartPrice * 24) / 100 + 1).toFixed(2),
        }),
      });
      const intent = await intentPromise.json();
      if (intent?.type) {
        toast.error('Something went wrong. Please contact the administrator');
        return;
      }
      setStripeClientSecret(intent.client_secret);
      setStripeIntentID(intent.id);
      return stripeClientSecret;
    } catch (e) {
      console.log((e as Error).message);
      toast.error('Something went wrong. Please contact the administrator');
    }
  };

  const updateStripe = async () => {
    try {
      const stripeUpdateResponse = await fetch('/api/payments/stripe/update', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ID: stripeIntentID,
          amount: (cartPrice + (cartPrice * 24) / 100 + 1).toFixed(2),
        }),
      });
      const status = await stripeUpdateResponse.text();
      if (status === 'requires_payment_method') {
        setUpdatedStripeAmount(true);
      } else {
        toast.error('Something went wrong. Please contact the administrator');
        return;
      }
    } catch (e) {
      console.log((e as Error).message);
      toast.error('Something went wrong. Please contact the administrator');
    }
  };

  const openModal = () => {
    setIsCreditCardModalOpen(true);
  };

  const closeModal = () => {
    setIsCreditCardModalOpen(false);
  };

  const paymentMethod = (method: string) => {
    switch (method) {
      case 'cash': {
        showPayWithCreditButton(false);
        showPaypalFormButtons(false);
        break;
      }
      case 'creditCard': {
        showPayWithCreditButton(true);
        showPaypalFormButtons(false);
        stripeIntent();
        break;
      }
      case 'payPal': {
        if (!payPalLoaded) {
          loadPaypalScript();
        }
        showPaypalFormButtons(true);
        showPayWithCreditButton(false);
        break;
      }
      case 'wireTransfer': {
        showPayWithCreditButton(false);
        showPaypalFormButtons(false);
        break;
      }
      default:
        break;
    }
  };

  const createOrder = async (orderData: any): Promise<void> => {
    try {
      const response = await fetch('/api/createDbData', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: orderData, type: 'order' }),
      });
      const order = await response.json();
      if (order.message !== 'ok') {
        toast.error(
          'An error occurred while processing your order. Please contact the administrator'
        );
        return;
      }
      if (order) {
        orderEmail(order.id, order.email);
        router.push(`/orderSuccess/${order.id}`);
      }
    } catch (e) {
      console.log((e as Error).message);
      toast.error(
        'An error occurred while processing your order. Please contact the administrator'
      );
    }
  };

  const orderEmail = async (id: string, email: string) => {
    try {
      const response = await fetch('/api/emailOrder', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { id, email } }),
      });
      const emailResult = await response.json();
      if (emailResult.error) {
        console.log(emailResult.error);
      }
    } catch (e) {
      console.log({ error: (e as Error).message });
    }
  };

  const onSubmit: SubmitHandler<any> = async (data: any, e) => {
    e!.preventDefault();
    showOrderSpinner(true);
    if (payPalFormButtons && !payPalPaymentInfo.orderID) {
      toast.error(
        'Please complete the payment with PayPal before placing the order'
      );
      showOrderSpinner(false);
      return;
    }
    if (payWithCreditButton && !creditCardPaymentInfo.paymentID) {
      toast.error(
        'Please complete the payment with a credit card before placing the order'
      );
      showOrderSpinner(false);
      return;
    }

    //check if item is available and if yes update item quantity. Taken from https://advancedweb.hu/how-to-use-async-functions-with-array-some-and-every-in-javascript/#conclusion
    const asyncEvery = async (
      arr: ItemCart[],
      predicate: (e: any) => Promise<boolean | undefined>
    ) => {
      for (let e of arr) {
        if (!(await predicate(e))) return false;
      }
      return true;
    };

    const checkAndUpdate = await asyncEvery(
      deDuplicatedCartItems,
      async (car) => {
        let check: { error?: string; quantity?: number } =
          await cartUtils.CheckQuantity({
            _id: car._id,
            model: car.model,
            quantity: state.orderItems.filter(
              (item: ItemCart) => item._id === car._id
            ).length,
          });
        if (check.error) {
          toast.error(check.error);
          return false;
        }
        if (check.quantity) {
          const update: string = await cartUtils.UpdateQuantity({
            _id: car._id,
            quantity:
              check!.quantity -
              state.orderItems.filter((item: ItemCart) => item._id === car._id)
                .length,
          });
          if (update.includes('error')) {
            toast.error(
              'Something went wrong. Please contact the administrator'
            );
            return false;
          }
          return true;
        }
      }
    );

    if (!checkAndUpdate) {
      showOrderSpinner(false);
      return;
    }
    //add paypalDetails/creditcardDetails to ...data
    let formOrderData;
    if (payPalPaymentInfo.orderID) {
      formOrderData = {
        ...data,
        userID: session?.user.userID,
        formOrderItems,
        payPalPaymentInfo,
        isPaid: true,
        isDelivered: false,
        paidAt: Date.parse(payPalPaymentInfo.create_time),
      };
    } else if (creditCardPaymentInfo.paymentID) {
      formOrderData = {
        ...data,
        formOrderItems,
        creditCardPaymentInfo,
        isPaid: true,
        isDelivered: false,
        paidAt: new Date(creditCardPaymentInfo.date * 1000),
      };
    } else {
      formOrderData = {
        ...data,
        formOrderItems,
        isPaid: false,
        isDelivered: false,
      };
    }
    if (session) {
      formOrderData = {
        ...formOrderData,
        userID: session.userID,
      };
    }
    formOrderData = {
      ...formOrderData,
      itemsPrice: cartPrice.toFixed(2),
      shippingPrice: 1,
      taxPrice: ((cartPrice * 24) / 100).toFixed(2),
      totalPrice: (cartPrice + (cartPrice * 24) / 100 + 1).toFixed(2),
    };
    createOrder(formOrderData);
  };
  return (
    <div className="container min-w-full mt-10">
      {state.orderItems.length > 0 ? (
        <div className="flex mx-auto justify-around flex-row md:w-4/6">
          <div className="flex flex-col mt-10 w-auto md:w-full space-y-10 bg-white text-black border-2 border-gray-400 p-2 rounded">
            <form onSubmit={handleSubmit(onSubmit)} method="POST">
              <div className="md:flex md:flex-row md:space-x-2 md:justify-between">
                <div className="flex flex-col space-y-2 mb-2 md:flex-grow">
                  <h2 className="text-center">Shipping & Payment:</h2>
                  <div className="flex flex-row justify-start md:justify-center space-x-4">
                    <label className="w-24" htmlFor="fullName">
                      Full Name:
                    </label>
                    <input
                      className="border-b-2 border-gray-400 flex-grow"
                      type="text"
                      id="fullName"
                      aria-invalid={errors.fullName ? 'true' : 'false'}
                      {...register('fullName', {
                        required: {
                          value: true,
                          message: 'Full Name is required',
                        },
                      })}
                    />
                  </div>
                  {errors.fullName && (
                    <span role="alert">{errors.fullName.message}</span>
                  )}
                  <div className="flex flex-row justify-start md:justify-center space-x-4">
                    <label className="w-24" htmlFor="email">
                      Email:
                    </label>
                    <input
                      className="border-b-2 border-gray-400 flex-grow"
                      type="text"
                      id="email"
                      aria-invalid={errors.email ? 'true' : 'false'}
                      {...register('email', {
                        required: { value: true, message: 'Email is required' },
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Please enter a valid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <span role="alert">{errors.email.message}</span>
                  )}
                  <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
                    <label className="w-24" htmlFor="address">
                      Address:
                    </label>
                    <input
                      className="border-b-2 border-gray-400 flex-grow"
                      id="address"
                      type="text"
                      aria-invalid={errors.address ? 'true' : 'false'}
                      {...register('address', {
                        required: {
                          value: true,
                          message: 'Address is required',
                        },
                      })}
                    />
                  </div>
                  {errors.address && (
                    <span role="alert">{errors.address.message}</span>
                  )}
                  <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
                    <label className="w-24" htmlFor="city">
                      City:
                    </label>
                    <input
                      className="border-b-2 border-gray-400 flex-grow"
                      id="city"
                      type="text"
                      aria-invalid={errors.city ? 'true' : 'false'}
                      {...register('city', {
                        required: { value: true, message: 'City is required' },
                      })}
                    />{' '}
                  </div>
                  {errors.city && (
                    <span role="alert">{errors.city.message}</span>
                  )}
                  <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
                    <label className="w-24" htmlFor="postalCode">
                      Postal Code:
                    </label>
                    <input
                      className="border-b-2 border-gray-400 flex-grow"
                      id="postalCode"
                      type="text"
                      aria-invalid={errors.postalCode ? 'true' : 'false'}
                      {...register('postalCode', {
                        required: {
                          value: true,
                          message: 'Postal Code is required',
                        },
                      })}
                    />
                  </div>
                  {errors.postalCode && (
                    <span role="alert">{errors.postalCode.message}</span>
                  )}
                  <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
                    <label className="w-24" htmlFor="country">
                      Country:
                    </label>
                    <input
                      className="border-b-2 border-gray-400 flex-grow"
                      type="text"
                      id="country"
                      // readOnly
                      aria-invalid={errors.country ? 'true' : 'false'}
                      {...register('country', {
                        required: {
                          value: true,
                          message: 'Country is required',
                        },
                      })}
                    />
                  </div>
                  {errors.country && (
                    <span role="alert">{errors.country.message}</span>
                  )}
                  <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
                    <label htmlFor="paymentOption" className="w-24">
                      Payment Method:
                    </label>
                    <Controller
                      control={control}
                      rules={{
                        validate: {
                          required: (value) =>
                            creditCardPaymentInfo.paymentID
                              ? true
                              : value === undefined || value === ''
                              ? 'Please select a payment method'
                              : true,
                        },
                      }}
                      name="paymentMethod"
                      render={({ field }) => (
                        <select
                          id="paymentOption"
                          className="text-black bg-gray-100 border-b-2 border-grey-400 flex-grow text-center"
                          onChange={(
                            e: React.ChangeEvent<HTMLSelectElement>
                          ) => {
                            field.name = 'paymentMethod';
                            field.onChange(e.target.value);
                            paymentMethod(e.target.value);
                          }}
                        >
                          <option value="">Choose a Payment Method</option>
                          <option value="cash">Cash on Delivery</option>
                          <option value="creditCard">Credit Card</option>
                          <option value="payPal">PayPal</option>
                          <option value="wireTransfer">Wire Transfer</option>
                        </select>
                      )}
                    />
                  </div>
                  {errors.paymentMethod && (
                    <span role="alert">{errors.paymentMethod.message}</span>
                  )}
                  {isPending && (
                    <div className="flex flex-row justify-center md:ml-28 mt-4 mb-4">
                      <Image src={PayPalSpinner} alt="Paypal loading spinner" />
                    </div>
                  )}
                  {payPalFormButtons && !payPalPaymentInfo.orderID && (
                    <div className="flex flex-row justify-center md:justify-end mt-4 mb-4">
                      <PayPalButtons
                        className="w-full ml-28"
                        fundingSource="paypal"
                        createOrder={createPaypalOrder}
                        onApprove={onApprovedPaypalOrder}
                        onError={onErrorPaypalOrder}
                        style={{ color: 'black' }}
                      ></PayPalButtons>
                    </div>
                  )}
                  {creditCardPaymentInfo.paymentID && (
                    <div className="flex flex-row justify-center md:justify-end mt-4 mb-4">
                      <p className="bg-black text-white text-center italic p-1 rounded w-full md:w-full md:ml-28">
                        {' '}
                        Payment Completed:{''}
                        {creditCardPaymentInfo.date}
                      </p>
                    </div>
                  )}
                  {payPalPaymentInfo.orderID && (
                    <div className="flex flex-row justify-center md:justify-end mt-4 mb-4">
                      <p className="bg-black text-white text-center italic p-1 rounded w-full md:w-full md:ml-28">
                        {' '}
                        Payment Completed:{''}
                        {payPalPaymentInfo.payer.email_address}
                      </p>
                    </div>
                  )}
                  {payWithCreditButton && !creditCardPaymentInfo.paymentID && (
                    <div className="flex flex-row justify-center md:justify-end mt-4 mb-4">
                      <button
                        className="bg-black text-white text-center italic p-1 rounded flex-grow ml-28 hover:bg-gray-900"
                        onClick={(e: React.FormEvent) => {
                          e.preventDefault();
                          openModal();
                        }}
                      >
                        Pay with Credit/Debit Card
                      </button>
                    </div>
                  )}
                  {isCreditCardModalOpen && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: stripeClientSecret,
                        loader: 'always',
                      }}
                    >
                      <Modal
                        closeModal={closeModal}
                        paymentData={setCreditPaymentInfo}
                        showAmount={cartPrice + (cartPrice * 24) / 100 + 1}
                        updatedStripeAmount={updatedStripeAmount}
                      />
                    </Elements>
                  )}
                </div>
                <div className="grid bg-gray-200 p-2 mb-2 space-y-2 h-auto content-between w-auto md:flex-grow">
                  <h2 className="text-center">Order Summary:</h2>
                  <table>
                    <tbody>
                      {deDuplicatedCartItems
                        .sort(byPropertiesOf<SortingProperties>(['model']))
                        .map((car, index) => (
                          <tr
                            key={index}
                            className="border-b-2 border-gray-400"
                          >
                            <td className="flex flex-col lg:items-center">
                              <Image
                                className="cursor-pointer"
                                src={UpChevron}
                                alt="increment item quantity"
                                onClick={(e) => {
                                  dispatch({
                                    type: 'INCREMENT_CART',
                                    payload: car,
                                  });
                                  e!.preventDefault();
                                  if (payPalFormButtons) {
                                    paypalDispatch({
                                      type: 'resetOptions',
                                      value: {
                                        'client-id': payPalID,
                                        currency: 'EUR',
                                      },
                                    });
                                  }
                                }}
                              />
                              <div className="text-center">
                                {
                                  state.orderItems.filter(
                                    (item: ItemCart) => item._id === car._id
                                  ).length
                                }
                              </div>
                              <Image
                                className="cursor-pointer"
                                src={DownChevron}
                                alt="decrement item quantity"
                                onClick={(e) => {
                                  dispatch({
                                    type: 'DECREMENT_CART',
                                    payload: car._id,
                                  });
                                  e!.preventDefault();
                                  if (payPalFormButtons) {
                                    paypalDispatch({
                                      type: 'resetOptions',
                                      value: {
                                        'client-id': payPalID,
                                        currency: 'EUR',
                                      },
                                    });
                                  }
                                }}
                              />
                            </td>
                            <td className="font-bold">{car.model}</td>
                            <td className="">
                              {' '}
                              {formatter.format(
                                state.orderItems.filter(
                                  (item: ItemCart) => item._id === car._id
                                ).length * car.price
                              )}
                            </td>
                            <td>
                              <Image
                                src={DeleteItem}
                                className="cursor-pointer"
                                alt="remove items from cart"
                                onClick={(e) => {
                                  dispatch({
                                    type: 'REMOVE_ONE_ITEM',
                                    payload: car._id,
                                  });
                                  e!.preventDefault();
                                  if (payPalFormButtons) {
                                    paypalDispatch({
                                      type: 'resetOptions',
                                      value: {
                                        'client-id': payPalID,
                                        currency: 'EUR',
                                      },
                                    });
                                  }
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="space-y-2 py-2">
                    <div className="flex flex-row justify-between">
                      <p> Items:</p>
                      <p className="pr-1">{formatter.format(cartPrice)}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p> Tax (VAT 24%): </p>
                      <p className="pr-1">
                        {formatter.format((cartPrice * 24) / 100)}
                      </p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p> Shipping: </p>
                      <p className="pr-1"> {formatter.format(1)}</p>
                    </div>
                    <div className="flex flex-row justify-between text-lg border-2 border-black text-right p-1">
                      <p> Total Amount: </p>{' '}
                      <p>
                        {formatter.format(
                          cartPrice + (cartPrice * 24) / 100 + 1
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                {!orderSpinner ? (
                  <button type="submit" className="w-full md:w-3/6">
                    Place Order
                  </button>
                ) : (
                  <button type="submit" className="w-full md:w-3/6">
                    <div className="flex flex-row justify-center space-x-2 items-center">
                      <Image
                        className="animate-spin"
                        src={OrderSpinnerButton}
                        alt="Loading spinner for placing order"
                        width="20px"
                        height="20px"
                      />
                      <p>Place Order</p>
                    </div>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <h2 className="text-center mt-24">No items in the cart</h2>
      )}
    </div>
  );
};

export default Checkout;
