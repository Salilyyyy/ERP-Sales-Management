import React from 'react';
import { Link } from 'react-router-dom';

const Error500 = () => {
  const styles = {
    container: {
      textAlign: 'center',
      padding: '100px',
      color: '#cf1322',
      backgroundColor: '#fff1f0',
    },
    link: {
      display: 'inline-block',
      marginTop: '20px',
      color: '#cf1322',
      textDecoration: 'underline',
    }
  };

  return (
    <div style={styles.container}>
      <h1>500</h1>
      <p>Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.</p>
      <Link to="/" style={styles.link}>Quay về trang chủ</Link>
    </div>
  );
};

export default Error500;
