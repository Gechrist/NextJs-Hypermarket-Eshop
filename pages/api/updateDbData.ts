import { NextApiRequest, NextApiResponse } from 'next';
import Car from '../../models/Car';
import User from '../../models/User';
import Manufacturer from '../../models/Manufacturer';
import Order from '../../models/Order';
import bcrypt from 'bcrypt';
import dbUtils from '../../utils/db';
import NextCors from 'nextjs-cors';
import authUtils from '../../utils/auth';

const handler = async (req: NextApiRequest, res: NextApiResponse<{}>) => {
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
          if (car) {
            car.model = req.body.data.model || car.model;
            car.manufacturer = req.body.data.manufacturer || car.manufacturer;
            car.hP = req.body.data.hP || car.hp;
            car.specifications =
              req.body.data.specifications || car.specifications;
            car.weight = req.body.data.weight || car.weight;
            car.speed = req.body.data.speed || car.speed;
            car.acceleration = req.body.data.acceleration || car.acceleration;
            car.hybrid = req.body.data.hybrid || car.hybrid;
            car.electric = req.body.data.electric || car.electric;
            car.quantity = req.body.data.quantity || car.quantity;
            car.price = req.body.data.price || car.price;
            car.description = req.body.data.description || car.description;
            if (
              req.body.data.featuredImage &&
              req.body.data.featuredImage.length > 0
            ) {
              car.featuredImage = req.body.data.featuredImage;
            }
            if (
              req.body.data.imageGallery &&
              req.body.data.imageGallery.length > 0
            ) {
              car.imageGallery = req.body.data.imageGallery;
            }
            await car.save();
            res.send({ message: 'Car updated successfully' });
            await dbUtils.disconnect();
          } else {
            res.status(404).send({ message: 'Car not found' });
            await dbUtils.disconnect();
          }
          break;
        }
        case 'User': {
          if (
            session?.isAdmin ||
            (!session?.isAdmin && session?.userID === req.body.id) ||
            req.body.data.token
          ) {
            const user =
              (await User.findById(req.body.id)) ||
              (await User.findOne({ email: req.body.data.email }));
            if (user) {
              if (req.body.data.name) {
                user.name = req.body.data.name;
              }
              if (req.body.data.name) {
                user.email = req.body.data.email;
              }
              if (req.body.data.password) {
                user.password = bcrypt.hashSync(req.body.data.password, 8);
              }
              if (req.body.data.address) {
                user.address = req.body.data.address;
              }
              if (req.body.data.city) {
                user.address = req.body.data.city;
              }
              if (req.body.data.postalCode) {
                user.address = req.body.data.postalCode;
              }
              if (req.body.data.country) {
                user.address = req.body.data.country;
              }
              await user.save();
              res.send({ message: 'User updated successfully' });
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
        case 'Manufacturer': {
          if (!session?.isAdmin) {
            res.status(401).send({
              authError: 'Authentication Error',
            });
            await dbUtils.disconnect();
          } else {
            const manufacturer = await Manufacturer.findById(req.body.id);
            if (manufacturer) {
              manufacturer.brand = req.body.data.brand;
              if (req.body.data.icon && req.body.data.icon.length > 0) {
                manufacturer.icon = req.body.data.icon;
              }
              await manufacturer.save();
              res.send({ message: 'Manufacturer updated successfully' });
              await dbUtils.disconnect();
            } else {
              res.status(400).send({ message: 'Manufacturer not found' });
              await dbUtils.disconnect();
            }
          }
          break;
        }
        case 'Order': {
          if (!session?.isAdmin) {
            res.status(401).send({
              authError: 'Authentication Error',
            });
            await dbUtils.disconnect();
          } else {
            const order = await Order.findById(req.body.id);
            if (order) {
              order.orderEmail = req.body.data.email;
              order.shippingAddress.fullName = req.body.data.fullName;
              order.shippingAddress.address = req.body.data.address;
              order.shippingAddress.city = req.body.data.city;
              order.shippingAddress.postalCode = req.body.data.postalCode;
              order.shippingAddress.country = req.body.data.country;
              order.paymentMethod = req.body.data.paymentMethod;
              order.isPaid = req.body.data.isPaid;
              order.paidAt = req.body.data.paidAt;
              order.isDelivered = req.body.data.isDelivered;
              order.deliveredAt = req.body.data.deliveredAt;
              await order.save();
              res.send({ message: 'Order updated successfully' });
              await dbUtils.disconnect();
            } else {
              res.status(400).send({ message: 'Order not found' });
              await dbUtils.disconnect();
            }
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
    res.status(500).send({ message: 'An unexpected error has occurred' });
  }
};
export default handler;
