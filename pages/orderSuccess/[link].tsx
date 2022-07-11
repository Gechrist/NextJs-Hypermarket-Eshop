import { useEffect, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { StateContext } from '../../utils/context';

const OrderSuccess = () => {
  const router = useRouter();
  const { link } = router.query;
  const { dispatch } = useContext<any>(StateContext);

  useEffect(() => {
    dispatch({ type: 'ORDER_COMPLETED' });
  }, []);

  return (
    <div className="flex flex-col mt-20 space-y-4 items-center">
      <h2>THANK YOU FOR YOUR ORDER</h2>

      <div className="flex flex-row">
        {' '}
        <p>Your Order ID is:&nbsp;</p>
        <Link href={`/order/${link}`} passHref>
          <p className="link">{link} </p>
        </Link>
      </div>
      <p>An order confirmation has been emailed to you</p>
      <button onClick={() => router.push('/')}>Continue Shopping</button>
    </div>
  );
};

export default OrderSuccess;
