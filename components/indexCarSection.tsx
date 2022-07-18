import { FC } from 'react';
import Image from 'next/image';
import formatter from '../utils/prices';
import Link from 'next/link';
import { IndexCarModel } from '../pages/index';
import { useContext } from 'react';
import { StateContext } from '../utils/context';

type Props = {
  car: IndexCarModel;
};

const IndexCarSection: FC<Props> = ({ car }: Props) => {
  const { dispatch } = useContext<any>(StateContext);

  const AddtoCart = (
    _id: string,
    model: string,
    quantity: number,
    price: number
  ) => {
    dispatch({
      type: 'ADDTO_CART',
      payload: { _id, model, quantity, price },
    });
  };

  return (
    <div className="min-h-screen min-w-screen grid items-center">
      <div className="flex-col md:flex-row md:h-auto flex">
        <div className="flex order-last pt-2 flex-col space-y-4 md:space-y-8 w-full md:w-3/6">
          <Link href={`/cars/${car._id}`} passHref>
            <h1 className="text-center link">{car.model}</h1>
          </Link>
          <p className="text-center italic p-1">{car.description}</p>
          <p className="text-center">{formatter.format(car.price)}</p>
          {car.quantity > 0 ? (
            <div className="flex justify-center">
              <button
                onClick={() => AddtoCart(car._id, car.model, 1, car.price)}
                className="w-3/6 "
              >
                Add to Cart
              </button>
            </div>
          ) : (
            <p className="text-center">Out of stock</p>
          )}
        </div>
        <div className="flex flex-col w-full md:w-3/6">
          {car.featuredImage && (
            <div className="relative block md:justify-end w-full h-72 md:h-full">
              <div className="absolute border-0 w-full h-2/6 md:h-1/6 z-50 top-0 bg-gradient-to-b from-gray-900" />
              <div className="absolute border-0 w-full h-2/6 md:h-1/6 z-50 bottom-0 bg-gradient-to-t from-gray-900" />
              <Image
                src={car.featuredImage}
                alt={`${car.model} image`}
                aria-label={`${car.model} image`}
                layout="fill"
                objectFit="cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexCarSection;
