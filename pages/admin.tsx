import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { trackPromise } from 'react-promise-tracker';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Table from '../components/adminTable';
import LoadingIndicator from '../components/loadingIndicator';

const Admin: NextPage = () => {
  const [data, setData] = useState<Array<any>>([]);
  const [displayData, setDisplayData] = useState<boolean>(false);
  const [displayPage, setDisplayPage] = useState<boolean>(false);
  const [tableData, setTableData] = useState<string>('');
  const [updateState, setUpdateState] = useState<boolean>(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status != 'loading' && !session?.isAdmin) {
      router.push('/login');
    } else {
      setDisplayPage(true);
    }
  }, [session, status]);

  // run only when data changes and not on component mounting
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (updateState) {
      setUpdateState(false);
    } else {
      setDisplayData((prevState) => !prevState);
    }
  }, [data]);

  // if (session && !session.isAdmin) {
  //   // router.push('/login');
  // }
  const dataHandle = async (reqData: string) => {
    try {
      const response = await fetch('/api/getDbData', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/text',
        },
        body: reqData,
      });
      const data = await response.json();
      if (data?.authError) {
        return router.push('/login');
      }
      setData(data);
    } catch (e) {
      toast.error(`An unexpected error has occured: ${(e as Error).message}`);
    }
  };

  const updateData = (id: string) => {
    setUpdateState(true);
    setData([...data.filter((i) => i._id !== id)]);
  };

  return (
    <div>
      {displayPage && (
        <div className="min-w-full mx-auto mt-20 md:mt-10">
          <h2 className="text-center">Administration Board</h2>
          <div className="flex flex-row justify-center space-x-2 mt-10 text-xl">
            <button
              onClick={() => {
                // reset to initial state
                if (displayData) {
                  setData([]);
                }
                // display data for the first time and then hide it.
                if (!displayData || tableData !== 'Car') {
                  trackPromise(dataHandle('Car'));
                  setTableData('Car');
                } else {
                  setData([]);
                }
              }}
            >
              Cars
            </button>
            <button
              onClick={() => {
                if (displayData) {
                  setData([]);
                }
                if (!displayData || tableData !== 'Manufacturer') {
                  trackPromise(dataHandle('Manufacturer'));
                  setTableData('Manufacturer');
                } else {
                  setData([]);
                }
              }}
            >
              Manufacturers
            </button>
            <button
              onClick={() => {
                if (displayData) {
                  setData([]);
                }
                if (!displayData || tableData !== 'Order') {
                  trackPromise(dataHandle('Order'));
                  setTableData('Order');
                } else {
                  setData([]);
                }
              }}
            >
              Orders
            </button>
            <button
              onClick={() => {
                if (displayData) {
                  setData([]);
                }
                if (!displayData || tableData !== 'User') {
                  trackPromise(dataHandle('User'));
                  setTableData('User');
                } else {
                  setData([]);
                }
              }}
            >
              Users
            </button>
          </div>

          <div className="text-center mt-12 ml-4 lg:ml-0 ">
            <LoadingIndicator />
          </div>
          {displayData && (
            <Table type={tableData} data={data} updateData={updateData} />
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
