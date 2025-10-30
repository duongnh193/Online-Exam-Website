import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import studentExamService from '../services/studentExamService';
import examService from '../services/examService';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useLoading } from '../contexts/LoadingContext';

// Styled Components for the new design
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
  overflow-x: hidden;
`;

const Header = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  background-color: var(--bg-secondary);
  padding: 1rem 2rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
  gap: 1rem;
  top: 0;
  position: sticky;
  z-index: 10;
`;

const ExamInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  align-items: flex-start;
`;

const ExamTitle = styled.h1`
  font-size: clamp(1.5rem, 3vw, 2.3rem);
  font-weight: 700;
  margin: 0;
  color: #6a7efc;
  text-align: left;
  width: 100%;
`;

const ExamMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
`;

const SubmitQuizButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  color: white;
  border: none;
  border-radius: 28px;
  padding: 0.9rem 1.2rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#7d37ef' : '#586df5'};
  }
`;

const HeaderActions = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;
  overflow: hidden;
`;

const TimerDisplay = styled.div`
  justify-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.4rem;
`;

const TimerBubble = styled.div`
  font-size: 1.35rem;
  font-weight: 600;
  color: ${props => props.$timeRunningOut ? 
    (props.theme === 'dark' ? '#ff6666' : '#d32f2f') : 
    (props.theme === 'dark' ? '#ffffff' : '#333')};
  background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)'};
  padding: 0.6rem 1.5rem;
  // border-radius: 999px;
  box-shadow: ${props => props.theme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};
  // border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#dfe3f4'};
`;

const TimerToggleButton = styled.button`
  padding: 0.45rem 1.85rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid ${props => props.theme === 'dark' ? '#666' : '#c7ccdd'};
  background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f6fc'};
  color: inherit;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#e8ecfb'};
  }
`;

const SectionDivider = styled.div`
  width: 100%;
  margin: 0;
  height: 4px;
  background: repeating-linear-gradient(
    to right,
    ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.35)' : '#959bb8'},
    ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.35)' : '#959bb8'} 12px,
    transparent 12px,
    transparent 22px
  );
  border-radius: 999px;
`;

const BottomSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: auto;
  align-items: stretch;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  z-index: 10;
`;

const FooterContainer = styled.footer`
  width: 100%;
  margin: 0;
  background: ${props => props.theme === 'dark' ? 'rgba(15, 18, 33, 0.9)' : '#eef1ff'};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#2e3350' : '#cdd1e4'};
  border-radius: 0;
  padding: 1.1rem clamp(1.5rem, 5vw, 4rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  box-sizing: border-box;
`;

const FooterUser = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  min-width: 0;
  flex: 0 0 auto;
`;

const FooterProgressGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
`;

const FooterProgressPill = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1.05rem;
  background: ${props => props.theme === 'dark' ? '#1d213a' : '#1d223d'};
  color: ${props => props.theme === 'dark' ? '#f7f6ff' : '#ffffff'};
  box-shadow: ${props => props.theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(29, 34, 61, 0.25)'};
`;

const FooterNotice = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#cfd2ff' : '#5661a6'};
  text-align: center;
  max-width: 340px;
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 0 0 auto;
`;

const NavigatorContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const FooterQuestionButton = styled.button`
  display: inline-flex;
  padding: 0.45rem 1.95rem;
  border-radius: 0.75rem;
  border: none;
  background: ${props => props.theme === 'dark' ? '#201b3d' : '#1d223d'};
  color: #ffffff;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 8px 18px rgba(0, 0, 0, 0.4)'
      : '0 8px 18px rgba(29, 34, 61, 0.25)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const FooterActionButton = styled.button`
  padding: 1.05rem 2.5rem;
  border-radius: 2.5rem;
  border: none;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: #ffffff;
  background: ${props => props.variant === 'ghost'
    ? (props.theme === 'dark' ? '#3a4165' : '#4f5fd4')
    : '#6a7efc'};
  box-shadow: ${props => props.theme === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.35)'
    : '0 4px 12px rgba(106, 126, 252, 0.25)'};
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 6px 16px rgba(0, 0, 0, 0.45)'
      : '0 6px 16px rgba(106, 126, 252, 0.35)'};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const QuizContent = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 0 0 1.25rem 1.25rem;
  box-shadow: var(--card-shadow);
  padding: clamp(1.5rem, 2vw, 2.25rem);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  border-top: 3px dashed ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : '#cdd1e4'};
`;

const QuestionHeaderBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.9)'};
  border: 1px solid ${props => props.theme === 'dark' ? '#32374a' : '#dfe3f4'};
  margin-bottom: 1.5rem;
`;

const QuestionNavigation = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const NavigatorPopover = styled.div`
  position: absolute;
  bottom: calc(100% + 16px);
  right: 0;
  background: ${props => props.theme === 'dark' ? '#151229' : '#ffffff'};
  border: 1px solid ${props => props.theme === 'dark' ? '#2c2f4d' : '#dce0f5'};
  border-radius: 1.25rem;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 22px 48px rgba(0, 0, 0, 0.6)'
    : '0 22px 48px rgba(47, 63, 160, 0.22)'};
  padding: 1.35rem;
  min-width: 320px;
  z-index: 20;
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    right: 32px;
    border-width: 10px 8px 0 8px;
    border-style: solid;
    border-color: ${props => props.theme === 'dark' ? '#151229' : '#ffffff'} transparent transparent transparent;
  }
  &:before {
    content: '';
    position: absolute;
    bottom: -12px;
    right: 30px;
    border-width: 12px 10px 0 10px;
    border-style: solid;
    border-color: ${props => props.theme === 'dark' ? '#2c2f4d' : '#dce0f5'} transparent transparent transparent;
  }
`;

const NavigatorFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const PopoverHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f2f4ff' : '#1d223d'};
`;

const Legend = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#cfd2ff' : '#4a4f75'};
`;

const StatusDot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.7rem;
  color: #fff;
  background: ${props => props.$variant === 'current'
    ? '#6a7efc'
    : props.$variant === 'answered'
      ? '#5fb878'
      : props.$variant === 'review'
        ? '#ff8f6a'
        : '#9ca3c7'};
`;

const QuestionNavButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid ${props => props.$current
    ? (props.theme === 'dark' ? '#8d47ff' : '#6a7efc')
    : props.$review
      ? '#ff8f6a'
      : (props.theme === 'dark' ? '#3d425f' : '#c7ccdd')};
  background: ${props => props.$current
    ? (props.theme === 'dark' ? '#8d47ff' : '#6a7efc')
    : props.$answered
      ? (props.theme === 'dark' ? 'rgba(141, 71, 255, 0.2)' : 'rgba(106, 126, 252, 0.16)')
      : props.$review
        ? (props.theme === 'dark' ? 'rgba(255, 143, 106, 0.2)' : 'rgba(255, 143, 106, 0.18)')
        : 'transparent'};
  color: ${props => props.$current
    ? '#ffffff'
    : props.theme === 'dark'
      ? '#e0e4ff'
      : '#1d223d'};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  font-weight: ${props => props.$answered ? 700 : 600};
  position: relative;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 4px 10px rgba(0, 0, 0, 0.35)'
      : '0 4px 10px rgba(106, 126, 252, 0.25)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ReviewBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff8f6a;
  border: 2px solid ${props => props.theme === 'dark' ? '#101528' : '#ffffff'};
`;

const QuestionBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const QuestionCounter = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 1rem;
  border-radius: 0.85rem;
  font-weight: 600;
  font-size: 1.05rem;
  background: ${props => props.theme === 'dark' ? 'rgba(141, 71, 255, 0.2)' : 'rgba(106, 126, 252, 0.18)'};
  color: ${props => props.theme === 'dark' ? '#d8c4ff' : '#4f5fd4'};
