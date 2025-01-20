// src/context/AuthProvider.js
import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';

function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Fetch user data if token exists
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally, fetch user data from the server
      setAuth((prevAuth) => ({ ...prevAuth, token, loading: false }));
    } else {
      setAuth((prevAuth) => ({ ...prevAuth, loading: false }));
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    setAuth({ token, user, loading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {!auth.loading && children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };