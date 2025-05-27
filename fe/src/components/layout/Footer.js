import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterWrapper>
      <Container>
        <Row>
          <FooterColumn md={3}>
            <FooterTitle>Mobile app</FooterTitle>
            <FooterNav>
              <FooterLink to="/features">Features</FooterLink>
              <FooterLink to="/live-share">Live share</FooterLink>
              <FooterLink to="/video-record">Video record</FooterLink>
            </FooterNav>
          </FooterColumn>
          
          <FooterColumn md={3}>
            <FooterTitle>Community</FooterTitle>
            <FooterNav>
              <FooterLink to="/featured-artists">Featured artists</FooterLink>
              <FooterLink to="/the-portal">The Portal</FooterLink>
              <FooterLink to="/live-events">Live events</FooterLink>
            </FooterNav>
          </FooterColumn>
          
          <FooterColumn md={3}>
            <FooterTitle>Company</FooterTitle>
            <FooterNav>
              <FooterLink to="/about-us">About us</FooterLink>
              <FooterLink to="/contact-us">Contact us</FooterLink>
              <FooterLink to="/history">History</FooterLink>
            </FooterNav>
          </FooterColumn>
          
          <ButtonColumn md={3}>
            <ButtonGroup>
              <RegisterButton>Register</RegisterButton>
              <LoginButton>Log in</LoginButton>
              <AdminButton>ADMIN</AdminButton>
            </ButtonGroup>
          </ButtonColumn>
        </Row>
        
        <FooterDivider />
        
        <Row>
          <Col md={6}>
            <Copyright>© Photos, Inc. 2023. We love our users!</Copyright>
          </Col>
          
          <Col md={6}>
            <SocialContainer>
              <FollowText>Follow us</FollowText>
              <SocialLinks>
                <FacebookButton href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebookF />
                </FacebookButton>
                <TwitterButton href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FaTwitter />
                </TwitterButton>
                <InstagramButton href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram />
                </InstagramButton>
              </SocialLinks>
            </SocialContainer>
          </Col>
        </Row>
      </Container>
    </FooterWrapper>
  );
};

// Styled components
const FooterWrapper = styled.footer`
  padding: 30px 0;
  background-color: white;
  border-top: 1px solid #f0f0f0;
`;

const FooterColumn = styled(Col)`
  padding-right: 80px;
  
  @media (max-width: 991px) {
    padding-right: 15px;
  }
`;

const FooterTitle = styled.h6`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #222;
`;

const FooterNav = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #6610f2;
    text-decoration: none;
  }
`;

const FooterDivider = styled.hr`
  border-top: 1px solid #eee;
  margin: 20px 0;
`;

const Copyright = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const SocialContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  
  @media (max-width: 767px) {
    justify-content: flex-start;
    margin-top: 20px;
  }
`;

const FollowText = styled.span`
  font-size: 0.85rem;
  color: #666;
  margin-right: 15px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 8px;
`;

const SocialButton = styled.a`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    color: white;
    text-decoration: none;
  }
`;

const FacebookButton = styled(SocialButton)`
  background-color: #f56040;
`;

const TwitterButton = styled(SocialButton)`
  background-color: #1da1f2;
`;

const InstagramButton = styled(SocialButton)`
  background-color: #c32aa3;
`;

const ButtonColumn = styled(Col)`
  display: flex;
  justify-content: center;
  
  @media (max-width: 991px) {
    margin-top: 20px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  
  @media (max-width: 767px) {
    margin-top: 20px;
  }
`;

const RegisterButton = styled(Button)`
  background-color: #6610f2;
  border-color: #6610f2;
  border-radius: 8px;
  padding: 8px 0;
  font-size: 1rem;
  font-weight: 500;
  width: 150px;
  display: block;
  
  &:hover {
    background-color: #590bd7;
    border-color: #590bd7;
  }
`;

const LoginButton = styled(Button)`
  background-color: white;
  border: 1px solid #6610f2;
  border-radius: 8px;
  color: #6610f2;
  padding: 8px 0;
  font-size: 1rem;
  font-weight: 500;
  width: 150px;
  display: block;
  
  &:hover {
    background-color: #f8f9fa;
    border-color: #5c0dda;
    color: #5c0dda;
  }
`;

const AdminButton = styled(LoginButton)``;

export default Footer; 