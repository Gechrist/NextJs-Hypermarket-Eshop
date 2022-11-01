import React, { FC, useMemo, useState } from 'react';
import formatter from '../utils/prices';
import { byPropertiesOf } from '../utils/sort';
import Link from 'next/link';
import Image from 'next/image';
import RedXIcon from '../public/icons/red-x.svg';
import { toast } from 'react-toastify';
import Modal from './deleteModal';

type Props = {
  data: any[];
  type: string;
  updateData: (id: string) => void;
};

const Table: FC<Props> = ({ type, data, updateData }: Props) => {
  const itemsPerPage: number = 10;
  const [pagination, setPagination] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [searchData, setSearchData] = useState<Array<any>>([]);
  const [tableData, setTableData] = useState<Array<any>>([]);
  const [nothingFoundSearchMessage, setNothingFoundSearchMessage] =
    useState<boolean>(false);
  const [sortedBy, setSortedBy] = useState<string>('');
  const [modalIsOpen, setIsOpen] = useState<boolean>(false);
  const [modalID, setModalID] = useState<string>('');
  const [modalType, setModalType] = useState<string>('');
  const [modalName, setModalName] = useState<string>('');

  //assign data to table
  useMemo(() => {
    setTableData([...data]);
  }, [data]);

  useMemo(() => {
    if (data.length > itemsPerPage) {
      setPagination(true);
      pagesFunction();
    } else {
      setPagination(false);
      setPage(1);
    }

    if (data.length > itemsPerPage && data.length % itemsPerPage === 0) {
      if (page > 1) {
        setPage(page - 1);
      } else {
        setPage(1);
      }
    }
  }, [data]);

  useMemo(() => {
    if (nothingFoundSearchMessage) {
      toast.info('No results found');
    }
  }, [nothingFoundSearchMessage]);

  //search data
  const searchHandle = (search: string) => {
    switch (type) {
      case 'Car':
        setSearchData(
          data!.filter(
            (record) =>
              record.model.toLowerCase().includes(search) ||
              record.quantity.toString().toLowerCase().includes(search) ||
              record.price.toString().toLowerCase().includes(search)
          )
        );
        break;
      case 'Manufacturer':
        setSearchData(
          data!.filter((record) => record.brand.toLowerCase().includes(search))
        );
        break;
      case 'User':
        setSearchData(
          data!.filter(
            (record) =>
              record.name.toLowerCase().includes(search) ||
              record.email.toString().toLowerCase().includes(search) ||
              record.createdAt.toString().toLowerCase().includes(search)
          )
        );
        break;
      case 'Order':
        setSearchData(
          data.filter(
            (record) =>
              record._id.toLowerCase().includes(search) ||
              record.user.name.toString().toLowerCase().includes(search) ||
              record.totalPrice.toString().toLowerCase().includes(search) ||
              record.createdAt.toString().toLowerCase().includes(search) ||
              record.deliveredAt.toString().toLowerCase().includes(search)
          )
        );
        break;
      default:
        break;
    }
  };

  const keyPressHandle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (search && e.code === 'Enter') {
      searchHandle(search);
    }
  };

  type SortingProperties = {
    model: string;
    quantity: number;
    totalPrice: number;
    name: string;
    email: number;
    createdAt: Date;
  };

  // sort data
  const sortHandle = (value: any) => {
    let sortedData: any[];

    if (value === sortedBy) {
      value = `-${value}`;
    }

    if (search && searchData.length > 0) {
      sortedData = [...searchData];
      sortedData.sort(byPropertiesOf<SortingProperties>([value]));
      setSearchData(sortedData);
    } else {
      sortedData = [...tableData];
      sortedData.sort(byPropertiesOf<SortingProperties>([value]));
      setTableData(sortedData);
    }

    setSortedBy(value);
  };

  const pagesFunction = () => {
    if (data!.length % itemsPerPage === 0) {
      setPages(data!.length / itemsPerPage);
    } else {
      setPages(Math.floor(data!.length / itemsPerPage) + 1);
    }
  };

  //Display search results
  const displayData = useMemo(() => {
    if (search && searchData.length === 0) {
      setNothingFoundSearchMessage(true);
    } else {
      setNothingFoundSearchMessage(false);
    }
    const start = (page - 1) * itemsPerPage;
    if (searchData.length > 0) {
      return searchData.slice(start, start + itemsPerPage);
    } else {
      return tableData.slice(start, start + itemsPerPage);
    }
  }, [page, searchData, tableData]);

  //delete data
  const deleteHandle = async (type: string, id: string): Promise<void> => {
    try {
      const response = await fetch('api/deleteDbData', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: type, id: id }),
      });
      const notification = await response.json();
      if (
        notification.message.includes('error') ||
        notification.message.includes('not found')
      ) {
        toast.error(notification.message);
      } else {
        toast.success(notification.message);
        if (searchData) {
          setSearchData([...searchData.filter((i) => i._id !== id)]);
        }
        updateData(id);
      }
    } catch (e) {
      console.log((e as Error).message);
      toast.error(`An unexpected error has occured: ${(e as Error).message}`);
    }
  };

  //modal functions
  const openModal = (id: string, type: string, name: string) => {
    setModalID(id);
    setModalType(type);
    setModalName(name);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col md:w-2/3 mx-auto justify-evenly mt-10">
      {data?.length === 0 && !nothingFoundSearchMessage ? (
        <h2 className="text-center">No Data Available</h2>
      ) : (
        <div>
          <div className="flex flex-row w-auto">
            <Link href={`/create/${type.toLowerCase()}`} passHref>
              <button className="mb-2">Create New</button>
            </Link>
            <input
              className="ml-2 mr-1 shrink-0 text-black w-auto mb-2 rounded grow"
              type="text"
              placeholder="  Search..."
              value={search}
              onKeyPress={keyPressHandle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
            {search && (
              <div className="relative">
                <div className="block mb-2 right-2 top-3 xl:top-5 absolute h-6 w-8 cursor-pointer">
                  <Image
                    className="px-2"
                    aria-label="Clear Search Results"
                    layout="fill"
                    objectFit="contain"
                    src={RedXIcon}
                    alt="Clear Search Results"
                    onClick={() => {
                      setSearch('');
                      setSearchData([]);
                    }}
                  />
                </div>
              </div>
            )}
            <button
              className="mb-2 px-2 rounded-r"
              onClick={() => searchHandle(search)}
            >
              Search
            </button>
          </div>

          <div className="rounded border-2 bg-white text-black border-black">
            <table className="table-fixed w-full">
              <thead className="w-full border-b-2 border-indigo-900">
                {type === 'User' ? (
                  <tr className="text-center py-2">
                    <th onClick={() => sortHandle('name')}>Name</th>
                    <th onClick={() => sortHandle('email')}>Email</th>
                    <th onClick={() => sortHandle('createdAt')}>Join Date</th>
                  </tr>
                ) : type === 'Car' ? (
                  <tr className="text-center py-2">
                    <th onClick={() => sortHandle('model')}>Model</th>
                    <th onClick={() => sortHandle('quantity')}>Quantity</th>
                    <th onClick={() => sortHandle('price')}>Price</th>
                  </tr>
                ) : type === 'Manufacturer' ? (
                  <tr className="text-center py-2">
                    <th className="w-5/6" onClick={() => sortHandle('brand')}>
                      Manufacturer
                    </th>
                  </tr>
                ) : type === 'Order' ? (
                  <tr className="text-center py-2">
                    <th onClick={() => sortHandle('id')}>Id</th>
                    <th onClick={() => sortHandle('user')}>User</th>
                    <th onClick={() => sortHandle('price')}>Price</th>
                    <th onClick={() => sortHandle('date')}>Date</th>
                  </tr>
                ) : null}
              </thead>
              <tbody>
                {type === 'User' &&
                  displayData.map((item, index) => (
                    <tr
                      className="text-center text-black bg-white border-b-2 border-indigo-900"
                      key={index}
                    >
                      <td className="link">
                        <Link href={`/user/${item._id}`} passHref>
                          {item.name}
                        </Link>
                      </td>
                      <td className="link break-all">
                        <Link href={`mailto:${item.email}`}>{item.email}</Link>
                      </td>
                      <td>
                        {
                          new Date(item.createdAt)
                            .toLocaleString('el-gr')
                            .split(',')[0]
                        }
                      </td>
                      <td>
                        <button
                          onClick={() => openModal(item._id, type, item.name)}
                        >
                          Delete
                        </button>
                        {modalIsOpen && (
                          <Modal
                            id={modalID}
                            type={modalType}
                            name={modalName}
                            deleteHandle={deleteHandle}
                            closeModal={closeModal}
                          />
                        )}
                      </td>
                    </tr>
                  ))}

                {type === 'Car' &&
                  displayData.map((item, index) => (
                    <tr
                      className="text-center text-black bg-white border-b-2 border-indigo-900"
                      key={index}
                    >
                      <td className="link">
                        <Link href={`/car/${item._id}`} passHref>
                          {item.model}
                        </Link>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{formatter.format(item.price)}</td>
                      <td>
                        <button
                          onClick={() => openModal(item._id, type, item.model)}
                        >
                          Delete
                        </button>
                        {modalIsOpen && (
                          <Modal
                            id={modalID}
                            type={modalType}
                            name={modalName}
                            deleteHandle={deleteHandle}
                            closeModal={closeModal}
                          />
                        )}
                      </td>
                    </tr>
                  ))}

                {type === 'Manufacturer' &&
                  displayData.map((item, index) => (
                    <tr
                      className="text-center text-black bg-white border-b-2 border-indigo-900"
                      key={index}
                    >
                      <td className="link">
                        <Link href={`/manufacturer/${item._id}`} passHref>
                          {item.brand}
                        </Link>
                      </td>
                      <td>
                        <button
                          onClick={() => openModal(item._id, type, item.brand)}
                        >
                          Delete
                        </button>
                        {modalIsOpen && (
                          <Modal
                            id={modalID}
                            type={modalType}
                            name={modalName}
                            deleteHandle={deleteHandle}
                            closeModal={closeModal}
                          />
                        )}
                      </td>
                    </tr>
                  ))}

                {type === 'Order' &&
                  displayData.map((item, index) => (
                    <tr
                      className="text-center text-black bg-white border-b-2 border-indigo-900"
                      key={index}
                    >
                      <td className="link break-all py-4">
                        <Link href={`/order/${item._id}`} passHref>
                          {item._id}
                        </Link>
                      </td>
                      <td className="link break-all">
                        {(item?.user?._id && (
                          <Link href={`/user/${item.user._id}`} passHref>
                            {item.user.name}
                          </Link>
                        )) || (
                          <p className="text-black cursor-default">
                            {item.orderEmail}
                          </p>
                        )}
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
                      <td>
                        <button
                          onClick={() => openModal(item._id, type, item._id)}
                        >
                          Delete
                        </button>
                        {modalIsOpen && (
                          <Modal
                            id={modalID}
                            type={modalType}
                            name={modalName}
                            deleteHandle={deleteHandle}
                            closeModal={closeModal}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {pagination && (
            <div className="flex flex-row pt-2 space-x-2">
              {page !== 1 && (
                <button className="px-2" onClick={() => setPage(page - 1)}>
                  {' '}
                  Prev Page{' '}
                </button>
              )}
              {page !== pages && (
                <button className="px-2" onClick={() => setPage(page + 1)}>
                  {' '}
                  Next Page{' '}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Table;
