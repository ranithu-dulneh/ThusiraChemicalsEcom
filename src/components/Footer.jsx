import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="text-center">
      <div className="container">
        <p className="mb-0">&copy; {new Date().getFullYear()} Thusira Chemicals. All Rights Reserved.</p>
        <Link to="/login" className="text-muted text-decoration-none" style={{ fontSize: '0.8rem', opacity: 0.5 }}>Admin Login</Link>
      </div>
    </footer>
  );
};

export default Footer;