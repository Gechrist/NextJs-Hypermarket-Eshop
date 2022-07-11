// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Users, Cars, Manufacturers, Orders } from '../../data/seedData';
import User from '../../models/User';
import Car from '../../models/Car';
import Manufacturer from '../../models/Manufacturer';
import Order from '../../models/Order';
import dbUtils from '../../utils/db';

type Data = {
  msg: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbUtils.connect();
  await User.deleteMany();
  await User.insertMany(Users);
  await Car.deleteMany();
  await Car.insertMany(Cars);
  await Manufacturer.deleteMany();
  await Manufacturer.insertMany(Manufacturers);
  await Order.deleteMany();
  await Order.insertMany(Orders);
  await dbUtils.disconnect();
  res.status(200).send({ msg: 'Seeding done' });
}
