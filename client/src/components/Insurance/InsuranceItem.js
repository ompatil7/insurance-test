// src/components/Insurance/InsuranceItem.js
import React from 'react';
import { Link } from 'react-router-dom';

function InsuranceItem({ insurance }) {
  return (
    <div style={styles.card}>
      <h3>{insurance.title}</h3>
      <p>{insurance.description}</p>
      <p>Price: ${insurance.price}</p>
      <Link to={`/insurances/${insurance._id}`}>View Details</Link>
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

export default InsuranceItem;