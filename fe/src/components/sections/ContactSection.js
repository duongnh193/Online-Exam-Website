import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import styled from 'styled-components';
import contactIllustration from '../../assets/images/contact-illustration.svg';

// Styled components
const ContactSectionWrapper = styled.section`
  background-color: #f8f9fa;
  padding: 80px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background-color: rgba(232, 234, 246, 0.5);
    z-index: 0;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: rgba(227, 242, 253, 0.6);
    z-index: 0;
  }

  @media (max-width: 991.98px) {
    padding: 60px 0;
  }

  @media (max-width: 767.98px) {
    padding: 40px 0;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
`;

const IllustrationWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  z-index: 1;
  height: 100%;
  padding-right: 20px;

  img {
    max-width: 100%;
    height: auto;
  }

  @media (max-width: 1200px) {
    justify-content: center;
    padding-right: 0;
    
    img {
      max-width: 80%;
    }
  }

  @media (max-width: 767.98px) {
    margin-bottom: 30px;
    
    img {
      max-width: 90%;
    }
  }
`;

const FormContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
  max-width: 400px;
  margin: 0 auto;

  h2 {
    font-weight: 700;
    color: #333;
    margin-bottom: 1rem;
  }

  @media (max-width: 767.98px) {
    padding: 20px;
  }
`;

const StyledFormControl = styled(Form.Control)`
  padding: 12px 16px;
  border-radius: 5px;
  border: 1px solid #dee2e6;
  transition: border-color 0.3s ease;
  margin-bottom: 15px;
  width: 100%; /* Ensure all inputs have the same width */

  &:focus {
    border-color: #5729ff;
    box-shadow: 0 0 0 0.25rem rgba(87, 41, 255, 0.25);
  }

  ${props => props.as === 'textarea' && `
    min-height: 120px;
    resize: vertical;
  `}
`;

const SubmitButton = styled(Button)`
  background-color: #8533ff;
  border-color: #8533ff;
  transition: all 0.3s ease;
  width: 100%;
  padding: 12px;
  border-radius: 5px;

  &:hover,
  &:focus {
    background-color: #7029e6;
    border-color: #7029e6;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(112, 41, 230, 0.3);
  }
`;

const DecorationColumn = styled(Col)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  
  @media (max-width: 991.98px) {
    justify-content: center;
  }
`;

const PhoneIconWrapper = styled.div`
  position: relative;
  width: 250px;
  height: 250px;
  margin-left: 40px;
  
  @media (max-width: 1200px) {
    margin-left: 0;
  }
`;

const PhoneIcon = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const CircleDecoration = styled.div`
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background-color: rgba(232, 234, 246, 0.5);
  z-index: 0;
  top: 0;
  left: 0;
`;

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      
      // Show success and reset form
      setShowSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to send message. Please try again later.');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact-section" style={{ padding: '2rem 0', backgroundColor: '#f5f5f5' }}>
      <ContactSectionWrapper>
        <ContentWrapper>
          <Row className="g-5">
            {/* Left column with illustration */}
            <Col lg={4} md={12} className="d-flex align-items-center">
              <IllustrationWrapper>
                <img 
                  src={contactIllustration} 
                  alt="Contact us illustration" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://cdni.iconscout.com/illustration/premium/thumb/contact-us-3483604-2912018.png";
                  }}
                />
              </IllustrationWrapper>
            </Col>
            
            {/* Middle column with contact form */}
            <Col lg={4} md={12} className="d-flex justify-content-center">
              <FormContainer>
                <h2 className="text-center mb-2">Contact Us</h2>
                <p className="text-center text-muted mb-4">
                  Some contact information on how to reach out
                </p>

                {showSuccess && (
                  <Alert variant="success">
                    Message sent successfully! We'll get back to you soon.
                  </Alert>
                )}

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <StyledFormControl
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <StyledFormControl
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <StyledFormControl
                    as="textarea"
                    rows={4}
                    placeholder="Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />

                  <SubmitButton 
                    variant="primary" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </SubmitButton>
                </Form>
              </FormContainer>
            </Col>
            
            {/* Right column with phone decoration */}
            <DecorationColumn lg={4} md={12}>
              <PhoneIconWrapper>
                <CircleDecoration />
                <PhoneIcon>
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M35 20C30 20 30 25 30 30V70C30 75 30 80 35 80H65C70 80 70 75 70 70V30C70 25 70 20 65 20H35Z" stroke="#2563EB" strokeWidth="4" fill="white" />
                    <circle cx="50" cy="72" r="4" fill="#2563EB" />
                    <path d="M30 30H70" stroke="#2563EB" strokeWidth="2" />
                    <path d="M30 65H70" stroke="#2563EB" strokeWidth="2" />
                  </svg>
                </PhoneIcon>
              </PhoneIconWrapper>
            </DecorationColumn>
          </Row>
        </ContentWrapper>
      </ContactSectionWrapper>
    </div>
  );
};

export default ContactSection; 