import { useState, useEffect } from 'react';
import { User as UserData } from '../../data/seedData';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'node:querystring';
import useSWR, { useSWRConfig } from 'swr';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import UserProfile from '../../components/userProfile';
import Image from 'next/image';
import LoadingIcon from '../../public/icons/three-dots.svg';
import Link from 'next/link';
import formatter from '../../utils/prices';

const UserView = () => {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data: session } = useSession();

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
    ['/api/getSingleDbData', router.query.id, 'User'],
    fetchWithId
  );

  const [profile, setProfile] = useState<boolean>(true);
  const [orders, setOrders] = useState<boolean>(false);

  useEffect(() => {
    if (session && !session?.isAdmin && session?.userID !== router.query.id) {
      router.push('/login');
    }
  }, [session]);

  useEffect(() => {
    if (data?.authError) {
      router.push('/login');
    }
    if (data?.message) {
      toast.error(`${data.message}`);
    }
    if (error) {
      toast.error(`An unexpected error has occured: ${error}`);
    }
  }, [data, error]);

  useEffect(() => {
    if (Object.keys(router.query).includes('orders')) {
      setProfile(false);
      setOrders(true);
    }
    if (Object.keys(router.query).includes('profile')) {
      setProfile(true);
      setOrders(false);
    }
  }, [router]);

  useEffect(() => {
    console.log(session);
    if (!session?.isAdmin && session?.userID !== router.query.id) {
      router.push('/login');
    }
  }, [session]);

  const userFormHandle = async (reqData: UserData): Promise<void> => {
    try {
      await mutate(
        ['/api/getSingleDbData', router.query.id, 'User'],
        { ...data, ...reqData },
        false
      );
      const response = await fetch('/api/updateDbData', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: reqData,
          id: router.query.id,
          type: 'User',
        }),
      });
      const notification = await response.json();
      await mutate(['/api/getSingleDbData', router.query.id, 'User']);
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

  const displayHandle = () => {
    setOrders((prevState) => !prevState);
    setProfile((prevState) => !prevState);
  };

  return (
    <div className="container min-w-full mt-20">
      {error && toast.error(`An unexpected error has occured: ${error}`)}
      {data ? (
        <div className="flex mx-auto justify-around flex-row md:w-4/6">
          <div className="flex flex-col space-y-2 w-2/6">
            <button
              onClick={() => {
                displayHandle();
              }}
            >
              Profile
            </button>
            <button onClick={() => displayHandle()}>Orders</button>
          </div>
          {profile && data && (
            <div className="w-3/6">
              {' '}
              <UserProfile formData={data} formHandle={userFormHandle} />
            </div>
          )}
          {orders && (
            <div className="w-3/6 rounded bg-white text-black py-4 ">
              {data?.orders?.length > 0 ? (
                <table className="table-auto w-full">
                  <thead className="w-full border-b-2 border-grey-400">
                    <tr>
                      <th>Order Id</th>
                      <th>Value</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="overflow-y-scroll">
                    {data.orders.map((item: any, index: number) => (
                      <tr
                        className="text-center text-black bg-white border-b-2 border-grey-400"
                        key={index}
                      >
                        <td className="link break-all py-4">
                          <Link href={`/order/${item._id}`} passHref>
                            {`xxxxx${item._id.substring(
                              item._id.length - 4,
                              item._id.length
                            )}`}
                          </Link>
                        </td>
                        <td className="break-all">
                          {formatter.format(item.totalPrice)}
                        </td>
                        <td>
                          {
                            new Date(item.createdAt)
                              .toLocaleString('el-gr')
                              .split(',')[0]
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <h4 className="text-center">No Orders Found</h4>
              )}
            </div>
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

export default UserView;
