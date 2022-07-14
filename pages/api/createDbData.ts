import { NextApiRequest, NextApiResponse } from 'next';
import authUtils from '../../utils/auth';
import dbUtils from '../../utils/db';
import NextCors from 'nextjs-cors';
import Manufacturer from '../../models/Manufacturer';
import Car from '../../models/Car';
import User from '../../models/User';
import Order from '../../models/Order';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<{} | { message: string; id: string; email: string }>
) => {
  const session = await authUtils.getSessionServer(req, res);

  await NextCors(req, res, {
    // Options
    methods: ['POST'],
    origin: process.env.NEXTAUTH_URL,
    optionsSuccessStatus: 200,
  });
  try {
    const dbConnection = await dbUtils.connect();
    if (dbConnection) {
      switch (req.body.type) {
        case 'manufacturer': {
          if (!session?.isAdmin) {
            res.status(401).send({
              authError: 'Authentication Error',
            });
            await dbUtils.disconnect();
          } else {
            const manufacturer = await Manufacturer.create([
              { brand: req.body.data.brand, icon: req.body.data.icon },
            ]);
            if (manufacturer) {
              res.send({ message: 'Manufacturer saved successfully' });
              await dbUtils.disconnect();
            }
          }
          break;
        }
        case 'car': {
          if (!session?.isAdmin) {
            res.status(401).send({
              authError: 'Authentication Error',
            });
            await dbUtils.disconnect();
          } else {
            const car = await Car.create([
              {
                model: req.body.data.model,
                manufacturer: req.body.data.manufacturer,
                hP: req.body.data.hP,
                specifications: req.body.data.specifications,
                weight: req.body.data.weight,
                speed: req.body.data.speed,
                acceleration: req.body.data.acceleration,
                hybrid: req.body.data.hybrid,
                electric: req.body.data.electric,
                price: req.body.data.price,
                quantity: req.body.data.quantity,
                featuredImage: req.body.data.featuredImage,
                imageGallery: req.body.data.imageGallery,
                description: req.body.data.description,
              },
            ]);
            if (car) {
              res.send({ message: 'Car saved successfully' });
              await dbUtils.disconnect();
            }
          }
          break;
        }
        case 'user': {
          const user = await User.create([
            {
              name: req.body.data.name,
              email: req.body.data.email,
              password: req.body.data.password,
              address: req.body.data.address,
              city: req.body.data.city,
              postalCode: req.body.data.postalCode,
              country: req.body.data.country,
              isAdmin: req.body.data.isAdmin,
            },
          ]);
          if (user) {
            res.send({ message: 'User saved successfully' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'order': {
          const order = await Order.create([
            {
              user: req.body.data.userID,
              orderEmail: req.body.data.email,
              orderItems: req.body.data.formOrderItems,
              shippingAddress: {
                fullName: req.body.data.fullName,
                address: req.body.data.address,
                city: req.body.data.city,
                postalCode: req.body.data.postalCode,
                country: req.body.data.country,
              },
              paymentMethod: req.body.data.paymentMethod,
              paypalDetails: req.body.data.payPalPaymentInfo,
              creditCardDetails: req.body.data.creditCardPaymentInfo,
              itemsPrice: req.body.data.itemsPrice,
              shippingPrice: req.body.data.shippingPrice,
              taxPrice: req.body.data.taxPrice,
              totalPrice: req.body.data.totalPrice,
              isPaid: req.body.data.isPaid,
              isDelivered: req.body.data.isDelivered,
              paidAt: req.body.data.paidAt,
              deliveredAt: req.body.data.deliveredAt,
            },
          ]);
          if (order) {
            res.send({
              message: 'ok',
              id: order[0].id,
              email: order[0].orderEmail,
            });
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
