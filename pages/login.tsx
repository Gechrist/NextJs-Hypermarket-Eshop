import React from 'react';
import LogInHandler from '../components/loginForm';

const Login = () => {
  return (
    <div className="flex flex-col text-black w-5/6 md:w-4/6 mt-20 mx-auto space-y-10 border-2 border-black bg-white p-2 rounded">
      <LogInHandler />
    </div>
  );
};

export default Login;
