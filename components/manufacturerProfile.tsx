import React, { FC, useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Manufacturer as ManufacturerData } from '../data/seedData';
import Image from 'next/image';
import RedXIcon from '../public/icons/red-x.svg';
import uploadImages from '../utils/uploadImages';
import SpinnerButton from '../public/icons/spinnerButton.svg';

type Props = {
  formManufacturerData: ManufacturerData;
  formHandle({ brand, icon }: ManufacturerData): Promise<void>;
  spinnerFunction: React.Dispatch<React.SetStateAction<boolean>>;
  spinnerState: boolean;
};

const ManufacturerProfile: FC<Props> = ({
  formManufacturerData,
  formHandle,
  spinnerFunction,
  spinnerState,
}: Props) => {
  const {
    register,
    handleSubmit,
    control,
    clearErrors,
    formState: { errors },
  } = useForm();

  const [iconImagePlaceholder, setIconImagePlaceholder] = useState<
    boolean | string
  >(false);
  const [imagePreviews, setImagePreviews] = useState<Array<string>>([]);

  const iconImageFile = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((image) => URL.revokeObjectURL(image));
    };
  }, [imagePreviews]);

  const defaultValues = {
    brand: formManufacturerData?.brand,
    icon: formManufacturerData?.icon,
  };

  const onSubmit: SubmitHandler<ManufacturerData> = async (
    data: ManufacturerData,
    e
  ) => {
    e!.preventDefault();
    spinnerFunction(true);

    const formData = new FormData();
    if (!data.icon) {
      formHandle(data);
    }

    if (data.icon && data.icon!.length > 0) {
      const url = await uploadImages(formData, data.icon!, data.brand, 'icon');
      if (url) {
        data.icon = url[0];
        formHandle(data);
      }
    }
  };
  return (
    <div className="flex flex-col mt-10 w-auto md:w-full space-y-10 text-black bg-white border-2 border-grey-400 p-2 rounded">
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <div className="flex flex-row justify-start md:justify-center space-x-4 mt-4 mb-4">
          <label className="w-24" htmlFor="brand">
            Manufacturer:
          </label>
          <input
            type="text"
            id="brand"
            className="bg-white text-black border-b-2 text-center border-gray-400 grow"
            placeholder="Manufacturer brand"
            aria-invalid={errors.brand ? 'true' : 'false'}
            defaultValue={defaultValues.brand}
            {...register('brand', {
              required: {
                value: true,
                message: 'Manufacturer is required',
              },
            })}
          />
        </div>
        {errors.brand && <span role="alert">{errors.brand.message}</span>}

        <div className="mb-8 mt-2">
          <label htmlFor="icon">Manufacturer logo:</label>
        </div>
        {(defaultValues.icon || iconImagePlaceholder) && (
          <div className="relative w-72 h-72 lg:w-96 lg:h-96 mx-auto cursor-pointer">
            <div className="absolute bottom-10 w-full h-full">
              <Image
                src={
                  iconImagePlaceholder
                    ? (iconImagePlaceholder as string)
                    : (defaultValues.icon as string)
                }
                onClick={() => iconImageFile.current!.click()}
                alt="brand icon"
                layout="fill"
                objectFit="contain"
              />
              {iconImagePlaceholder && (
                <div className="absolute top-3 right-0 w-3 h-3">
                  <Image
                    src={RedXIcon}
                    onClick={() => {
                      clearErrors('icon');
                      iconImageFile.current!.value = '';
                      setIconImagePlaceholder(false);
                    }}
                    alt="delete image icon"
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
              id="icon"
              value={field.value?.filename}
              ref={iconImageFile}
              className="bg-white mb-4 text-center w-full border-b-2 border-gray-400"
              aria-invalid={errors.icon ? 'true' : 'false'}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(e.target.files);
                if (e.target.files!.length > 0) {
                  var imageURL = URL.createObjectURL(e.target!.files![0]);
                  setIconImagePlaceholder(imageURL);
                  setImagePreviews((imagePreviews) => [
                    ...imagePreviews,
                    imageURL,
                  ]);
                }
              }}
            />
          )}
          name="icon"
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
        {errors.icon && <span role="alert">{errors.icon.message}</span>}

        <div className="flex justify-center">
          {!spinnerState ? (
            <button type="submit" className="w-full md:w-3/6">
              Save
            </button>
          ) : (
            <button type="submit" className="w-full md:w-3/6">
              <div className="flex flex-row justify-center space-x-2 items-center">
                <Image
                  className="animate-spin"
                  src={SpinnerButton}
                  alt="Loading spinner for placing order"
                  width="20px"
                  height="20px"
                />
                <p>Save</p>
              </div>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ManufacturerProfile;
