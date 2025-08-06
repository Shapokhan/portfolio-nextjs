import React from 'react';

export default function Login() {
  return (
    <form className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Sign In
      </button>
    </form>
  );
}
