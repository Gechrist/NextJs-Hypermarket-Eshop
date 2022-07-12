import bcrypt from 'bcrypt';
type User = {
  name: string;
  email: string;
  password: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isAdmin: boolean;
};
interface Car {
  model: string;
  manufacturer: string;
  hP: number;
  specifications: string;
  weight: number;
  speed: string;
  acceleration: number;
  hybrid: boolean;
  electric: boolean;
  price: number;
  quantity: number;
  description: string;
  featuredImage?: string;
  imageGallery?: string[];
}
type Order = {
  user: string;
  orderEmail: string;
  orderItems: {
    item: { _id: string; model: string } | string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paypalDetails?: {
    orderID: string;
    payer: {
      email_address: string;
      name: {
        given_name: string;
        surname: string;
      };
      payer_id: string;
    };

    paymentID: string;
    status: string;
    create_time: string;
    update_time: string;
  };
  creditCardDetails?: {
    date: string;
    amount: string;
    currency: string;
    paymentID: string;
    status: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: Date;
  deliveredAt?: Date;
};
type Manufacturer = {
  brand: string;
  icon: string;
};

const Orders: Order[] = [
  {
    user: '61d2ed4697c896806b254433',
    orderEmail: 'john@doe.com',
    orderItems: [
      {
        item: '61d2ed4697c896806b254436',
        quantity: 2,
        price: 1200000,
      },
      {
        item: '61d2ed4697c896806b254437',
        quantity: 1,
        price: 1078000,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      address: 'John Does address',
      city: 'John Does city',
      postalCode: 'John Does postal code',
      country: 'UK',
    },
    paymentMethod: 'cash on delivery',
    itemsPrice: 2 * 1200000 + 1078000,
    shippingPrice: 50000,
    taxPrice: ((2 * 1200000 + 1078000) * 24) / 100,
    totalPrice:
      2 * 1200000 + 1078000 + ((2 * 1200000 + 1078000) * 24) / 100 + 50000,
    isPaid: false,
    isDelivered: false,
  },
];
const Users: User[] = [
  {
    name: 'Admin Administrator',
    email: 'admin@admin.com',
    password: bcrypt.hashSync('12345', 8),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@doe.com',
    password: bcrypt.hashSync('abcde', 8),
    address: 'John Doe address, John Doe, 111111, John Doe',
    isAdmin: false,
  },
];

const Cars: Car[] = [
  {
    model: 'Ferrari LaFerrari',
    hP: 950,
    manufacturer: '61cec934ec2717948519d935',
    specifications:
      '6.262cc, V12, 790bhp/9000rpm, 700Nm/6750rpm, 60kg lithium ion battery 160bhp/269Nm',
    weight: 1255,
    speed: '349+',
    acceleration: 2.9,
    hybrid: true,
    electric: false,
    price: 1200000,
    quantity: 10,
    description:
      'The LaFerrari boasts the most extreme performance ever achieved by a Ferrari production car and features the most advanced and innovative technical solutions which will, in the future, filter down to the rest of the Ferrari range.',
    featuredImage:
      'https://res.cloudinary.com/hypermarket-image-storage/image/upload/v1642770342/Ferrari%20LaFerrari_featuredImage_0.jpg',
    imageGallery: [
      'https://res.cloudinary.com/hypermarket-image-storage/image/upload/v1642772119/Ferrari%20LaFerrari_imageGallery_0.jpg',
      'https://res.cloudinary.com/hypermarket-image-storage/image/upload/v1642602779/Ferrari%20LaFerrari_imageGallery_1.jpg',
    ],
  },
  {
    model: 'McLaren P1',
    manufacturer: '61cec934ec2717948519d937',
    hP: 903,
    specifications:
      '3.799cc, V8, 727bhp/7500rpm, 720Nm/4000rpm, McLaren E-Motor 177bhp/260Nm',
    weight: 1450,
    speed: '349',
    acceleration: 2.8,
    hybrid: true,
    electric: false,
    price: 1078000,
    quantity: 10,
    description:
      'The P1 is a superhero among supercars: supermodel shapely, heroically powerful, stratospherically expensive.',
    featuredImage:
      'https://res.cloudinary.com/hypermarket-image-storage/image/upload/v1641724832/McLaren%20P1_featuredImage_0.jpg',
    imageGallery: [''],
  },
  {
    model: 'Lotus Evija',
    manufacturer: '61cec934ec2717948519d93a',
    hP: 1974,
    specifications: '1974bhp, 1700Nm, 4 Integral Powertrain electric motors',
    weight: 1680,
    speed: '320+',
    acceleration: 2.9,
    hybrid: false,
    electric: true,
    price: 1848000,
    quantity: 10,
    description:
      'The thrilling next chapter of one of the greatest automotive stories ever told. The Lotus Evija continues a rich, 70-year tradition of iconic, game-changing road and racing cars.',
    featuredImage:
      'https://res.cloudinary.com/hypermarket-image-storage/image/upload/v1642162919/Lotus%20Evija_featuredImage_0.jpg',
    imageGallery: [''],
  },
  {
    model: 'Aston Martin Vulcan',
    manufacturer: '61cec934ec2717948519d936',
    hP: 820,
    specifications: '6.998cc, V12, 820bhp/7750rpm, 780Nm/6500rpm',
    weight: 1350,
    speed: '360',
    acceleration: 2.9,
    hybrid: false,
    electric: false,
    price: 2039000,
    quantity: 10,
    description:
      'Born out of extensive motorsport experience – and using Aston Martin’s acknowledged flair for design and engineering ingenuity – the 800-plus bhp, all-carbon fibre Aston Martin Vulcan promises truly extreme performance.',
    featuredImage: '',
    imageGallery: [''],
  },
  {
    model: 'Pagani Huayra Roadster',
    manufacturer: '61cec934ec2717948519d938',
    hP: 764,
    specifications: '5.980cc, V12, 764bhp/5500rpm, 1000Nm/2.250-4.500rpm',
    weight: 1280,
    speed: '383',
    acceleration: 2.2,
    hybrid: false,
    electric: false,
    price: 2280000,
    quantity: 10,
    description:
      'Inspired, at the highest level by beauty and scientific research in its every form.',
    featuredImage: '',
    imageGallery: [''],
  },
  {
    model: 'Lamborghini Centenario',
    manufacturer: '61cec934ec2717948519d93b',
    hP: 770,
    specifications: '6.498cc, V12, 770bhp/8500rpm, 690Nm/5500rpm',
    weight: 1520,
    speed: '350+',
    acceleration: 2.8,
    hybrid: true,
    electric: false,
    price: 1750000,
    quantity: 10,
    description:
      'The Lamborghini Centenario exemplifies the innovative design and engineering skills of the House of the Raging Bull. The finest possible tribute to our founder Ferruccio Lamborghini on the centenary of his birth, it is an homage to his vision and the future he believed in—a vision that we at Lamborghini still embrace.',
    featuredImage: '',
    imageGallery: [''],
  },
  {
    model: 'Koenigsegg One:1',
    manufacturer: '61cec934ec2717948519d939',
    hP: 1341,
    specifications: '4,998cc, V8, 1341bhp/7500rpm, 1371Nm/6000rpm',
    weight: 1360,
    speed: '440',
    acceleration: 2.8,
    hybrid: true,
    electric: false,
    price: 2600000,
    quantity: 10,
    description:
      'The Koenigsegg One:1 is the first homologated production car in the world with one Megawatt of power, thereby making it the world´s first series produced Megacar.',
    featuredImage:
      'https://res.cloudinary.com/hypermarket-image-storage/image/upload/v1641991150/Koenigsegg%20One:1_featuredImage_0.jpg',
    imageGallery: [''],
  },
];

const Manufacturers: Manufacturer[] = [
  {
    brand: 'Aston Martin',
    icon: '',
  },
  {
    brand: 'Ferrari',
    icon: '',
  },
  { brand: 'Koenigsegg', icon: '' },
  {
    brand: 'Lamborghini',
    icon: '',
  },
  { brand: 'Lotus', icon: '' },
  {
    brand: 'McLaren',
    icon: '',
  },
  {
    brand: 'Pagani',
    icon: '',
  },
];

export type { Car, User, Manufacturer, Order };

export { Users, Cars, Manufacturers, Orders };
