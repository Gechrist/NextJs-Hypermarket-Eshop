import React, { FC } from 'react';
import Image from 'next/image';
import RedXIcon from '../public/icons/red-x.svg';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import formatter from '../utils/prices';

type Props = {
  closeModal(): void;
  showAmount: number;
  updatedStripeAmount: boolean;
  paymentData: React.Dispatch<
    React.SetStateAction<{
      date: number;
      amount: string;
      currency: string;
      paymentID: string;
      status: string;
    }>
  >;
};

const CreditCardModal: FC<Props> = ({
  closeModal,
  showAmount,
  updatedStripeAmount,
  paymentData,
}: Props) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }
    if (updatedStripeAmount) {
      const { error } = await elements.fetchUpdates();

      if (error) {
        toast.error(error!.message);
        return;
      }
    }
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${
          process.env.NEXT_PUBLIC_NEXTAUTH_URL as string
        }/checkout`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      toast.error(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        paymentData({
          date: result.paymentIntent.created,
          amount: (result.paymentIntent.amount / 100).toLocaleString(),
          currency: result.paymentIntent.currency,
          paymentID: result.paymentIntent.id,
          status: result.paymentIntent.status,
        });
        closeModal();
      }
    }
  };

  return (
    <>
      <div
        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
        data-keyboard="false"
      >
        <div className="relative w-72 my-6 mx-auto max-w-3xl">
          {/*content*/}
          <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            {/*header*/}
            <div className="flex flex-row items-center justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h5 className="lg:text-xl pt-2 font-semibold">
                Your Credit Card Details
              </h5>
              <Image
                src={RedXIcon}
                alt="close credit card payment window"
                className="cursor-pointer"
                onClick={closeModal}
                width={18}
                height={18}
              />
            </div>
            {/*body*/}
            <div className="relative p-6 flex-auto">
              <div className="my-4 text-blueGray-500 text-lg leading-relaxed">
                <PaymentElement />
              </div>
            </div>
            {/*footer*/}
            <div className="flex items-center justify-center p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                className="w-full"
                type="button"
                onClick={() => {
                  handleSubmit();
                }}
              >
                Pay {formatter.format(showAmount)}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-50 fixed inset-0 z-40 bg-black" />
    </>
  );
};

export default CreditCardModal;
