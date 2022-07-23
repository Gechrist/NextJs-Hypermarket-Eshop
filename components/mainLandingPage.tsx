import React from 'react';
import Image from 'next/image';
import MainImage from '../public/images/index.jpg';

const mainLandingPage = () => {
  return (
    <div data-menuanchor="top" className="section">
      <div className="top-0 z-0 block">
        <Image
          src={MainImage}
          alt="main background image"
          aria-label="main background image"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="absolute bottom-14 left-0 right-0 flex justify-center">
        <div className="h-12 w-42 px-2 rounded-2xl border-2 border-white absolute">
          <div className="h-4 w-1 animate-bounce block mt-2 mx-auto bg-white relative border-2 border-white rounded-lg"></div>
        </div>
        <p className="relative top-14 md:top-12 text-white">scroll down</p>
      </div>
    </div>
  );
};

export default mainLandingPage;
