import React, { FC } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Order } from '../data/seedData';
import { formArgs } from '../pages/order/[id]';
import { useSession } from 'next-auth/react';
import formatter from '../utils/prices';
import DateTimePicker from 'react-datetime-picker/dist/entry.nostyle';
import 'react-datetime-picker/dist/DateTimePicker.css';

interface OrderData extends Order {
  _id: string;
}
type Props = {
  formOrderData: OrderData;
  formHandle(args: formArgs): Promise<void>;
};

const OrderProfile: FC<Props> = ({ formOrderData, formHandle }: Props) => {
  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors },
  } = useForm();

  const defaultValues = {
    id: formOrderData._id,
    user: formOrderData.user,
    orderEmail: formOrderData.orderEmail,
    orderItems: formOrderData.orderItems,
    shippingAddress: formOrderData.shippingAddress,
    paymentMethod: formOrderData.paymentMethod,
    itemsPrice: formOrderData.itemsPrice,
    shippingPrice: formOrderData.shippingPrice,
    taxPrice: formOrderData.taxPrice,
    totalPrice: formOrderData.totalPrice,
    isPaid: formOrderData.isPaid,
    isDelivered: formOrderData.isDelivered,
    paidAt: formOrderData.paidAt,
    deliveredAt: formOrderData.deliveredAt,
  };

  const { data: session } = useSession();

  const onSubmit: SubmitHandler<formArgs> = async (data: formArgs, e) => {
    e!.preventDefault();
    formHandle(data);
  };

  return (
    <div className="flex flex-col mt-10 w-auto md:w-full space-y-10 bg-white text-black border-2 border-gray-400 p-2 rounded">
      <form onSubmit={handleSubmit(onSubmit)} method="PUT">
        <div className="md:flex md:flex-row md:space-x-2 md:justify-between">
          <div className="flex flex-col space-y-2 mb-2 md:flex-grow">
            <h2 className="text-center">Client & Shipping Details:</h2>
            <div className="flex flex-row justify-start md:justify-center space-x-4">
              <label className="w-24" htmlFor="fullName">
                Full Name:
              </label>
              <input
                className="border-b-2 border-gray-400 flex-grow"
                type="text"
                id="fullName"
                disabled={session?.isAdmin ? false : true}
                aria-invalid={errors.fullName ? 'true' : 'false'}
                defaultValue={defaultValues.shippingAddress.fullName}
                {...register('fullName', {
                  required: { value: true, message: 'Full Name is required' },
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
                defaultValue={defaultValues.orderEmail}
                disabled={session?.isAdmin ? false : true}
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
            {errors.email && <span role="alert">{errors.email.message}</span>}
            <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
              <label className="w-24" htmlFor="address">
                Address:
              </label>
              <input
                className="border-b-2 border-gray-400 flex-grow"
                id="address"
                disabled={session?.isAdmin ? false : true}
                type="text"
                aria-invalid={errors.address ? 'true' : 'false'}
                defaultValue={defaultValues.shippingAddress.address}
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
                disabled={session?.isAdmin ? false : true}
                type="text"
                aria-invalid={errors.city ? 'true' : 'false'}
                defaultValue={defaultValues.shippingAddress.city}
                {...register('city', {
                  required: { value: true, message: 'City is required' },
                })}
              />{' '}
            </div>
            {errors.city && <span role="alert">{errors.city.message}</span>}
            <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
              <label className="w-24" htmlFor="postalCode">
                Postal Code:
              </label>
              <input
                className="border-b-2 border-gray-400 flex-grow"
                id="postalCode"
                disabled={session?.isAdmin ? false : true}
                type="text"
                aria-invalid={errors.postalCode ? 'true' : 'false'}
                defaultValue={defaultValues.shippingAddress.postalCode}
                {...register('postalCode', {
                  required: { value: true, message: 'PostalCode is required' },
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
                disabled={session?.isAdmin ? false : true}
                // readOnly
                aria-invalid={errors.country ? 'true' : 'false'}
                defaultValue={defaultValues.shippingAddress.country}
                {...register('country', {
                  required: { value: true, message: 'Country is required' },
                })}
              />
            </div>
            {errors.country && (
              <span role="alert">{errors.country.message}</span>
            )}
            {session?.isAdmin && (
              <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
                <label htmlFor="paymentOption" className="w-24">
                  Payment Method:
                </label>
                <Controller
                  control={control}
                  rules={{
                    validate: {
                      required: (value) =>
                        value === undefined || value === ''
                          ? 'Please select a payment method'
                          : true,
                    },
                  }}
                  name="paymentMethod"
                  defaultValue={defaultValues.paymentMethod}
                  render={({ field }) => (
                    <select
                      id="paymentOption"
                      defaultValue={defaultValues.paymentMethod}
                      className="text-black bg-gray-100 border-b-2 border-grey-400 flex-grow text-center"
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        field.name = 'paymentMethod';
                        field.onChange(e.target.value);
                      }}
                    >
                      <option value="cash">Cash on Delivery</option>
                      <option value="creditCard">Credit Card</option>
                      <option value="payPal">PayPal</option>
                      <option value="wireTransfer">Wire Transfer</option>
                    </select>
                  )}
                />
              </div>
            )}
            {session?.isAdmin && errors.paymentMethod && (
              <span role="alert">{errors.paymentMethod.message}</span>
            )}
          </div>
          <div className=" flex flex-col bg-gray-200 p-2 mb-2 space-y-2 h-auto w-auto md:flex-grow">
            <h2 className="text-center">Order Details:</h2>
            <h2 className="font-bold">Order ID: {defaultValues.id}</h2>
            <table>
              <tbody>
                {defaultValues.orderItems.map((car, index) => (
                  <tr key={index}>
                    <td>{car.quantity}</td>
                    <td>X</td>
                    <td className="font-bold">
                      {typeof car.item !== 'string' && car.item.model}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t-2 border-black space-y-2 py-2">
              <div className="flex flex-row justify-between">
                <p> Items Price:</p>
                <p className="pr-1">
                  {' '}
                  {formatter.format(defaultValues.itemsPrice)}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p> Tax Price: </p>
                <p className="pr-1">
                  {formatter.format(defaultValues.taxPrice)}
                </p>
              </div>
              <div className="flex flex-row justify-between">
                <p> Shipping Price: </p>{' '}
                <p className="pr-1">
                  {' '}
                  {formatter.format(defaultValues.shippingPrice)}
                </p>
              </div>
              {!session?.isAdmin && (
                <div className="flex flex-row justify-between">
                  Payment Method:
                  {defaultValues.paymentMethod === 'cash' ? (
                    <p>Cash on Delivery</p>
                  ) : defaultValues.paymentMethod === 'creditCard' ? (
                    <p>Credit/Debit Card</p>
                  ) : defaultValues.paymentMethod === 'payPal' ? (
                    <p>PayPal</p>
                  ) : defaultValues.paymentMethod === 'wireTransfer' ? (
                    <p>Wire Transfer</p>
                  ) : (
                    ''
                  )}
                </div>
              )}
              <div className="flex flex-row justify-between text-lg border-2 border-black text-right p-1">
                <p> Total Price: </p>{' '}
                <p className="font-bold">
                  {' '}
                  {formatter.format(defaultValues.totalPrice)}
                </p>
              </div>
            </div>
            {session?.isAdmin && (
              <div>
                <div className="flex flex-row justify-start space-x-4">
                  <label className="w-24" htmlFor="isPaid">
                    Paid:
                  </label>
                  <input
                    className="md: mt-2"
                    id="isPaid"
                    disabled={session?.isAdmin ? false : true}
                    type="checkbox"
                    defaultChecked={defaultValues.isPaid}
                    {...register('isPaid', {
                      validate: {
                        requiredIfDelivered: (value: string) => {
                          const { paidAt } = getValues();
                          if (!value && paidAt)
                            return 'Please check the Paid checkbox';
                        },
                      },
                    })}
                  />
                </div>
                {errors.isPaid && (
                  <span role="isPaid">{errors.isPaid.message}</span>
                )}
                <div className="flex flex-row justify-start space-x-4 mt-4 -ml-4 mb-4">
                  <style>
                    {`.react-datetime-picker__inputGroup__input:invalid {
                  background: transparent;
                }`}
                  </style>
                  <label className="w-24" htmlFor="PaidAt">
                    Date of Payment:
                  </label>
                  <Controller
                    control={control}
                    name="paidAt"
                    defaultValue={
                      defaultValues.paidAt ? defaultValues.paidAt : ''
                    }
                    rules={{
                      validate: {
                        requiredIfPaid: (value: string) => {
                          const { isPaid } = getValues();
                          if (!value && isPaid)
                            return 'Please enter date of payment';
                        },
                      },
                    }}
                    render={({ field }) => (
                      <DateTimePicker
                        name="paidAt"
                        disableCalendar={true}
                        clearIcon={null}
                        disableClock={true}
                        amPmAriaLabel="Select AM/PM"
                        dayAriaLabel="Select Day"
                        monthAriaLabel="Select Month"
                        yearAriaLabel="Select Year"
                        hourAriaLabel="Select Hour"
                        minuteAriaLabel="Select Minute"
                        value={defaultValues.paidAt}
                        onChange={(date: Date) => field.onChange(date)}
                        selected={field.value}
                      />
                    )}
                  />
                </div>
                {errors.paidAt && (
                  <span role="paidAt">{errors.paidAt.message}</span>
                )}
                <div className="flex flex-row justify-start space-x-4 ">
                  <label className="w-24" htmlFor="isDelivered">
                    Delivered:
                  </label>
                  <input
                    className="md: mt-2"
                    id="isDelivered"
                    disabled={session?.isAdmin ? false : true}
                    type="checkbox"
                    defaultChecked={defaultValues.isDelivered}
                    {...register('isDelivered', {
                      validate: {
                        requiredIfDelivered: (value: string) => {
                          const { deliveredAt } = getValues();
                          if (!value && deliveredAt)
                            return 'Please check the Delivered checkbox';
                        },
                      },
                    })}
                  />
                </div>
                {errors.isDelivered && (
                  <span role="isDelivered">{errors.isDelivered.message}</span>
                )}
                <div className="flex flex-row justify-start space-x-4 mt-4 mb-4">
                  <label className="w-24" htmlFor="deliveredAt">
                    Date of Delivery:
                  </label>
                  <Controller
                    control={control}
                    name="deliveredAt"
                    defaultValue={
                      defaultValues.deliveredAt ? defaultValues.deliveredAt : ''
                    }
                    rules={{
                      validate: {
                        requiredIfPaid: (value: string) => {
                          const { isDelivered } = getValues();
                          if (!value && isDelivered)
                            return 'Please enter date of delivery';
                        },
                      },
                    }}
                    render={({ field }) => (
                      <DateTimePicker
                        name="deliveredAt"
                        disableCalendar={true}
                        clearIcon={null}
                        disableClock={true}
                        amPmAriaLabel="Select AM/PM"
                        dayAriaLabel="Select Day"
                        monthAriaLabel="Select Month"
                        yearAriaLabel="Select Year"
                        hourAriaLabel="Select Hour"
                        minuteAriaLabel="Select Minute"
                        value={defaultValues.deliveredAt}
                        onChange={(date: Date) => field.onChange(date)}
                        selected={field.value}
                      />
                    )}
                  />
                </div>
                {errors.deliveredAt && (
                  <span role="deliveredAt">{errors.deliveredAt.message}</span>
                )}
              </div>
            )}
          </div>
        </div>
        {session?.isAdmin && (
          <div className="flex justify-center">
            <button type="submit" className="w-full md:w-3/6">
              Save
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrderProfile;
