import { useEffect } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import { InferGetStaticPropsType } from 'next';
import { groupBy } from 'lodash';
import { byPropertiesOf } from '../utils/sort';
import dbUtils from '../utils/db';
import Car from '../models/Car';
import Manufacturer from '../models/Manufacturer';
import IndexCarSection from '../components/indexCarSection';
import IndexCarCarousel from '../components/indexCarCarousel';
import MainLandingPage from '../components/mainLandingPage';
import ReactFullpage from '@fullpage/react-fullpage';
import Meta from '../components/meta';

type IndexCarModel = {
  _id: string;
  featuredImage: string;
  manufacturer: { _id: string; brand: string };
  price: number;
  model: string;
  description: string;
  quantity: number;
};

type SortingProperties = {
  model: string;
};

const Home: NextPage = ({
  cars,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  let groupedCars: Array<any> = [];

  useEffect(() => {
    const groupedData = groupBy(
      cars.sort(byPropertiesOf<SortingProperties>(['model'])),
      'manufacturer.brand'
    );

    for (var key in groupedData) {
      if (Object.prototype.hasOwnProperty.call(groupedData, key)) {
        groupedCars.push([groupedData[key]]);
      }
    }
  }, [cars]);

  return (
    <div className="scrollbar-hide">
      <Meta title="ESHOP" />
      {groupedCars ? (
        <ReactFullpage
          navigation={false}
          normalScrollElements=".Cart, .Menu"
          render={() => (
            <ReactFullpage.Wrapper>
              {/* <MainLandingPage /> */}
              <div data-menuanchor="top" className="section"></div>
              {groupedCars.map((item: any) => (
                <div
                  data-anchor={item[0][0].manufacturer.brand.replace(/ /g, '')}
                  className="section"
                  key={item._id}
                >
                  {item[0].length === 1 ? (
                    <IndexCarSection car={item[0][0]} />
                  ) : (
                    <IndexCarCarousel sections={item[0]} />
                  )}
                </div>
              ))}
            </ReactFullpage.Wrapper>
          )}
        />
      ) : (
        <div className="mt-20 text-center">
          Something went wrong. Please contact the administrator
        </div>
      )}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  await dbUtils.connect();
  const manufacturer = await Manufacturer.find({});
  if (manufacturer) {
    null;
  }
  const res = await Car.find({})
    .select('model price description quantity featuredImage')
    .populate({
      path: 'manufacturer',
      select: 'brand',
    });
  const cars = JSON.parse(JSON.stringify(res));
  await dbUtils.disconnect();

  return {
    props: {
      cars,
    },
    revalidate: 10,
  };
};

export type { IndexCarModel };
export default Home;
