import { useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import OrderProfile from '../../components/orderProfile';
import { useRouter } from 'next/router';
import Image from 'next/image';
import LoadingIcon from '../../public/icons/three-dots.svg';
import { ParsedUrlQuery } from 'node:querystring';
import { toast } from 'react-toastify';

type formArgs = {
  isPaid: boolean;
  isDelivered: boolean;
  paidAt: Date | undefined;
  deliveredAt: Date | undefined;
};

const OrderView = () => {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const fetchWithId = (url: string, id: ParsedUrlQuery, type: string) =>
    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, type }),
    }).then((r) => r.json());

  let { data, error } = useSWR(
    ['/api/getSingleDbData', router.query.id, 'Order'],
    fetchWithId
  );
  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    return () => {
      controller.abort();
    };
  }, []);

  const orderFormHandle = async (reqData: formArgs): Promise<void> => {
    try {
      await mutate(
        ['/api/getSingleDbData', router.query.id, 'Order'],
        { ...data, ...reqData },
        false
      );
      const response = await fetch('/api/updateDbData', {
        signal: signal,
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: reqData,
          id: router.query.id,
          type: 'Order',
        }),
      });
      const notification = await response.json();
      await mutate(['/api/getSingleDbData', router.query.id, 'Order']);
      if (
        notification.message.includes('error') ||
        notification.message.includes('not found')
      ) {
        toast.error(notification.message);
      } else {
        toast.success(notification.message);
      }
    } catch (e) {
      console.log((e as Error).message);
      toast.error(`An unexpected error has occured: ${error}`);
    }
  };

  return (
    <div className="container min-w-full mt-10">
      {error && toast.error(`An unexpected error has occured: ${error}`)}
      {data ? (
        <div className="flex mx-auto justify-around flex-row md:w-4/6">
          {data && (
            <OrderProfile formOrderData={data} formHandle={orderFormHandle} />
          )}
        </div>
      ) : (
        <div className="text-center mt-24">
          <Image src={LoadingIcon} alt="Loading Animation" />
        </div>
      )}
    </div>
  );
};
export type { formArgs };
export default OrderView;
