import { NextApiRequest, NextApiResponse } from 'next';
import User from '../../models/User';
import Car from '../../models/Car';
import Manufacturer from '../../models/Manufacturer';
import Order from '../../models/Order';
import dbUtils from '../../utils/db';
import NextCors from 'nextjs-cors';
import authUtils from '../../utils/auth';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    | typeof User[]
    | typeof Car[]
    | typeof Manufacturer[]
    | typeof Order[]
    | {}
    | { message: string }
  >
) => {
  const session = await authUtils.getSessionServer(req, res);

  try {
    await NextCors(req, res, {
      // Options
      methods: ['POST'],
      origin: process.env.NEXTAUTH_URL,
      optionsSuccessStatus: 200,
    });
    const dbConnection = await dbUtils.connect();
    let query = req.body as string;
    if (dbConnection) {
      switch (query) {
        case 'User': {
          if (!session?.isAdmin) {
            res.status(401).send({
              authError: 'Authentication Error',
            });
            await dbUtils.disconnect();
          } else {
            const users = await User.find({});
            if (users) {
              res.status(200).send(users);
              await dbUtils.disconnect();
            } else {
              res.status(400).send({ message: 'No users found' });
            }
            await dbUtils.disconnect();
          }
          break;
        }
        case 'Car': {
          const cars = await Car.find({});
          if (cars) {
            res.status(200).send(cars);
            await dbUtils.disconnect();
          } else {
            res.status(400).send({ message: 'No cars found' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'Manufacturer': {
          const manufacturers = await Manufacturer.find({});
          if (manufacturers) {
            res.status(200).send(manufacturers);
            await dbUtils.disconnect();
          } else {
            res.status(400).send({ message: 'No manufacturers found' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'Order': {
          const orders = await Order.find({}).populate('user');
          if (orders) {
            res.status(200).send(orders);
            await dbUtils.disconnect();
          } else {
            res.status(400).send({ message: 'No orders found' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'default':
          res.status(500).send({ message: 'Incorrect query' });
          await dbUtils.disconnect();
          break;
      }
    }
  } catch (e) {
    console.log({ serverError: (e as Error).message });
    res.status(500).send({ message: (e as Error).message });
  }
};
export default handler;
