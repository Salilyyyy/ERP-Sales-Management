import React from 'react';
import { Link } from 'react-router-dom';

const Error401 = () => {
  const styles = {
    container: {
      textAlign: 'center',
      padding: '100px',
      color: '#d48806',
      backgroundColor: '#fffbe6',
    },
    link: {
      display: 'inline-block',
      marginTop: '20px',
      color: '#d48806',
      textDecoration: 'underline',
    }
  };

  return (
    <div style={styles.container}>
      <h1>401</h1>
      <p>Bạn cần đăng nhập để truy cập nội dung này.</p>
      <Link to="/login" style={styles.link}>Đăng nhập</Link>
    </div>
  );
};

export default Error401;
