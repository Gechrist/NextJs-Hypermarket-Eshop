import React from 'react';

const MainLandingPage = () => {
  return (
    <div
      data-menuanchor="top"
      className="section bg-[url('../public/images/index.jpg')] bg-cover bg-center"
    >
      <div className="absolute bottom-14 left-0 right-0 flex justify-center">
        <div className="h-12 w-42 px-2 rounded-2xl border-2 border-white absolute">
          <div className="h-4 w-1 animate-bounce block mt-2 mx-auto bg-white relative border-2 border-white rounded-lg"></div>
        </div>
        <p className="relative top-14 md:top-12 text-white">scroll down</p>
      </div>
    </div>
  );
};

export default MainLandingPage;