`;

const QuestionLabel = styled.div`
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--text-primary);
`;

const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-secondary);
`;

const ReviewToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid ${props => props.$active
    ? (props.theme === 'dark' ? '#ff9c7e' : '#ff8f6a')
    : (props.theme === 'dark' ? '#3d425f' : '#c7ccdd')};
  background: ${props => props.$active
    ? (props.theme === 'dark' ? 'rgba(255, 143, 106, 0.2)' : 'rgba(255, 143, 106, 0.15)')
    : 'transparent'};
  color: ${props => props.$active
    ? (props.theme === 'dark' ? '#ffc1aa' : '#d76236')
    : (props.theme === 'dark' ? '#e0e4ff' : '#3f4470')};
  cursor: pointer;

  &:hover {
    background: ${props => props.$active
      ? (props.theme === 'dark' ? 'rgba(255, 143, 106, 0.25)' : 'rgba(255, 143, 106, 0.22)')
      : (props.theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(99, 105, 158, 0.08)')};
  }
`;

const Instructions = styled.p`
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
`;

const QuestionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 0;
  position: relative;
  overflow: hidden;

  & > * {
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
  }

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const QuestionImage = styled.div`
  width: 100%;
  border-radius: 0.9rem;
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' ? '#2e3347' : '#FFFFFF'};
  background: ${props => props.theme === 'dark' ? '#24273a' : '#FFFFFF'};
  align-self: stretch;
  display: ${props => props.hasImage ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  min-height: ${props => props.hasImage ? '200px' : '0'};
  flex: 1 1 auto;
  
  img {
    width: 100%;
    height: auto;
    max-width: none;
    max-height: none;
    object-fit: contain;
  }
`;

const QuestionText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const PromptPanel = styled.div`
  background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.98)'};
  border-radius: 1rem;
  padding: clamp(1.25rem, 2vw, 2rem);
  border: 1px solid ${props => props.theme === 'dark' ? '#2f3346' : '#e4e8f6'};
  box-shadow: ${props => props.theme === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.35)' : '0 10px 30px rgba(106, 126, 252, 0.12)'};
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 0;
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
  min-width: 280px;
`;

const AnswerPanel = styled.div`
  background-color: ${props => props.theme === 'dark' ? 'rgba(11, 14, 26, 0.7)' : 'rgba(245, 247, 255, 0.85)'};
  border-radius: 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#383d52' : '#d7dcf0'};
  padding: clamp(1.25rem, 2vw, 2rem);
  box-shadow: ${props => props.theme === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.35)' : '0 12px 34px rgba(106, 126, 252, 0.18)'};
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  min-width: 0;
  box-sizing: border-box;
  min-width: 280px;
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AnswerOption = styled.label`
  display: flex;
  align-items: flex-start;
  padding: 1.5rem 1.2rem;
  border: 1px solid ${props => props.selected ? 
    (props.theme === 'dark' ? '#8d47ff' : '#6a7efc') : 
    (props.theme === 'dark' ? '#444' : '#eee')};
  border-radius: 10px;
  cursor: pointer;
  background-color: ${props => props.selected ? 
    (props.theme === 'dark' ? 'rgba(141, 71, 255, 0.1)' : 'rgba(106, 126, 252, 0.05)') : 
    (props.theme === 'dark' ? '#2a2a2a' : 'white')};
  
  &:hover {
    border-color: ${props => props.selected ? 
      (props.theme === 'dark' ? '#8d47ff' : '#6a7efc') : 
      (props.theme === 'dark' ? '#555' : '#ddd')};
    background-color: ${props => props.selected ? 
      (props.theme === 'dark' ? 'rgba(141, 71, 255, 0.15)' : 'rgba(106, 126, 252, 0.05)') : 
      (props.theme === 'dark' ? '#333' : '#fafafa')};
  }
`;

const RadioInput = styled.input`
  margin-right: 0.8rem;
  margin-top: 0.2rem;
`;

const CheckboxInput = styled.input`
  margin-right: 0.8rem;
  margin-top: 0.2rem;
`;

const EssayInput = styled.textarea`
  width: 100%;
  flex: 1 1 auto;
  min-height: clamp(240px, 45vh, 520px);
  padding: clamp(1rem, 1.5vw, 1.5rem);
  border: 1px solid ${props => props.theme === 'dark' ? '#2f3346' : '#e4e8f6'};
  border-radius: 1rem;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  background-color: ${props => props.theme === 'dark' ? 'rgba(17, 21, 36, 0.9)' : 'var(--bg-secondary)'};
  color: var(--text-primary);
  box-shadow: inset 0 1px 3px ${props => props.theme === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(106, 126, 252, 0.12)'};
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#9aa1c6' : '#97a0c4'};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
    box-shadow: 0 0 0 3px ${props => props.theme === 'dark' ? 'rgba(141, 71, 255, 0.25)' : 'rgba(106, 126, 252, 0.25)'};
    background-color: ${props => props.theme === 'dark' ? 'rgba(23, 28, 46, 0.95)' : 'var(--bg-secondary)'};
  }
`;

const OptionText = styled.div`
  font-size: 1.05rem;
  color: var(--text-primary);
`;

const Resizer = styled.div`
  flex: 0 0 24px;
  cursor: col-resize;
  position: relative;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0 0.25rem;
  background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(79, 95, 212, 0.05)'};

  &::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 70%;
    border-radius: 3px;
    background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : '#ccd2f5'};
    box-shadow: ${props => props.theme === 'dark'
      ? '0 0 0 1px rgba(0, 0, 0, 0.4)'
      : '0 0 0 1px rgba(79, 95, 212, 0.22)'};
  }

  &::after {
    content: '';
    position: absolute;
    width: 34px;
    height: 56px;
    border-radius: 14px;
    background-color: ${props => props.theme === 'dark' ? 'rgba(17, 21, 36, 0.94)' : 'rgba(23, 31, 68, 0.94)'};
    box-shadow: 0 4px 10px rgba(0, 0, 0, ${props => props.theme === 'dark' ? '0.45' : '0.25'});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 14px 26px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='26' viewBox='0 0 14 26'%3E%3Cpath fill='%23ffffff' d='M2.2 13l5-5.2v10.4l-5-5.2zm9.6 0l-5 5.2V7.8l5 5.2z'/%3E%3C/svg%3E");
    pointer-events: none;
  }

  &:hover::after {
    background-color: ${props => props.theme === 'dark' ? 'rgba(33, 39, 66, 0.96)' : 'rgba(79, 95, 212, 0.92)'};
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const PromptScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.75rem;
  height: 100%;
`;

const AnswerScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-left: 0.75rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: stretch;
`;

const CenteredContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: clamp(1.5rem, 4vw, 3rem);
  box-sizing: border-box;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorContainer = styled.div`
  max-width: 600px;
  width: min(600px, 100%);
  margin: 0 auto;
  text-align: center;
  padding: clamp(1.5rem, 4vw, 2.75rem);
  background: transparent;
  border-radius: 1rem;
  box-sizing: border-box;
  overflow: hidden;
  
  @media (max-width: 420px) {
    padding: 1.5rem;
    border-radius: 0.85rem;
  }
  
  h2 {
    color: ${props => props.theme === 'dark' ? '#ff6666' : '#d32f2f'};
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
`;

const ResultContainer = styled.div`
  max-width: 600px;
  width: min(600px, 100%);
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 2.75rem);
  background: transparent;
  border-radius: 1rem;
  text-align: center;
  color: var(--text-primary);
  box-sizing: border-box;
  overflow: hidden;
  
  @media (max-width: 420px) {
    padding: 1.5rem;
    border-radius: 0.85rem;
  }
`;

const ScoreDisplay = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'};
  margin: 2rem 0;
`;

const ResultDetails = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  
  div {
    text-align: center;
    
    span {
      display: block;
      font-size: 2rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }
    
    label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }
`;

const CompletionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: clamp(2rem, 5vw, 3rem);
  background: transparent;
  border: none;
  border-radius: 1.5rem;
  text-align: center;
  width: min(600px, 100%);
  box-sizing: border-box;
  overflow: hidden;
  
  @media (max-width: 420px) {
    padding: 1.75rem;
    border-radius: 0.95rem;
  }
`;

const CompletionIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
`;

const CompletionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, 
    ${props => props.theme === 'dark' ? '#8d47ff' : '#6a7efc'}, 
    ${props => props.theme === 'dark' ? '#ff6b9d' : '#ff7eb3'}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CompletionMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;


function TakeExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { disableLoader, enableLoader } = useLoading();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState({});
  const [essayAnswers, setEssayAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [studentExamId, setStudentExamId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [questionStates, setQuestionStates] = useState([]);
  const [answerCache, setAnswerCache] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [panelRatio, setPanelRatio] = useState(0.5);
  const [isResizingPanels, setIsResizingPanels] = useState(false);
  const questionContentRef = useRef(null);
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [reviewFlags, setReviewFlags] = useState({});

  useEffect(() => {
    disableLoader();
    return () => {
      enableLoader();
    };
  }, [disableLoader, enableLoader]);

  useEffect(() => {
    if (!examId) return;
    examService.getExamById(examId)
      .then(res => {
        if (res.data) {
          setExam(res.data);
        } else {
          setExam(null);
        }
        if (res.data && typeof res.data.totalQuestions === 'number') {
          setTotalQuestions(res.data.totalQuestions);
        } else {
          setTotalQuestions(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch exam for total questions:', err);
        setTotalQuestions(null);
        setExam(null);
      });
  }, [examId]);

  const mapQuestionPayload = useCallback((questionData) => {
    if (!questionData) {
      return null;
    }

    const normalizeOption = (choice) => {
      if (typeof choice === 'string') {
        return { id: choice, text: choice };
      }
      if (typeof choice === 'object' && choice !== null) {
        return {
          id: choice.id || choice.optionKey || choice.value || Math.random().toString(36).slice(2, 9),
          text: choice.text || choice.content || choice.optionValue || String(choice.id ?? '')
        };
      }
      return { id: String(choice), text: String(choice) };
    };

    return {
      id: questionData.id,
      text: questionData.title || questionData.text || '',
      type: questionData.type,
      imageUrl: questionData.image || questionData.imageUrl || questionData.img || questionData.imagePath || questionData.imageUri || null,
      options: Array.isArray(questionData.choices) ? questionData.choices.map(normalizeOption) : []
    };
  }, []);

  const syncAnswerStateFromServer = useCallback((question, answerValue) => {
    if (!question) {
      return;
    }

    const normalizedAnswer = typeof answerValue === 'string' ? answerValue.trim() : '';
    setAnswerCache(prev => ({ ...prev, [question.id]: normalizedAnswer }));

    const normalizeOptionText = (option) => {
      if (!option) return '';
      if (typeof option.text === 'string') return option.text.trim();
      if (typeof option.text === 'object') return JSON.stringify(option.text);
      return String(option.text ?? '').trim();
    };

    if (question.type === 'MULTIPLE_CHOICE') {
      const selections = normalizedAnswer
        ? normalizedAnswer.split(',').map(item => item.trim()).filter(Boolean)
        : [];

      const mappedSelections = selections.map(selectionText => {
        const matchedOption = (question.options || []).find(opt => normalizeOptionText(opt) === selectionText);
        if (matchedOption) {
          return { id: matchedOption.id, text: matchedOption.text };
        }
        return { id: selectionText, text: selectionText };
      });

      setMultipleChoiceAnswers(prev => ({
        ...prev,
        [question.id]: mappedSelections
      }));

      setAnswers(prev => ({
        ...prev,
        [question.id]: null
      }));

      setEssayAnswers(prev => ({
        ...prev,
        [question.id]: ''
      }));
      return;
    }

    if (question.type === 'ESSAY') {
      setEssayAnswers(prev => ({
        ...prev,
        [question.id]: answerValue || ''
      }));
      setAnswers(prev => ({
        ...prev,
        [question.id]: null
      }));
      setMultipleChoiceAnswers(prev => ({
        ...prev,
        [question.id]: []
      }));
      return;
    }

    const matchedOption = (question.options || []).find(opt => normalizeOptionText(opt) === normalizedAnswer);

    setAnswers(prev => ({
      ...prev,
      [question.id]: matchedOption
        ? { id: matchedOption.id, text: matchedOption.text }
        : null
    }));

    setMultipleChoiceAnswers(prev => ({
      ...prev,
      [question.id]: []
    }));

    setEssayAnswers(prev => ({
      ...prev,
      [question.id]: ''
    }));
  }, [setAnswerCache, setMultipleChoiceAnswers, setAnswers, setEssayAnswers]);

  const applyExamResponse = useCallback((responseData) => {
    if (!responseData || !responseData.studentExam) {
      setError('Failed to load exam session. Please try again.');
      return;
    }

    const { studentExam, question, currentIndex, totalQuestions: total, questionStates: states, secondsRemaining, answer } = responseData;

    if (studentExam.id) {
      setStudentExamId(studentExam.id);
      localStorage.setItem('currentStudentExamId', studentExam.id);
    }

    let normalizedQuestions = Array.isArray(studentExam.exam?.questions)
      ? studentExam.exam.questions.map(mapQuestionPayload)
      : [];

    if (typeof total === 'number') {
      setTotalQuestions(total);
    } else {
      setTotalQuestions(normalizedQuestions.length);
    }

    if (studentExam.exam) {
      setExam(studentExam.exam);
    }

    if (typeof currentIndex === 'number') {
      setCurrentQuestionIndex(currentIndex);
      if (studentExam.id) {
        localStorage.setItem(`exam_current_question_${studentExam.id}`, currentIndex.toString());
      }
    }

    if (Array.isArray(states)) {
      setQuestionStates(states);
      setExamCompleted(states.length > 0 && states.every(state => state.answered));
    } else {
      setQuestionStates([]);
      setExamCompleted(false);
    }

    if (typeof secondsRemaining === 'number') {
      setTimeRemaining(secondsRemaining);
    }

    const stateList = Array.isArray(states) ? states : [];
    const indexResolver = (state, fallbackIndex) => {
      if (!stateList.length || !state) return fallbackIndex;
      if (typeof state.index === 'number') return state.index;
      return fallbackIndex;
    };

    const expectedLength = (() => {
      if (typeof total === 'number' && total > 0) return total;
      if (stateList.length > 0) {
        const resolved = stateList.map((state, idx) => indexResolver(state, idx));
        return Math.max(...resolved) + 1;
      }
      if (typeof currentIndex === 'number' && currentIndex >= 0) return currentIndex + 1;
      return normalizedQuestions.length;
    })();

    const questionStateById = new Map(
      stateList.map((state, idx) => [state.questionId, indexResolver(state, idx)])
    );

    if ((!normalizedQuestions.length) && expectedLength > 0) {
      normalizedQuestions = Array.from({ length: expectedLength }, () => null);
    } else if (expectedLength > 0 && normalizedQuestions.length < expectedLength) {
      normalizedQuestions = [
        ...normalizedQuestions,
        ...Array(expectedLength - normalizedQuestions.length).fill(null)
      ];
    }

    if (Array.isArray(studentExam.exam?.questions) && studentExam.exam.questions.length) {
      const examQuestions = studentExam.exam.questions.map(mapQuestionPayload);
      const merged = normalizedQuestions.length ? [...normalizedQuestions] : [];

      examQuestions.forEach(q => {
        if (!q) {
          return;
        }
        const targetIndex = questionStateById.has(q.id)
          ? questionStateById.get(q.id)
          : merged.findIndex(existing => existing?.id === q.id);
        if (targetIndex !== undefined && targetIndex !== -1) {
          while (merged.length <= targetIndex) {
            merged.push(null);
          }
          merged[targetIndex] = q;
        } else {
          merged.push(q);
        }
      });

      normalizedQuestions = merged;
    }

    let mappedCurrent = null;
    let targetIndex = typeof currentIndex === 'number' && currentIndex >= 0 ? currentIndex : 0;

    if (question) {
      mappedCurrent = mapQuestionPayload(question);
    }

    setQuestions(prev => {
      let merged = normalizedQuestions.length ? [...normalizedQuestions] : [...prev];

      if (!merged.length && expectedLength > 0) {
        merged = Array.from({ length: expectedLength }, () => null);
      }

      if (mappedCurrent) {
        if (merged.length <= targetIndex) {
          merged = [...merged, ...Array(targetIndex - merged.length + 1).fill(null)];
        }
        merged[targetIndex] = mappedCurrent;
      }

      if (!merged.length && mappedCurrent) {
        merged = [mappedCurrent];
        targetIndex = 0;
      }

      if (stateList.length) {
        const prevById = new Map((prev || []).filter(Boolean).map(q => [q.id, q]));
        merged = merged.map((item, idx) => {
          if (item && item.id) return item;
          const state = stateList.find((s, sIdx) => indexResolver(s, sIdx) === idx);
          if (state) {
            const stateQuestionId = state.questionId;
            if (stateQuestionId && prevById.has(stateQuestionId)) {
              return prevById.get(stateQuestionId);
            }
            if (stateQuestionId && mappedCurrent && stateQuestionId === mappedCurrent.id) {
              return mappedCurrent;
            }
            if (stateQuestionId) {
              return item ?? { id: stateQuestionId, text: '', type: mappedCurrent?.type || 'SINGLE_CHOICE', options: [] };
            }
          }
          return item;
        });
      }

      return merged;
    });

    if (mappedCurrent) {
      syncAnswerStateFromServer(mappedCurrent, answer);
      setActiveQuestion(mappedCurrent);
    } else if (typeof targetIndex === 'number' && targetIndex >= 0 && normalizedQuestions[targetIndex]) {
      syncAnswerStateFromServer(normalizedQuestions[targetIndex], answer);
      setActiveQuestion(normalizedQuestions[targetIndex]);
    }
  }, [
    mapQuestionPayload,
    syncAnswerStateFromServer,
    setExam,
    setStudentExamId,
    setTotalQuestions,
    setCurrentQuestionIndex,
    setQuestionStates,
    setExamCompleted,
    setTimeRemaining,
    setQuestions
  ]);
  
  useEffect(() => {
    let cancelled = false;

    const initializeExamSession = async () => {
      const storedStudentExamId = localStorage.getItem('currentStudentExamId');

      if (storedStudentExamId) {
        setStudentExamId(storedStudentExamId);
      }

      const derivedExamId = examId || (storedStudentExamId ? storedStudentExamId.split('-')[1] : null);

      if (!derivedExamId) {
        setError('No active exam session found. Please start the exam again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const password = await examService.getExamPassword(derivedExamId);
        const response = await studentExamService.startExam(derivedExamId, password);
        if (cancelled) {
          return;
        }
        if (response?.data) {
          applyExamResponse(response.data);
        } else {
          setError('Invalid exam response received.');
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        console.error('Failed to initialize exam session:', err);
        const message = err.response?.data?.message || err.message || 'Failed to start exam.';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initializeExamSession();

    return () => {
      cancelled = true;
    };
  }, [examId, applyExamResponse]);
  
  const getAnswerPayload = useCallback((question) => {
    if (!question) {
      return '';
    }

    if (question.type === 'MULTIPLE_CHOICE') {
      const selections = multipleChoiceAnswers[question.id] || [];
      return selections
        .map(selection => (selection?.text || '').trim())
        .filter(Boolean)
        .join(', ');
    }

    if (question.type === 'ESSAY') {
      return (essayAnswers[question.id] || '').trim();
    }

    const selected = answers[question.id];
    return selected?.text ? selected.text.trim() : '';
  }, [answers, multipleChoiceAnswers, essayAnswers]);

  const persistAnswer = useCallback(async (questionId, answerText, questionIndex) => {
    if (!studentExamId || !questionId) {
      return null;
    }

    try {
      const response = await studentExamService.submitAnswer(
        studentExamId,
        questionId,
        answerText,
        questionIndex
      );

      if (response?.data) {
        applyExamResponse(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to persist answer:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save answer.');
      throw error;
    }
  }, [studentExamId, applyExamResponse, setError]);

  const saveCurrentAnswerIfNeeded = useCallback(async () => {
    const question = questions[currentQuestionIndex] || activeQuestion;
    if (!question || !studentExamId) {
      return null;
    }

    const payload = getAnswerPayload(question);
    const cached = (answerCache[question.id] || '').trim();
    const normalizedPayload = payload.trim();

    if (normalizedPayload === cached) {
      return null;
    }

    return persistAnswer(question.id, normalizedPayload, currentQuestionIndex);
  }, [
    questions,
    activeQuestion,
    currentQuestionIndex,
    studentExamId,
    getAnswerPayload,
    answerCache,
    persistAnswer
  ]);

  const loadQuestionByIndex = useCallback(async (targetIndex) => {
    if (!studentExamId) {
      return;
    }

    const totalCount = typeof totalQuestions === 'number' && totalQuestions > 0
      ? totalQuestions
      : Math.max(
          questions.length,
          activeQuestion ? 1 : 0,
          Array.isArray(questionStates) ? questionStates.length : 0
        );

    if (totalCount === 0) {
      return;
    }

    const sanitizedIndex = Math.max(0, Math.min(targetIndex, totalCount - 1));

    setQuestionLoading(true);
    try {
      const response = await studentExamService.getQuestion(studentExamId, sanitizedIndex);
      if (response?.data) {
        applyExamResponse(response.data);
      }
    } catch (error) {
      console.error('Failed to load question:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load question.');
    } finally {
      setQuestionLoading(false);
    }
  }, [studentExamId, totalQuestions, questions, questionStates, activeQuestion, applyExamResponse, setError]);

  const navigateToQuestion = useCallback(async (targetIndex) => {
    const totalCount = typeof totalQuestions === 'number' && totalQuestions > 0
      ? totalQuestions
      : Math.max(
          questions.length,
          activeQuestion ? 1 : 0,
          Array.isArray(questionStates) ? questionStates.length : 0
        );

    if (totalCount === 0) {
      return;
    }

    const sanitizedIndex = Math.max(0, Math.min(targetIndex, totalCount - 1));

    if (sanitizedIndex === currentQuestionIndex || isNavigating) {
      return;
    }

    setIsNavigating(true);
    try {
      await saveCurrentAnswerIfNeeded();
      await loadQuestionByIndex(sanitizedIndex);
      setIsNavigatorOpen(false);
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      setIsNavigating(false);
    }
  }, [
    totalQuestions,
    questions,
    questionStates,
    activeQuestion,
    currentQuestionIndex,
    isNavigating,
    saveCurrentAnswerIfNeeded,
    loadQuestionByIndex
  ]);

  const toggleReviewFlag = useCallback((questionId) => {
    if (!questionId) return;
    setReviewFlags(prev => ({
      ...prev,
      [questionId]: !prev?.[questionId]
    }));
  }, []);

  const handleSubmitExam = async (eventOrOptions) => {
    let options = {};
    
    if (eventOrOptions && typeof eventOrOptions.preventDefault === 'function') {
      eventOrOptions.preventDefault();
    } else if (eventOrOptions && typeof eventOrOptions === 'object') {
      options = eventOrOptions;
    }
    
    const { autoTrigger = false } = options;
    
    if (!studentExamId) {
      setError('No active exam session found');
      return;
    }

    try {
      await saveCurrentAnswerIfNeeded();
    } catch (error) {
      console.error('Failed to save current answer before submission:', error);
    }
    
    if (autoTrigger) {
      setShowSubmitConfirmation(false);
      setInfoMessage('Time is up. Submitting your exam automatically...');
      handleConfirmSubmit({ isAuto: true });
      return;
    }
    
    setInfoMessage('');
    setShowSubmitConfirmation(true);
  };

  const handleNextQuestion = useCallback(async () => {
    const totalCount = typeof totalQuestions === 'number' && totalQuestions > 0
      ? totalQuestions
      : Math.max(
          questions.length,
          activeQuestion ? 1 : 0,
          Array.isArray(questionStates) ? questionStates.length : 0
        );

    const isLast = totalCount > 0 && currentQuestionIndex >= totalCount - 1;

    if (isLast) {
      await handleSubmitExam();
      return;
    }

    await navigateToQuestion(currentQuestionIndex + 1);
  }, [
    totalQuestions,
    questions,
    questionStates,
    activeQuestion,
    currentQuestionIndex,
    navigateToQuestion,
    handleSubmitExam
  ]);

  const handlePreviousQuestion = useCallback(async () => {
    await navigateToQuestion(currentQuestionIndex - 1);
  }, [navigateToQuestion, currentQuestionIndex]);
  
  useEffect(() => {
    if (timeRemaining === null || loading || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmitExam({ autoTrigger: true });
          return 0;
        }
        
        if (prevTime % 30 === 0 && studentExamId) {
          localStorage.setItem(`exam_time_remaining_${studentExamId}`, prevTime.toString());
          localStorage.setItem(`exam_time_last_updated_${studentExamId}`, Date.now().toString());
        }
        
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, loading, studentExamId, handleSubmitExam]);

  useEffect(() => {
    if (!studentExamId || showResults || examCompleted || loading) return;

    let isTabActive = true;

    const handleTabSwitch = async () => {
      try {
        await studentExamService.checkTab(studentExamId);
        // console.log('Tab switch recorded successfully');
      } catch (error) {
        console.error('Failed to record tab switch:', error);
      }
    };

    const handleVisibilityChange = () => {
      const isHidden = document.hidden || document.visibilityState === 'hidden';
      
      if (isHidden && isTabActive) {
        console.log('👁️ Page became hidden - tab switch detected');
        isTabActive = false;
        
        handleTabSwitch();
      } else if (!isHidden && !isTabActive) {
        console.log('👁️ Page became visible again');
        isTabActive = true;
      }
    };

    const handleWindowBlur = () => {
      if (isTabActive) {
        // console.log('Window lost focus - tab switch detected');
        isTabActive = false;
        
        handleTabSwitch();
      }
    };

    const handleWindowFocus = () => {
      // console.log('🔄 Window gained focus');
      isTabActive = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [studentExamId, showResults, examCompleted, loading]);
  
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--Mins';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}Mins`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}Mins`;
    }
  };

  const handleSingleChoiceSelect = (questionId, optionId) => {
    if (!questionId || !optionId) return;
    
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    const selectedOption = currentQuestion.options?.find(opt => opt.id === optionId);
    if (!selectedOption) return;
    
    setAnswers({
      ...answers,
      [questionId]: {
        id: optionId,
        text: selectedOption.text || ''
      }
    });
  };
  
  const handleMultipleChoiceSelect = (questionId, optionId) => {
    if (!questionId || !optionId) return;
    
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) return;
    
    const currentSelections = multipleChoiceAnswers[questionId] || [];
    let updatedSelections;
    
    if (currentSelections.some(item => item.id === optionId)) {
      updatedSelections = currentSelections.filter(item => item.id !== optionId);
    } else {
      const selectedOption = currentQuestion.options?.find(opt => opt.id === optionId);
      if (!selectedOption) return;
      
      updatedSelections = [
        ...currentSelections,
        {
          id: optionId,
          text: selectedOption.text || ''
        }
      ];
    }
    
    setMultipleChoiceAnswers({
      ...multipleChoiceAnswers,
      [questionId]: updatedSelections
    });
  };
  
  const handleEssayChange = (questionId, text) => {
    setEssayAnswers({
      ...essayAnswers,
      [questionId]: text
    });
  };
  
  
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!studentExamId || showResults) {
        return;
      }

      const examIdParts = studentExamId.split('-');
      if (examIdParts.length > 1) {
        const examId = examIdParts[1];
        const completedExams = JSON.parse(localStorage.getItem('completedExams') || '{}');
        completedExams[examId] = false;
        localStorage.setItem('completedExams', JSON.stringify(completedExams));
      }

      const warningMessage = 'You have unsaved exam progress. Are you sure you want to leave?';
      event.preventDefault();
      event.returnValue = warningMessage;
      return warningMessage;
    };
    
    if (studentExamId && !showResults) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [studentExamId, showResults]);

  useEffect(() => {
    if (!isResizingPanels) return;

    const handlePointerMove = (event) => {
      if (!questionContentRef.current) return;
      if (event.touches) {
        event.preventDefault();
      }

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const rect = questionContentRef.current.getBoundingClientRect();
      const rawRatio = (clientX - rect.left) / rect.width;

      const clampedRatio = Math.min(0.75, Math.max(0.25, rawRatio));
      setPanelRatio(clampedRatio);
    };

    const stopResizing = () => {
      setIsResizingPanels(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', stopResizing);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', stopResizing);
    window.addEventListener('touchcancel', stopResizing);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', stopResizing);
      window.removeEventListener('touchcancel', stopResizing);
    };
  }, [isResizingPanels]);

  const getUserInitial = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'S';
  };
  
  const getUserName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      return user.username || 'Student';
    }
    return 'Student';
  };
  
  const handleConfirmSubmit = async (eventOrOptions, maybeOptions) => {
    let event = null;
    let options = {};
    
    if (eventOrOptions && typeof eventOrOptions.preventDefault === 'function') {
      event = eventOrOptions;
      options = maybeOptions || {};
    } else if (eventOrOptions && typeof eventOrOptions === 'object') {
      options = eventOrOptions;
    }
    
    if (event) {
      event.preventDefault();
    }
    
    const { isAuto = false } = options;
    
    let submissionSucceeded = false;

    try {
      if (isAuto) {
        setInfoMessage('Time is up. Submitting your exam automatically...');
      }
      
      setLoading(true);
      
      localStorage.setItem(`exam_submitting_${studentExamId}`, 'true');
      
      console.log('Submitting entire exam to server...', 'Current student exam ID:', studentExamId);
      const response = await studentExamService.submitExam(studentExamId);
      console.log('Exam submitted successfully:', response.data);
      
      console.log('Raw response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.answers) {
        console.log('Answer details:', response.data.answers);
      }
      
      if (response.data.questions) {
        console.log('Question details:', response.data.questions);
      }
      
      if (response.data.correctAnswers !== undefined) {
        console.log('Correct answers count:', response.data.correctAnswers);
        console.log('Wrong answers count:', response.data.wrongAnswers);
        console.log('Total questions:', response.data.totalQuestions);
      }
      
      if (response.data) {
        const result = {
          correctAnswers: response.data.correctAnswers || 0,
          wrongAnswers: response.data.wrongAnswers || 0,
          totalQuestions: response.data.totalQuestions || 0,
          score: response.data.score || 0,
          duration: response.data.duration || 0
        };
        
        console.log('Final exam result being set:', result);
        console.log('📊 Score Calculation Info:', {
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          rawScore: result.score,
          scoreDisplay: `${result.score.toFixed(1)} điểm`,
          calculationMethod: '(correctAnswers * 10.0) / totalQuestions'
        });
        
        setExamResult(result);
        setShowResults(true);
        submissionSucceeded = true;
        
        localStorage.removeItem('currentStudentExamId');
        localStorage.removeItem('examSession');
        localStorage.removeItem(`exam_submitting_${studentExamId}`);
      } else {
        setError('Received invalid response from server');
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      
      localStorage.removeItem(`exam_submitting_${studentExamId}`);
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        if (err.response.data && err.response.data.message) {
          setError(`Failed to submit exam: ${err.response.data.message}`);
        } else {
          setError('Failed to submit exam. Please try again.');
        }
      } else if (err.message) {
        setError(`Failed to submit exam: ${err.message}`);
      } else {
        setError('Failed to submit exam. Please try again.');
      }
      if (isAuto) {
        setInfoMessage('Automatic submission failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setShowSubmitConfirmation(false);
      if (isAuto && submissionSucceeded) {
        setInfoMessage('');
      }
    }
  };

  const getExamTitleText = () => {
    if (exam) {
      return (
        exam.title ||
        exam.name ||
        exam.examTitle ||
        exam.examName ||
        'Exam Session'
      );
    }
    return 'Exam Session';
  };

  const getExamMetaTag = () => {
    if (exam) {
      if (exam.subjectName) {
        return exam.subjectName;
      }
      if (exam.category) {
        return exam.category;
      }
      if (exam.moduleName) {
        return exam.moduleName;
      }
    }
    return null;
  };

  const ExamResultsScreen = () => {
    if (!examResult) return null;
    
    return (
      <ResultContainer theme={theme}>
        <h2>Quiz Completed</h2>
        
        <ScoreDisplay theme={theme}>
          {examResult.score.toFixed(1)} 
        </ScoreDisplay>
        
        <ResultDetails>
          <div>
            <span>{examResult.correctAnswers}</span>
            <label>Correct</label>
          </div>
          <div>
            <span>{examResult.wrongAnswers}</span>
            <label>Wrong</label>
          </div>
          <div>
            <span>{examResult.totalQuestions}</span>
            <label>Total</label>
          </div>
        </ResultDetails>
        
        {examResult.answerResults && examResult.answerResults.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Answer Details</h3>
            {examResult.answerResults.map((result, index) => (
              <div key={index} style={{ 
                margin: '1rem 0', 
                padding: '1rem', 
                borderRadius: '8px',
                backgroundColor: result.correct ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                border: `1px solid ${result.correct ? '#4CAF50' : '#F44336'}`
              }}>
                <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
                  Question {index + 1}: {result.questionText || `Question ${result.questionId}`}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Your answer:</span> {result.studentAnswer || 'No answer'}
                </div>
                <div>
                  <span style={{ fontWeight: '500' }}>Correct answer:</span> {result.correctAnswer || 'Not available'}
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  color: result.correct ? '#4CAF50' : '#F44336',
                  fontWeight: '500'
                }}>
                  {result.correct ? '✓ Correct' : '✗ Wrong'}
                </div>
              </div>
            ))}
          </div>
        )}
      </ResultContainer>
    );
  };
  
  const ExamCompletionScreen = () => {
    return (
      <CompletionContainer theme={theme}>
        <CompletionIcon>🎉</CompletionIcon>
        <CompletionTitle theme={theme}>Exam Completed!</CompletionTitle>
        <CompletionMessage>
          You have successfully completed all questions in this exam. 
          Use the footer controls to submit and review your results.
        </CompletionMessage>
      </CompletionContainer>
    );
  };
  
  const timeRunningOut = timeRemaining !== null && timeRemaining < 300;

  if (loading) {
    return (
      <LoadingContainer>
        Loading quiz...
      </LoadingContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        {renderHeader({ showSubmitButton: false })}
        <SectionDivider theme={theme} />
        <MainContent>
          <CenteredContent>
            <ErrorContainer theme={theme}>
              <h2>Error</h2>
              <p>{error}</p>
            </ErrorContainer>
          </CenteredContent>
        </MainContent>
        <BottomSection>
          <SectionDivider theme={theme} />
          <FooterContainer theme={theme}>
            <FooterUser>{getUserName()}</FooterUser>
            {/* <FooterProgressGroup>
              <FooterProgressPill theme={theme}>
                Exam Status
              </FooterProgressPill>
              <FooterNotice theme={theme}>An error occurred while loading this exam.</FooterNotice>
            </FooterProgressGroup> */}
            <FooterActions>
              <FooterActionButton
                theme={theme}
                variant="ghost"
                onClick={() => navigate('/exams')}
              >
                Back
              </FooterActionButton>
            </FooterActions>
          </FooterContainer>
        </BottomSection>
      </PageContainer>
    );
  }
  
  if (showResults) {
    return (
      <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        {renderHeader({ showSubmitButton: false })}
        <SectionDivider theme={theme} />
        <MainContent>
          <CenteredContent>
            <ExamResultsScreen />
          </CenteredContent>
        </MainContent>
        <BottomSection>
          <SectionDivider theme={theme} />
          <FooterContainer theme={theme}>
            <FooterUser>{getUserName()}</FooterUser>
            {/* <FooterProgressGroup>
              <FooterProgressPill theme={theme}>
                Results Summary
              </FooterProgressPill>
              <FooterNotice theme={theme}>You can review your answers or return to the exam list.</FooterNotice>
            </FooterProgressGroup> */}
            <FooterActions>
              <FooterActionButton
                theme={theme}
                variant="ghost"
                onClick={() => navigate('/exams')}
              >
                Back to Exams
              </FooterActionButton>
            </FooterActions>
          </FooterContainer>
        </BottomSection>
      </PageContainer>
    );
  }

  const totalQuestionCount = typeof totalQuestions === 'number' && totalQuestions > 0
    ? totalQuestions
    : questions.length;

  if (examCompleted) {
    return (
      <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        {renderHeader({ showSubmitButton: false })}
        <SectionDivider theme={theme} />
        <MainContent>
          <CenteredContent>
            <ExamCompletionScreen />
          </CenteredContent>
        </MainContent>
        <BottomSection>
          <SectionDivider theme={theme} />
          <FooterContainer theme={theme}>
            <FooterUser>{getUserName()}</FooterUser>
            {/* <FooterProgressGroup>
              <FooterProgressPill theme={theme}>
                Review & Submit
              </FooterProgressPill>
              <FooterNotice theme={theme}>Click submit to finalize and see your results.</FooterNotice>
            </FooterProgressGroup> */}
            <FooterActions>
              <FooterActionButton
                theme={theme}
                onClick={handleSubmitExam}
              >
                Submit Now
              </FooterActionButton>
            </FooterActions>
          </FooterContainer>
        </BottomSection>
        
        <ConfirmationModal
          isOpen={showSubmitConfirmation}
          onClose={() => setShowSubmitConfirmation(false)}
          onConfirm={handleConfirmSubmit}
          message="Are you sure you want to submit Quiz?"
        />
      </PageContainer>
    );
  }
  
  const fallbackQuestions = questions.length > 0 ? questions : (activeQuestion ? [activeQuestion] : []);
  const currentQuestion = questions.length > 0
    ? (questions[currentQuestionIndex] || questions.find(Boolean) || activeQuestion)
    : activeQuestion;

  if (!currentQuestion) {
    return (
      <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        {renderHeader({ showSubmitButton: false })}
        <SectionDivider theme={theme} />
        <MainContent>
          <CenteredContent>
            <ErrorContainer theme={theme}>
              <h2>No Questions Available</h2>
              <p>There was an issue loading the questions for this quiz.</p>
            </ErrorContainer>
          </CenteredContent>
        </MainContent>
        <BottomSection>
          <SectionDivider theme={theme} />
          <FooterContainer theme={theme}>
            <FooterUser>{getUserName()}</FooterUser>
            {/* <FooterProgressGroup>
              <FooterProgressPill theme={theme}>
                Waiting for Questions
              </FooterProgressPill>
              <FooterNotice theme={theme}>Please return to the exam list and try again.</FooterNotice>
            </FooterProgressGroup> */}
            <FooterActions>
              <FooterActionButton
                theme={theme}
                variant="ghost"
                onClick={() => navigate('/exams')}
              >
                Back
              </FooterActionButton>
            </FooterActions>
          </FooterContainer>
        </BottomSection>
      </PageContainer>
    );
  }

  const displayedQuestionNumber = currentQuestion ? getDisplayedQuestionNumber() : 0;
  const currentQuestionReview = currentQuestion ? Boolean(reviewFlags[currentQuestion.id]) : false;
  const isLastQuestion = totalQuestionCount > 0 && currentQuestionIndex >= totalQuestionCount - 1;
  const isFirstQuestion = currentQuestionIndex <= 0;

  // console.log('🐛 RENDER STATE DEBUG:', {
  //   currentQuestionIndex,
  //   questionsLength: questions.length,
  //   currentQuestionId: currentQuestion?.id,
  //   currentQuestionText: currentQuestion?.text?.substring(0, 50),
  //   currentQuestionImageUrl: currentQuestion?.imageUrl,
  //   isLastQuestion,
  //   loading,
  //   questionsIds: questions.map(q => q.id)
  // });
  
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'ESSAY':
        return (
          <EssayInput
            theme={theme}
            value={essayAnswers[currentQuestion.id] || ''}
            onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
            placeholder="Write your answer here..."
          />
        );
        
      case 'MULTIPLE_CHOICE':
        return (
          <AnswerOptions>
            {(currentQuestion.options || []).map(option => (
              <AnswerOption 
                key={option.id || 'unknown'}
                selected={(multipleChoiceAnswers[currentQuestion.id] || []).some(item => item.id === option.id)}
                theme={theme}
              >
                <CheckboxInput 
                  type="checkbox"
                  name={`question-${currentQuestion.id}-option-${option.id || 'unknown'}`}
                  checked={(multipleChoiceAnswers[currentQuestion.id] || []).some(item => item.id === option.id)}
                  onChange={() => handleMultipleChoiceSelect(currentQuestion.id, option.id)}
                />
                <OptionText>
                  {typeof option.text === 'string' ? option.text : 
                   typeof option.text === 'object' ? JSON.stringify(option.text) : 
                   String(option.text || '')}
                </OptionText>
              </AnswerOption>
            ))}
          </AnswerOptions>
        );
        
      case 'SINGLE_CHOICE':
      default:
        return (
          <AnswerOptions>
            {(currentQuestion.options || []).map(option => (
              <AnswerOption 
                key={option.id || 'unknown'}
                selected={answers[currentQuestion.id] && answers[currentQuestion.id].id === option.id}
                theme={theme}
                onClick={() => handleSingleChoiceSelect(currentQuestion.id, option.id)}
              >
                <RadioInput 
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={answers[currentQuestion.id] && answers[currentQuestion.id].id === option.id}
                  onChange={() => {}}
                />
                <OptionText>
                  {typeof option.text === 'string' ? option.text : 
                   typeof option.text === 'object' ? JSON.stringify(option.text) : 
                   String(option.text || '')}
                </OptionText>
              </AnswerOption>
            ))}
          </AnswerOptions>
        );
    }
  };

  const handleResizeStart = (event) => {
    event.preventDefault();
    if (!questionContentRef.current) {
      setIsResizingPanels(true);
      return;
    }
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const rect = questionContentRef.current.getBoundingClientRect();
    const rawRatio = (clientX - rect.left) / rect.width;
    const clampedRatio = Math.min(0.75, Math.max(0.25, rawRatio));
    setPanelRatio(clampedRatio);
    setIsResizingPanels(true);
  };

  function getDisplayedQuestionNumber() {
    const examSessionId = studentExamId || localStorage.getItem('currentStudentExamId');
    const backendQuestionIndex = examSessionId ? localStorage.getItem(`exam_current_question_${examSessionId}`) : null;
    let questionNumber = currentQuestionIndex + 1;
    
    if (backendQuestionIndex !== null && !Number.isNaN(parseInt(backendQuestionIndex, 10))) {
      questionNumber = parseInt(backendQuestionIndex, 10) + 1;
    } else if (questions.length > 0 && currentQuestion) {
      const actualPosition = questions.findIndex(q => q.id === currentQuestion.id);
      if (actualPosition !== -1) {
        questionNumber = actualPosition + 1;
      }
    }
    
    return questionNumber;
  }

  function renderHeader(options = {}) {
    const { showSubmitButton = true } = options;
    const metaTag = getExamMetaTag();
    const totalCount = typeof totalQuestions === 'number' && totalQuestions > 0
      ? totalQuestions
      : questions.length;
    
    return (
      <Header>
        <ExamInfo>
          <ExamTitle>{getExamTitleText()}</ExamTitle>
          <ExamMetaRow>
            {metaTag && <span>{metaTag}</span>}
            {totalCount > 0 && <span>{totalCount} questions</span>}
          </ExamMetaRow>
        </ExamInfo>
        
        <TimerDisplay theme={theme}>
          {!isTimerHidden && (
            <TimerBubble theme={theme} $timeRunningOut={timeRunningOut}>
              {formatTime(timeRemaining)}
            </TimerBubble>
          )}
          <TimerToggleButton
            theme={theme}
            onClick={() => setIsTimerHidden(prev => !prev)}
          >
            {isTimerHidden ? 'Show' : 'Hide'}
          </TimerToggleButton>
        </TimerDisplay>
        
        <HeaderActions>
          {showSubmitButton && (
            <SubmitQuizButton theme={theme} onClick={handleSubmitExam}>
              Submit Exam
            </SubmitQuizButton>
          )}
          <UserProfile>
            <span>{getUserName()}</span>
            <UserAvatar theme={theme}>{getUserInitial()}</UserAvatar>
          </UserProfile>
        </HeaderActions>
      </Header>
    );
  }
  
  const footerNotice = infoMessage
    ? infoMessage
    : currentQuestion && isLastQuestion
      ? "You've reached the final question. Submit when you're ready."
      : '';
  // const questionProgressLabel = totalQuestionCount > 0 && displayedQuestionNumber > 0
  //   ? `Câu hỏi ${displayedQuestionNumber}/${totalQuestionCount}`
  //   : 'Tiến độ câu hỏi';
  const navigatorLabel = totalQuestionCount > 0
    ? `Question ${displayedQuestionNumber}/${totalQuestionCount}`
    : 'Question Navigator';
  const navigationDisabled = questionLoading || isNavigating || loading;
  const questionLookupById = new Map(fallbackQuestions.filter(Boolean).map(question => [question.id, question]));
  const questionStateItems = questionStates.length > 0
    ? questionStates.map((state, idx) => {
        const index = typeof state.index === 'number' ? state.index : idx;
        const question = state.questionId ? questionLookupById.get(state.questionId) : fallbackQuestions[index];
        const savedAnswer = state.questionId ? (answerCache[state.questionId] || '').trim() : '';
        const localAnswer = getAnswerPayload(question);
        const answeredFlag = state.answered !== undefined ? state.answered : undefined;
        return {
          questionId: state.questionId,
          index,
          answered: answeredFlag !== undefined ? Boolean(answeredFlag) : Boolean(savedAnswer || localAnswer),
          review: state.questionId ? Boolean(reviewFlags[state.questionId]) : false
        };
      })
    : fallbackQuestions.map((question, index) => {
        if (!question) {
          return {
            questionId: null,
            index,
            answered: false,
            review: false
          };
        }
        const savedAnswer = (answerCache[question.id] || '').trim();
        const localAnswer = getAnswerPayload(question);
        return {
          questionId: question.id,
          index,
          answered: Boolean(savedAnswer || localAnswer),
          review: Boolean(reviewFlags[question.id])
        };
      });
  const orderedQuestionStateItems = questionStateItems.slice().sort((a, b) => a.index - b.index);

  return (
    <PageContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      {renderHeader()}
      <SectionDivider theme={theme} />
      <MainContent>
        {currentQuestion ? (
          <QuizContent>
            <QuestionHeaderBar theme={theme}>
              <QuestionBadge>
                <QuestionCounter theme={theme}>
                  {displayedQuestionNumber}
                  {totalQuestionCount > 0 ? `/${totalQuestionCount}` : ''}
                </QuestionCounter>
                <div>
                  <QuestionLabel>Question {displayedQuestionNumber}</QuestionLabel>
                  {/* <QuestionMeta>
                    {isLastQuestion ? 'This is the last question of the exam.' : 'Answer the question to continue.'}
                  </QuestionMeta> */}
                </div>
              </QuestionBadge>
              <QuestionMeta>
                {currentQuestion.type === 'ESSAY'
                  ? 'Essay response'
                  : currentQuestion.type === 'MULTIPLE_CHOICE'
                    ? 'Select all that apply'
                    : 'Select one answer'}
                {currentQuestion?.id && (
                  <ReviewToggleButton
                    type="button"
                    theme={theme}
                    $active={currentQuestionReview}
                    onClick={() => toggleReviewFlag(currentQuestion.id)}
                    style={{ marginLeft: '1rem' }}
                  >
                    <span role="img" aria-label="review">🔖</span>
                    {currentQuestionReview ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại'}
                  </ReviewToggleButton>
                )}
              </QuestionMeta>
            </QuestionHeaderBar>
            
            <QuestionContent ref={questionContentRef}>
              <PromptPanel
                theme={theme}
                style={{
                  flexBasis: `${panelRatio * 100}%`,
                  maxWidth: `${panelRatio * 100}%`,
                  flexGrow: 0,
                  flexShrink: 0
                }}
              >
                <PromptScrollArea>
                  <QuestionText>
                    {currentQuestion.text || 'Loading question...'}
                  </QuestionText>
                  <QuestionImage theme={theme} hasImage={Boolean(currentQuestion.imageUrl)}>
                    {currentQuestion.imageUrl && (
                      <img src={currentQuestion.imageUrl} alt="Quiz question illustration" />
                    )}
                  </QuestionImage>
                </PromptScrollArea>
              </PromptPanel>

              <Resizer
                theme={theme}
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
              />
              
              <AnswerPanel
                theme={theme}
                style={{
                  flexBasis: `${(1 - panelRatio) * 100}%`,
                  maxWidth: `${(1 - panelRatio) * 100}%`,
                  flexGrow: 0,
                  flexShrink: 0
                }}
              >
                <AnswerScrollArea>
                  <Instructions>
                    Answer section
                  </Instructions>
                  {renderQuestionInput()}
                </AnswerScrollArea>
              </AnswerPanel>
            </QuestionContent>
          </QuizContent>
        ) : (
          <QuizContent>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading question data... If this takes too long, please refresh the page.</p>
            </div>
          </QuizContent>
        )}
      </MainContent>
      <BottomSection>
        <SectionDivider theme={theme} />
        <FooterContainer theme={theme}>
          <FooterUser>{getUserName()}</FooterUser>
          <FooterProgressGroup>
            {/* <FooterProgressPill theme={theme}>
              {questionProgressLabel}
            </FooterProgressPill> */}
            <NavigatorContainer>
              <FooterQuestionButton
                type="button"
                theme={theme}
                onClick={() => setIsNavigatorOpen(prev => !prev)}
              >
                {navigatorLabel}
              </FooterQuestionButton>
              {isNavigatorOpen && (
                <NavigatorPopover theme={theme}>
                  <PopoverHeader>
                    <span>Question List</span>
                    <button
                      type="button"
                      onClick={() => setIsNavigatorOpen(false)}
                      style={{ border: 'none', background: 'transparent', color: theme === 'dark' ? '#cfd2ff' : '#4a4f75', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Đóng
                    </button>
                  </PopoverHeader>
                  <Legend>
                    <LegendItem>
                      <StatusDot $variant="current" />
                      <span>Current</span>
                    </LegendItem>
                    <LegendItem>
                      <StatusDot $variant="answered" />
                      <span>Answered</span>
                    </LegendItem>
                    <LegendItem>
                      <StatusDot $variant="review" />
                      <span>For Review</span>
                    </LegendItem>
                    <LegendItem>
                      <StatusDot $variant="unanswered" />
                      <span>Unanswered</span>
                    </LegendItem>
                  </Legend>
                  <QuestionNavigation>
                    {orderedQuestionStateItems.map(item => (
                      <QuestionNavButton
                        key={`${item.questionId ?? 'q'}-${item.index}`}
                        theme={theme}
                        $current={item.index === currentQuestionIndex}
                        $answered={item.answered}
                        $review={item.review}
                        disabled={navigationDisabled}
                        onClick={() => navigateToQuestion(item.index)}
                      >
                        {item.index + 1}
                        {item.review && <ReviewBadge theme={theme} />}
                      </QuestionNavButton>
                    ))}
                  </QuestionNavigation>
                </NavigatorPopover>
              )}
            </NavigatorContainer>
            {footerNotice && (
              <FooterNotice theme={theme}>{footerNotice}</FooterNotice>
            )}
          </FooterProgressGroup>
        <FooterActions>
          <FooterActionButton
            theme={theme}
            disabled={isFirstQuestion || questionLoading || isNavigating}
            onClick={handlePreviousQuestion}
          >
            Quay lại
          </FooterActionButton>
          <FooterActionButton
            theme={theme}
            disabled={questionLoading || isNavigating}
            onClick={handleNextQuestion}
          >
            {isLastQuestion ? 'Nộp bài' : 'Tiếp theo'}
          </FooterActionButton>
        </FooterActions>
        </FooterContainer>
      </BottomSection>
      
      <ConfirmationModal
        isOpen={showSubmitConfirmation}
        onClose={() => setShowSubmitConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        message="Are you sure you want to submit Quiz?"
      />
    </PageContainer>
  );
}

export default TakeExamPage; 
