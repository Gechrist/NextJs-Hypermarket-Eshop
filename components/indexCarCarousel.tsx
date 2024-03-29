import React, { useState, useEffect, useCallback } from 'react';
import { PrevButton, NextButton } from '../utils/emblaCarouselButtons';
import IndexCarSection from './indexCarSection';
import useEmblaCarousel from 'embla-carousel-react';

const EmblaCarousel = ({ sections }: any) => {
  const [viewportRef, embla] = useEmblaCarousel({ skipSnaps: false });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState<boolean>(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState<boolean>(false);

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

  return (
    <>
      <div className="embla overflow-hidden">
        <div className="embla__viewport" ref={viewportRef}>
          <div className="embla__container flex">
            {sections.map((item: any, index: number) => (
              <div
                className="embla__slide min-w-full relative grow-0 shrink-0 basis-full"
                key={index}
              >
                <IndexCarSection car={item} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-row justify-between relative bottom-12 px-2">
          <div className={` ${!prevBtnEnabled && 'opacity-30'}`}>
            <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
          </div>
          <div className={` ${!nextBtnEnabled && 'opacity-30'}`}>
            <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmblaCarousel;
