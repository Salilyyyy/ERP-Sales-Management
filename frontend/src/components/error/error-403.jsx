import React from 'react';
import { Link } from 'react-router-dom';

const Error403 = () => {
  const styles = {
    container: {
      textAlign: 'center',
      padding: '100px',
      color: '#fa8c16',
      backgroundColor: '#fff7e6',
    },
    link: {
      display: 'inline-block',
      marginTop: '20px',
      color: '#fa8c16',
      textDecoration: 'underline',
    }
  };

  return (
    <div style={styles.container}>
      <h1>403</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
      <Link to="/" style={styles.link}>Quay về trang chủ</Link>
    </div>
  );
};

export default Error403;
