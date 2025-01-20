// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Navbar() {
  const { auth, logout } = useContext(AuthContext);

  return (
    <nav style={styles.nav}>
      <h2>Insurance App</h2>
      <div>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        {auth.token ? (
          <>
            <Link to="/my-insurances" style={styles.link}>
              My Insurances
            </Link>
            <button onClick={logout} style={styles.button}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#ccc',
  },
  link: {
    marginRight: '15px',
    textDecoration: 'none',
    color: 'black',
  },
  button: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer',
  },
};

export default Navbar;