import { NextApiRequest, NextApiResponse } from 'next';
import Car from '../../models/Car';
import Manufacturer from '../../models/Manufacturer';
import User from '../../models/User';
import Order from '../../models/Order';
import dbUtils from '../../utils/db';
import NextCors from 'nextjs-cors';
import authUtils from '../../utils/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse<{}>) => {
  const session = await authUtils.getSessionServer(req, res);

  try {
    await NextCors(req, res, {
      // Options
      methods: ['DELETE'],
      origin: process.env.NEXTAUTH_URL,
      optionsSuccessStatus: 200,
    });
    if (!session?.isAdmin) {
      res.status(401).send({
        authError: 'Authentication Error',
      });
      await dbUtils.disconnect();
    }
    const dbConnection = await dbUtils.connect();
    if (dbConnection) {
      switch (req.body.type) {
        case 'manufacturer': {
          const manufacturer = await Manufacturer.findById(req.body.id);
          const deleteSuccess = await Manufacturer.deleteOne(manufacturer);
          if (deleteSuccess) {
            res.send({ message: 'Manufacturer deleted successfully' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'car': {
          const car = await Car.findById(req.body.id);
          const deleteSuccess = await Car.deleteOne(car);
          if (deleteSuccess) {
            res.send({ message: 'Car deleted successfully' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'user': {
          const user = await User.findById(req.body.id);
          const deleteSuccess = await User.deleteOne(user);
          if (deleteSuccess) {
            res.send({ message: 'User deleted successfully' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'order': {
          const order = await Order.findById(req.body.id);
          const deleteSuccess = await Order.deleteOne(order);
          if (deleteSuccess) {
            res.send({ message: 'Order deleted successfully' });
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
    console.log({ error: (e as Error).message });
    res.status(500).send({ message: (e as Error).message });
  }
};
export default handler;
