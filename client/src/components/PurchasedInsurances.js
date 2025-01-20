// src/components/PurchasedInsurances.js
import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

function PurchasedInsurances() {
  const { auth } = useContext(AuthContext);
  const [purchasedInsurances, setPurchasedInsurances] = useState([]);

  useEffect(() => {
    fetch('/api/users/me', {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': auth.token,
      },
    })
      .then((res) => res.json())
      .then((data) => setPurchasedInsurances(data.purchasedInsurances))
      .catch((err) => console.error(err));
  }, [auth.token]);

  return (
    <div>
      <h2>My Purchased Insurances</h2>
      {purchasedInsurances.length > 0 ? (
        purchasedInsurances?.map((insurance) => (
          <div key={insurance._id} style={styles.card}>
            <h3>{insurance.title}</h3>
            <p>{insurance.description}</p>
            <Link to={`/claim/${insurance._id}`}>Claim Insurance</Link>
          </div>
        ))
      ) : (
        <p>You have not purchased any insurances yet.</p>
      )}
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #ddd',
    padding: '15px',
    marginBottom: '15px',
  },
};

export default PurchasedInsurances;