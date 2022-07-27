import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'node:querystring';
import { toast } from 'react-toastify';
import { Car as CarData } from '../../data/seedData';
import { useSession } from 'next-auth/react';
import useSWR, { useSWRConfig } from 'swr';
import CarProfile from '../../components/carProfile';
import Image from 'next/image';
import LoadingIcon from '../../public/icons/three-dots.svg';

const CarView = () => {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data: session, status } = useSession();
  const [saveButtonSpinner, setSaveButtonSpinner] = useState<boolean>(false);
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
    ['/api/getSingleDbData', router.query.id, 'Car'],
    fetchWithId
  );

  useEffect(() => {
    if (status != 'loading' && !session?.isAdmin) {
      router.push('/login');
    }
  }, [session, status]);

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

  const carFormHandle = async (reqData: CarData): Promise<void> => {
    try {
      await mutate(
        ['/api/getSingleDbData', router.query.id, 'Car'],
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
          type: 'Car',
        }),
      });
      const notification = await response.json();
      setSaveButtonSpinner(false);
      await mutate(['/api/getSingleDbData', router.query.id, 'Car']);
      if (
        notification.message.includes('error') ||
        notification.message.includes('not found')
      ) {
        toast.error(notification.message);
      } else {
        toast.success(notification.message);
      }
    } catch (e) {
      setSaveButtonSpinner(false);
      console.log((e as Error).message);
      toast.error(`An unexpected error has occured: ${error}`);
    }
  };

  return (
    <div className="container min-w-full mt-10">
      {data && !data.authError && !data.message ? (
        <div className="flex mx-auto justify-around flex-row md:w-4/6">
          {data && (
            <CarProfile
              formCarData={data?.car}
              formManufacturersData={data?.manufacturers}
              formHandle={carFormHandle}
              spinnerFunction={setSaveButtonSpinner}
              spinnerState={saveButtonSpinner}
            />
          )}
        </div>
      ) : data?.message ? null : (
        <div className="text-center mt-24">
          <Image src={LoadingIcon} alt="Loading Animation" />
        </div>
      )}
    </div>
  );
};

export default CarView;
