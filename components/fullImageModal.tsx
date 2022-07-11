import { FC } from 'react';
import Image from 'next/image';
import RedXIcon from '../public/icons/red-x.svg';

type Props = {
  src: string;
  car: string;
  closeModal(): void;
};

const fullImageModal: FC<Props> = ({ src, car, closeModal }: Props) => {
  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-hidden fixed inset-0 z-50 outline-none focus:outline-none">
        <div>
          <div className="block mb-2 right-10 z-50 top-3 xl:top-5 absolute h-6 w-8 cursor-pointer">
            <Image
              className="px-2"
              aria-label="Close Modal"
              layout="fill"
              objectFit="contain"
              src={RedXIcon}
              alt="Close Modal Icon"
              onClick={() => closeModal()}
            />
          </div>
        </div>
        <div className="relative w-screen h-screen my-6 mx-auto max-w-3xl">
          <div className="w-11/12 h-11/12">
            <Image
              src={src}
              alt={`${car} modal image`}
              aria-label={`${car} modal image`}
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      </div>
      <div className="opacity-85 fixed inset-0 z-40 bg-black" />
    </>
  );
};

export default fullImageModal;
