import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row>
          <Col md={3} className="footer-column">
            <h6 className="footer-title">Mobile app</h6>
            <div className="footer-nav">
              <Link to="/features" className="footer-link">Features</Link>
              <Link to="/live-share" className="footer-link">Live share</Link>
              <Link to="/video-record" className="footer-link">Video record</Link>
            </div>
          </Col>
          
          <Col md={3} className="footer-column">
            <h6 className="footer-title">Community</h6>
            <div className="footer-nav">
              <Link to="/featured-artists" className="footer-link">Featured artists</Link>
              <Link to="/the-portal" className="footer-link">The Portal</Link>
              <Link to="/live-events" className="footer-link">Live events</Link>
            </div>
          </Col>
          
          <Col md={3} className="footer-column">
            <h6 className="footer-title">Company</h6>
            <div className="footer-nav">
              <Link to="/about-us" className="footer-link">About us</Link>
              <Link to="/contact-us" className="footer-link">Contact us</Link>
              <Link to="/history" className="footer-link">History</Link>
            </div>
          </Col>
          
          <Col md={3} className="button-column">
            <div className="button-group">
              <Button className="btn-register">Register</Button>
              <Button className="btn-login">Log in</Button>
              <Button className="btn-admin">ADMIN</Button>
            </div>
          </Col>
        </Row>
        
        <hr className="footer-divider" />
        
        <Row>
          <Col md={6}>
            <div className="copyright">© Photos, Inc. 2023. We love our users!</div>
          </Col>
          
          <Col md={6}>
            <div className="social-container">
              <span className="follow-text">Follow us</span>
              <div className="social-links">
                <a href="https://facebook.com" className="social-button facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com" className="social-button twitter" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="https://instagram.com" className="social-button instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 