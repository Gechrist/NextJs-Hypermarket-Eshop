import { useEffect, useState, useCallback, useContext } from 'react';
import Car from '../../models/Car';
import dbUtils from '../../utils/db';
import formatter from '../../utils/prices';
import { GetStaticProps, GetStaticPaths } from 'next';
import { InferGetStaticPropsType } from 'next';
import type { NextPage } from 'next';
import CarImageCarousel from '../../components/carImageCarousel';
import { StateContext } from '../../utils/context';
import Meta from '../../components/meta';

const Cars: NextPage = ({
  car,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [cartQuantity, setCartQuantity] = useState<number>(1);
  const [images, setImages] = useState<Array<string>>([]);

  useEffect(() => {
    car.featuredImage && setImages((images) => [...images, car.featuredImage]);
    car.imageGallery.length > 0 &&
      car.imageGallery.map((item: string) => {
        item !== '' && setImages((images) => [...images, item]);
      });
  }, [car.imageGallery, car.featuredImage]);

  const increaseQuantity = useCallback(
    () => setCartQuantity((cartQuantity) => cartQuantity + 1),
    []
  );
  const decreaseQuantity = useCallback(
    () => setCartQuantity((cartQuantity) => cartQuantity - 1),
    []
  );

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
    <div>
      {car ? (
        <div className="min-h-screen min-w-screen md:mt-14 mt-20 overflow-y-auto">
          <Meta title={car.model} />
          <h1 className="text-center">{car.model}</h1>
          <p className="text-center italic p-1 lg:p-8">{car.description}</p>
          <div className="flex-col md:flex-row md:h-auto flex">
            <div className="flex mx md:ml-1 mt-14 md:mt-0 order-last pt-2 flex-col space-y-4 md:space-y-8 w-full md:w-3/6">
              <table>
                <tbody>
                  <tr className="border-b border-gray-700 whitespace-nowrap">
                    <td>Acceleration 0-100 kmh:</td>
                    <td>{car.acceleration}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>BHP:</td>
                    <td>{car.horsepower} bhp</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>Electric:</td>
                    <td>{car.electric ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>Hybrid:</td>
                    <td>{car.hybrid ? 'Yes' : 'No'}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>Specifications:</td>
                    <td>{car.specifications}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>Speed:</td>
                    <td>{car.speed} kmh</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>Weight:</td>
                    <td>{car.weight} kg</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td>Quantity:</td>
                    <td>
                      <div className="flex flex-row ">
                        <p
                          className="w-6 py-1 cursor-pointer rounded-l bg-white text-black text-center"
                          onClick={() => {
                            cartQuantity > 1 ? decreaseQuantity() : null;
                          }}
                        >
                          {'<'}
                        </p>
                        <p className="w-12 py-1 bg-white text-black text-center">
                          {cartQuantity}
                        </p>
                        <p
                          className="w-6 py-1 cursor-pointer rounded-r bg-white text-black text-center"
                          onClick={() => increaseQuantity()}
                        >
                          {'>'}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-col mt-2 w-full md:w-3/6">
              {car.featuredImage && (
                <div className="relative block md:justify-end w-full h-72 md:h-full">
                  <CarImageCarousel sections={images} car={car.model} />
                </div>
              )}
            </div>
          </div>
          <h2 className="text-center mt-8">
            Price: {formatter.format(car.price * cartQuantity)}
          </h2>
          {car.quantity > 0 ? (
            <div className="flex justify-center">
              <button
                onClick={() =>
                  AddtoCart(car._id, car.model, cartQuantity, car.price)
                }
                className="w-3/6"
              >
                Add to Cart
              </button>
            </div>
          ) : (
            <p className="text-center">Out of stock</p>
          )}
        </div>
      ) : (
        <div className="mt-20 text-center">
          Something went wrong. Please contact the administrator
        </div>
      )}
    </div>
  );
};

// This function gets called at build time
export const getStaticPaths: GetStaticPaths = async () => {
  await dbUtils.connect();
  const res = await Car.find({});
  const cars = JSON.parse(JSON.stringify(res));
  await dbUtils.disconnect();

  const paths = cars.map((car: any) => ({
    params: { id: car._id },
  }));

  // We'll pre-render only these paths at build time.
  return { paths, fallback: 'blocking' };
};

// This also gets called at build time
export const getStaticProps: GetStaticProps = async ({ params }) => {
  await dbUtils.connect();
  const res = await Car.findById(params!.id);
  const car = JSON.parse(JSON.stringify(res));
  await dbUtils.disconnect();

  // Pass post data to the page via props
  return { props: { car }, revalidate: 10 };
};

export default Cars;
