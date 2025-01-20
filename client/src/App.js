import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';

import Navbar from './components/Navbar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import InsuranceList from './components/Insurance/InsuranceList';
import InsuranceDetails from './components/Insurance/InsuranceDetails';
import PurchasedInsurances from './components/PurchasedInsurances';
import ClaimInsurance from './components/ClaimInsurance';
import PrivateRoute from './utils/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<InsuranceList />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/insurances/:id" element={<InsuranceDetails />} />
            <Route
              path="/my-insurances"
              element={
                <PrivateRoute>
                  <PurchasedInsurances />
                </PrivateRoute>
              }
            />
            <Route
              path="/claim/:id"
              element={
                <PrivateRoute>
                  <ClaimInsurance />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
