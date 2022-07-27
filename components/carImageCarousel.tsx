import React, { useState, useEffect, useCallback } from 'react';
import { PrevButton, NextButton } from '../utils/emblaCarouselButtons';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import ImageModal from './fullImageModal';

const EmblaCarousel = ({ sections, car }: any) => {
  const [viewportRef, embla] = useEmblaCarousel({ skipSnaps: false });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState<boolean>(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState<boolean>(false);
  const [modalSRC, setModalSRC] = useState<string>('');
  const [modalCar, setModalCar] = useState<string>('');
  const [modalIsOpen, setIsOpen] = useState<boolean>();

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla]);

  const onSelect = useCallback(() => {
    if (!embla) return;
    setPrevBtnEnabled(embla.canScrollPrev());
    setNextBtnEnabled(embla.canScrollNext());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    onSelect();
    embla.on('select', onSelect);
  }, [embla, onSelect]);

  //modal functions
  const openModal = (src: string, car: string) => {
    setModalSRC(src);
    setModalCar(car);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {modalIsOpen && (
        <ImageModal src={modalSRC} car={modalCar} closeModal={closeModal} />
      )}
      <div className="embla overflow-hidden flex flex-col space-y-2">
        <div className="embla__viewport" ref={viewportRef}>
          <div className="embla__container flex">
            {sections.map((item: any, index: number) => (
              <div
                className="embla__slide min-w-full relative grow-0 shrink-0 basis-full"
                key={index}
              >
                <div
                  className="h-72 bg-black cursor-pointer"
                  onClick={() => openModal(item, car)}
                >
                  <Image
                    src={item}
                    alt={`${car} image`}
                    aria-label={`${car} image`}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        {sections.length > 1 && (
          <div className="flex flex-row justify-center space-x-2 z-30 px-2">
            <div className={` ${!prevBtnEnabled && 'opacity-30'}`}>
              <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
            </div>
            <div className={` ${!nextBtnEnabled && 'opacity-30'}`}>
              <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmblaCarousel;
