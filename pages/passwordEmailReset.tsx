import React, { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';

const PasswordEmailReset: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const resetEmail = async ({ email }: { email: string }) => {
    try {
      const response = await fetch('/api/emailPassword', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: email }),
      });
      const emailResult = await response.json();
      if (emailResult.error) {
        toast.error(emailResult.error);
        return;
      }
      if (emailResult) {
        toast.success(emailResult.message);
      }
    } catch (e) {
      console.log({ error: (e as Error).message });
      toast.error('Something went wrong. Please try again');
    }
  };

  const onSubmit: SubmitHandler<string | any> = (data) => resetEmail(data);

  return (
    <div className="flex flex-col text-black w-5/6 md:w-4/6 mt-20 mx-auto space-y-10 border-2 border-black bg-white p-2 rounded">
      <h3 className="text-center">Reset your password</h3>
      <form onSubmit={handleSubmit(onSubmit)} method="POST">
        <input
          type="text"
          className="bg-white mt-4 mb-4 text-center w-full border-b-2 border-gray-400"
          aria-invalid={errors.email ? 'true' : 'false'}
          placeholder="Your email"
          {...register('email', {
            required: { value: true, message: 'Email is required' },
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Please enter a valid email address',
            },
          })}
        />
        {errors.email && (
          <span role="alert" className="text-red-600">
            {errors.email.message}
          </span>
        )}
        <div className="flex justify-center">
          <button type="submit" className="w-full lg:w-3/6">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordEmailReset;
