import React, { FC, useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Manufacturer as ManufacturerData } from '../../data/seedData';
import { Car as CarData } from '../../data/seedData';
import { toast } from 'react-toastify';
import { byPropertiesOf } from '../../utils/sort';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Image from 'next/image';
import RedXIcon from '../../public/icons/red-x.svg';
import uploadImages from '../../utils/uploadImages';
import { useSession } from 'next-auth/react';

interface Manufacturers extends ManufacturerData {
  _id: string;
}

type SortingProperties = {
  brand: string;
};

const fetchWithQuery = (url: string, type: string) =>
  fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/text',
    },
    body: type,
  }).then((r) => r.json());

const NewCarProfile: FC = () => {
  let { data, error } = useSWR(
    ['/api/getDbData', 'Manufacturer'],
    fetchWithQuery
  );
  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    formState: { errors },
  } = useForm();

  const { data: session } = useSession();
  const router = useRouter();

  if (error) {
    toast.error(`An unexpected error has occured: ${error}`);
  }

  const [featuredImagePlaceholder, setFeaturedImagePlaceholder] = useState<
    boolean | string
  >(false);
  const [imageGalleryPlaceholder, setImageGalleryPlaceholder] = useState<
    Array<string>
  >([]);
  const [imagePreviews, setImagePreviews] = useState<Array<string>>([]);

  const featuredImageFile = useRef<HTMLInputElement | null>(null);
  const imageGalleryFiles = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((image) => URL.revokeObjectURL(image));
    };
  }, [imagePreviews]);

  useEffect(() => {
    if (!session?.isAdmin) {
      router.push('/login');
    }
  }, [session]);

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    return () => {
      controller.abort();
    };
  }, []);

  const formHandle = async (reqData: CarData): Promise<void> => {
    try {
      const response = await fetch('/api/createDbData', {
        signal: signal,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: reqData, type: 'car' }),
      });
      const notification = await response.json();
      if (notification?.authError) {
        toast.error(notification.authError);
        return;
      }
      if (notification.message.includes('error')) {
        toast.error(notification.message);
        return;
      } else {
        toast.success(notification.message);
      }
    } catch (e) {
      console.log((e as Error).message);
      toast.error(`An unexpected error has occured: ${(e as Error).message}`);
      return;
    }
  };
  const onSubmit: SubmitHandler<CarData> = async (data: CarData, e) => {
    e!.preventDefault();

    const formData = new FormData();
    if (!data.featuredImage && !data.imageGallery) {
      formHandle(data);
    }

    if (data.featuredImage && data.featuredImage!.length > 0) {
      const url = await uploadImages(
        formData,
        data.featuredImage!,
        data.model,
        'featuredImage'
      );
      if (url) {
        data.featuredImage = url[0];
        if (!data.imageGallery) {
          formHandle(data);
        }
      }
    }
    if (data.imageGallery && data.imageGallery!.length > 0) {
      const url = await uploadImages(
        formData,
        data.imageGallery!,
        data.model,
        'imageGallery'
      );
      if (url) {
        data.imageGallery = url;
        formHandle(data);
      }
    }
  };
  return (
    <div className="flex flex-col mx-auto mt-20 w-5/6 md:w-4/6 space-y-10 bg-white border-2 border-grey-400 p-2 rounded">
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div className="lg:flex lg:flex-row lg:space-x-4 lg:justify-between">
          <div className="lg:flex lg:flex-col lg:flex-grow">
            <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
              <label className="w-24" htmlFor="model">
                Model:
              </label>
              <input
                type="text"
                id="model"
                className="text-black  border-b-2 border-grey-400 text-center flex-grow"
                aria-invalid={errors.model ? 'true' : 'false'}
                {...register('model', {
                  required: { value: true, message: 'Model is required' },
                })}
              />
            </div>
            {errors.model && <span role="alert">{errors.model.message}</span>}

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="manufacturer" className="w-24">
                Manufacturer:
              </label>
              <select
                id="manufacturer"
                className="text-black bg-gray-100  border-b-2 border-grey-400 flex-grow text-center"
                {...register('manufacturer')}
              >
                {data
                  ?.sort(byPropertiesOf<SortingProperties>(['brand']))
                  ?.map((item: Manufacturers, index: number) => (
                    <option key={index} value={item._id}>
                      {item.brand}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="hp" className="w-24">
                BHP:
              </label>
              <input
                id="hp"
                type="text"
                className="text-black  border-b-2 border-grey-400 text-center flex-grow"
                {...register('hP')}
              />
            </div>

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="specifications" className="w-24">
                Specifications:
              </label>
              <textarea
                className="text-black  border-b-2 border-grey-400   flex-grow"
                id="specifications"
                {...register('specifications')}
              ></textarea>
            </div>

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="description" className="w-24">
                Description:
              </label>
              <textarea
                className="text-black  border-b-2 border-grey-400  flex-grow"
                id="description"
                {...register('description')}
              ></textarea>
            </div>

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="weight" className="w-24">
                Weight:
              </label>
              <input
                type="text"
                className="text-black  border-b-2 border-grey-400 text-center  flex-grow"
                id="weight"
                {...register('weight')}
              />
            </div>
          </div>

          <div className="lg:flex lg:flex-col lg:flex-grow">
            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="speed" className="w-24">
                Speed:
              </label>
              <input
                type="text"
                className="text-black  border-b-2 border-grey-400 text-center  flex-grow"
                id="speed"
                {...register('speed')}
              />
            </div>

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="acceleration" className="w-24">
                Acceleration:
              </label>
              <input
                type="text"
                className="text-black  border-b-2 border-grey-400 text-center  flex-grow"
                id="acceleration"
                {...register('acceleration', {
                  pattern: {
                    value: /^([0-9]+\.?[0-9]*|\.[0-9]+)$/,
                    message: 'Invalid number. Decimal sign must be a period(.)',
                  },
                })}
              />
            </div>
            {errors.acceleration && (
              <span role="alert">{errors.acceleration.message}</span>
            )}

            <div className="flex flex-row mt-4 mb-4 space-x-4">
              <label htmlFor="hybrid" className="w-24">
                Hybrid:
              </label>
              <input
                type="checkbox"
                className="flex-grow"
                id="hybrid"
                {...register('hybrid')}
              />
            </div>

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="electric" className="w-24">
                Electric:
              </label>
              <input
                type="checkbox"
                className="flex-grow"
                id="electric"
                {...register('electric')}
              />
            </div>

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="price" className="w-24">
                Price:
              </label>
              <input
                type="number"
                min="0"
                step="any"
                className="text-black  border-b-2 border-grey-400 text-center  flex-grow"
                id="price"
                aria-invalid={errors.price ? 'true' : 'false'}
                {...register('price', {
                  required: { value: true, message: 'Price is required' },
                })}
              />{' '}
            </div>
            {errors.price && <span role="alert">{errors.price.message}</span>}

            <div className="flex flex-row mt-4 mb-4 justify-start space-x-4">
              <label htmlFor="quantity" className="w-24">
                Quantity:
              </label>
              <input
                type="text"
                className="text-black  border-b-2 border-grey-400 text-center  flex-grow"
                id="quantity"
                aria-invalid={errors.quantity ? 'true' : 'false'}
                {...register('quantity', {
                  required: { value: true, message: 'Quantity is required' },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'Invalid number',
                  },
                })}
              />
            </div>
            {errors.quantity && (
              <span role="alert">{errors.quantity.message}</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-center mt-2">
            <label htmlFor="featuredImage">Featured Image:</label>
          </div>
          {featuredImagePlaceholder && (
            <div className="relative w-72 h-72 lg:w-96 lg:h-96 mx-auto cursor-pointer">
              <div className="absolute  w-full h-full">
                <Image
                  src={featuredImagePlaceholder as string}
                  onClick={() => featuredImageFile.current!.click()}
                  alt="featured image"
                  layout="fill"
                  objectFit="contain"
                />
                {featuredImagePlaceholder && (
                  <div className="absolute top-3 right-0 w-3 h-3">
                    <Image
                      src={RedXIcon}
                      onClick={() => {
                        clearErrors('featuredImage');
                        featuredImageFile.current!.value = '';
                        setFeaturedImagePlaceholder(false);
                      }}
                      alt="gallery image"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <Controller
            render={({ field }) => (
              <input
                type="file"
                id="featuredImage"
                value={field.value?.filename}
                ref={featuredImageFile}
                className="bg-white mb-4 text-center w-full "
                aria-invalid={errors.featuredImage ? 'true' : 'false'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(e.target.files);
                  if (e.target.files!.length > 0) {
                    var imageURL = URL.createObjectURL(e.target!.files![0]);
                    setFeaturedImagePlaceholder(imageURL);
                    setImagePreviews((imagePreviews) => [
                      ...imagePreviews,
                      imageURL,
                    ]);
                  }
                }}
              />
            )}
            name="featuredImage"
            control={control}
            rules={{
              validate: {
                acceptedFormats: (files) =>
                  files && files[0]?.type
                    ? [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/bmp',
                      ].includes(files[0]?.type) ||
                      'Only PNG, JPEG, WEBP and BMP file types are supported'
                    : true,
                acceptedSize: (files) =>
                  files && files[0]?.size
                    ? files[0]?.size < 2000000
                      ? true
                      : 'Image has to be under 2MB'
                    : true,
              },
            }}
          />
        </div>
        {errors.featuredImage && (
          <span role="alert">{errors.featuredImage.message}</span>
        )}

        <div>
          <div className="flex justify-center mt-2">
            <label htmlFor="imageGallery">Image Gallery:</label>
          </div>
          {imageGalleryPlaceholder && imageGalleryPlaceholder.length > 0 && (
            <div className="flex top-1 relative flex-wrap">
              <div className="absolute -top-6 right-0 w-3 h-3 cursor-pointer">
                <Image
                  src={RedXIcon}
                  onClick={() => {
                    clearErrors('imageGallery');
                    imageGalleryFiles.current!.value = '';
                    setImageGalleryPlaceholder([]);
                  }}
                  alt="gallery image"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              {imageGalleryPlaceholder?.map((item, index) => (
                <div
                  key={index}
                  className="relative mx-auto mb-2 w-36 md:w-64 h-36 md:w-64 bottom-4 cursor-pointer"
                >
                  <div className="absolute top-2 md:top-6 w-full h-full">
                    <Image
                      src={item}
                      onClick={() => imageGalleryFiles.current!.click()}
                      alt="gallery image"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Controller
            render={({ field }) => (
              <input
                type="file"
                id="imageGallery"
                multiple
                className="bg-white mt-4 mb-4 text-center w-full "
                aria-invalid={errors.imageGallery ? 'true' : 'false'}
                value={field.value?.filename}
                ref={imageGalleryFiles}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  field.onChange(e.target.files);
                  setImageGalleryPlaceholder([]);
                  if (e.target.files!.length > 0) {
                    [...(e.target.files as unknown as Array<Blob>)].forEach(
                      (file) => {
                        const imageURL = URL.createObjectURL(file);
                        setImageGalleryPlaceholder(
                          (imageGalleryPlaceholder) => [
                            ...imageGalleryPlaceholder,
                            imageURL,
                          ]
                        );
                        setImagePreviews((imagePreviews) => [
                          ...imagePreviews,
                          imageURL,
                        ]);
                      }
                    );
                  }
                }}
              />
            )}
            name="imageGallery"
            control={control}
            rules={{
              validate: {
                acceptedFormats: (files) => {
                  if (files) {
                    for (const file of files) {
                      if (
                        [
                          'image/jpeg',
                          'image/png',
                          'image/webp',
                          'image/bmp',
                        ].includes(file.type)
                      ) {
                        true;
                      } else {
                        return 'Only PNG, JPEG, WEBP and BMP file types are supported';
                      }
                    }
                  }
                },
                acceptedSize: (files) => {
                  if (files) {
                    for (const file of files) {
                      if (file.size < 2000000) {
                        true;
                      } else {
                        return 'All images have to be under 2MB';
                      }
                    }
                  }
                },
                acceptedNumber: (files) => {
                  if (files && files.length > 6) {
                    return 'Maximum number of images is 6';
                  } else {
                    true;
                  }
                },
              },
            }}
          />
        </div>
        {errors.imageGallery && (
          <span role="alert">{errors.imageGallery.message}</span>
        )}
        <div className="flex justify-center">
          <button type="submit" className="w-full lg:w-3/6">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCarProfile;
