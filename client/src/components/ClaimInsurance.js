// src/components/ClaimInsurance.js
import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

function ClaimInsurance() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const [insurance, setInsurance] = useState(null);
  const [claimResult, setClaimResult] = useState({
    message : "",
    currentHumidity : 0,
    humidityThreshold : 0,
  });

  useEffect(() => {
    fetch(`/api/insurances/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': auth.token,
      },
    })
      .then((res) => res.json())
      .then((data) => setInsurance(data))
      .catch((err) => console.error(err));
  }, [auth.token, id]);

  const handleClaim = async () => {
    try {
      const res = await fetch(`/api/insurances/${id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token,
        },
      });

      const data = await res.json();
      console.log("data", data)
      setClaimResult(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  if (!insurance) return <div>Loading...</div>;

  return (
    <div>
      <h2>Claim Insurance: {insurance.title}</h2>
      <p>{insurance.description}</p>
      <p>Rainfall Threshold: {insurance.rainfallThreshold}mm</p>
      <button onClick={handleClaim} style={styles.button}>
        Submit Claim
      </button>
      {claimResult && <p style={styles.result}>{claimResult.message}</p>}
      {claimResult && <p style={styles.result}>Current : {claimResult.currentHumidity}</p>}
      {claimResult && <p style={styles.result}>Threshold : {claimResult.humidityThreshold}</p>}
    </div>
  );
}

const styles = {
  button: {
    padding: '10px 15px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '15px',
  },
  result: {
    marginTop: '15px',
    fontWeight: 'bold',
  },
};

export default ClaimInsurance;