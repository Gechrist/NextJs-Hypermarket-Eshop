import { NextApiRequest, NextApiResponse } from 'next';
import authUtils from '../../utils/auth';
import Car from '../../models/Car';
import User from '../../models/User';
import Order from '../../models/Order';
import Manufacturer from '../../models/Manufacturer';
import dbUtils from '../../utils/db';
import NextCors from 'nextjs-cors';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<
    typeof Car | typeof User | typeof Manufacturer | typeof Order | {}
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
    if (dbConnection) {
      switch (req.body.type) {
        case 'Car': {
          const car = await Car.findById(req.body.id);
          const manufacturers = await Manufacturer.find({});
          if (car) {
            res.send({
              car,
              manufacturers,
            });
            await dbUtils.disconnect();
          } else {
            res.status(400).send({ message: 'Car not found' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'Manufacturer': {
          if (!session?.isAdmin) {
            res.status(401).send({
              authError: 'Authentication Error',
            });
            await dbUtils.disconnect();
          } else {
            const manufacturer = await Manufacturer.findById(req.body.id);
            if (manufacturer) {
              res.send(manufacturer);
              await dbUtils.disconnect();
            } else {
              res.status(400).send({ message: 'Manufacturer not found' });
              await dbUtils.disconnect();
            }
          }
          break;
        }
        case 'User': {
          if (
            session?.isAdmin ||
            (!session?.isAdmin && session?.userID === req.body.id)
          ) {
            const user = await User.findById(req.body.id).populate('orders');
            if (user) {
              res.send(user);
              await dbUtils.disconnect();
            } else {
              res.status(400).send({ message: 'User not found' });
              await dbUtils.disconnect();
            }
          } else {
            res.status(401).send({
              authError: 'Authentication Error',
            });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'Order': {
          const order = await Order.findById(req.body.id).populate({
            path: 'orderItems.item',
            select: 'model',
          });
          if (order) {
            res.send(order);
            await dbUtils.disconnect();
          } else {
            res.status(400).send({ message: 'Order not found' });
            await dbUtils.disconnect();
          }
          break;
        }
        default:
          res.status(500).send({ message: 'Incorrect query' });
          await dbUtils.disconnect();
          break;
      }
    }
  } catch (e) {
    console.log({ serverError: (e as Error).message });
    res.send({
      message: 'An unexpected error occurred. Please contact the administrator',
    });
  }
};
export default handler;
