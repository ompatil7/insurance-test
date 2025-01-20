// src/components/Insurance/InsuranceList.js
import React, { useEffect, useState } from 'react';
import InsuranceItem from './InsuranceItem';

function InsuranceList() {
  const [insurances, setInsurances] = useState([]);

  useEffect(() => {
    fetch('/api/insurances')
      .then((res) => res.json())
      .then((data) => setInsurances(data));
  }, []);

  return (
    <div>
      <h2>Available Insurances</h2>
      {insurances.length > 0 ? (
        insurances.map((insurance) => (
          <InsuranceItem key={insurance._id} insurance={insurance} />
        ))
      ) : (
        <p>No insurances available.</p>
      )}
    </div>
  );
}

export default InsuranceList;