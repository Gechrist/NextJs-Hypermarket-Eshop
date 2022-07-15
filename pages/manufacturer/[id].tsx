import { useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import ManufacturerProfile from '../../components/manufacturerProfile';
import { Manufacturer as ManufacturerData } from '../../data/seedData';
import { useRouter } from 'next/router';
import Image from 'next/image';
import LoadingIcon from '../../public/icons/three-dots.svg';
import { ParsedUrlQuery } from 'node:querystring';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

const ManufacturerView = () => {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data: session } = useSession();
  const controller = new AbortController();
  const signal = controller.signal;

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
    ['/api/getSingleDbData', router.query.id, 'Manufacturer'],
    fetchWithId
  );

  useEffect(() => {
    if (session && !session?.isAdmin) {
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
    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!session?.isAdmin) {
      router.push('/login');
    }
  }, [session]);

  const manufacturerFormHandle = async (
    reqData: ManufacturerData
  ): Promise<void> => {
    try {
      await mutate(
        ['/api/getSingleDbData', router.query.id, 'Manufacturer'],
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
          type: 'Manufacturer',
        }),
      });
      const notification = await response.json();
      await mutate(['/api/getSingleDbData', router.query.id, 'Manufacturer']);
      if (notification.message.includes('error')) {
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
            <ManufacturerProfile
              formManufacturerData={data}
              formHandle={manufacturerFormHandle}
            />
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

export default ManufacturerView;
