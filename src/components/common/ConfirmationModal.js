import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 420px;
  width: 90%;
  padding: 2.5rem;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
`;

const IconContainer = styled.div`
  width: 100px;
  height: 100px;
  background-color: #3e5641;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const QuestionIcon = styled.div`
  font-size: 48px;
  color: white;
  font-weight: bold;
`;

const Question = styled.div`
  font-size: 16px;
  text-align: center;
  margin-bottom: 4rem;
  color: #333;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 300px;
`;

const Button = styled.button`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const NoButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333;
  
  &:hover {
    background-color: #e5e5e5;
  }
`;

const YesButton = styled(Button)`
  background-color: #6a00ff;
  color: white;
  
  &:hover {
    background-color: #5700d4;
  }
`;

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message = "Are you sure?",
  noText = "No",
  yesText = "Yes"
}) => {
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <IconContainer>
          <QuestionIcon>?</QuestionIcon>
        </IconContainer>
        
        <Question>{message}</Question>
        
        <ButtonsContainer>
          <NoButton onClick={onClose}>{noText}</NoButton>
          <YesButton onClick={onConfirm}>{yesText}</YesButton>
        </ButtonsContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ConfirmationModal; 