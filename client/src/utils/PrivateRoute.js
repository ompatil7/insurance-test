import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { auth } = useContext(AuthContext);

  return auth.token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
