import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  errorPage: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa',
  },
  errorContainer: {
    textAlign: 'center',
  },
  errorCode: {
    fontSize: '8rem',
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginBottom: '1rem',
  },
  errorMessage: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1.5rem',
  },
  backHome: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#163020',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 500,
  },
};

const Error404 = () => {
  return (
    <div style={styles.errorPage}>
      <div style={styles.errorContainer}>
        <h1 style={styles.errorCode}>404</h1>
        <p style={styles.errorMessage}>Oops! Trang bạn đang tìm không tồn tại.</p>
        <Link to="/" style={styles.backHome}>
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default Error404;
