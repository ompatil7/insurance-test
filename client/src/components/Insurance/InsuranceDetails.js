import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

function InsuranceDetails() {
  const { id } = useParams(); // Use useParams to get the dynamic parameter
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [insurance, setInsurance] = useState(null);

  useEffect(() => {
    fetch(`/api/insurances/${id}`)
      .then((res) => res.json())
      .then((data) => setInsurance(data))
      .catch((err) => console.error('Error fetching insurance:', err));
  }, [id]);

  const handlePurchase = async () => {
    if (!auth.token) {
      alert('You need to login to purchase an insurance.');
      navigate('/login'); // Use navigate instead of navigate.path
      return;
    }

    try {
      const res = await fetch(`/api/insurances/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': auth.token,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert('Insurance purchased successfully!');
        navigate('/my-insurances'); // Use navigate instead of navigate.path
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error purchasing insurance:', err.message);
    }
  };

  if (!insurance) return <div>Loading...</div>;

  return (
    <div>
      <h2>{insurance.title}</h2>
      <p>{insurance.description}</p>
      <p>Price: ${insurance.price}</p>
      <p>Rainfall Threshold: {insurance.rainfallThreshold}mm</p>
      <p>Terms and Conditions: {insurance.termsAndConditions}</p>
      <button onClick={handlePurchase} style={styles.button}>
        Purchase Insurance
      </button>
    </div>
  );
}

const styles = {
  button: {
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default InsuranceDetails;
