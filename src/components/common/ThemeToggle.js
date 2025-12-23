import React from 'react';
import styled from 'styled-components';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import { useTheme } from '../../contexts/ThemeContext';

const ToggleWrapper = styled.button`
  position: relative;
  width: 56px;
  height: 28px;
  border-radius: var(--radius-pill, 14px);
  border: none;
  background-color: ${({ isDark }) => (isDark ? '#2f3749' : '#e4e7ec')};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background-color 0.3s ease;
`;

const IconTrack = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  pointer-events: none;
  
  svg {
    font-size: 16px;
    color: #f9fafb;
    opacity: ${({ isDark }) => (isDark ? 0.5 : 1)};
  }
  
  svg:last-child {
    opacity: ${({ isDark }) => (isDark ? 1 : 0.5)};
  }
`;

const ToggleKnob = styled.span`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-round, 50%);
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.2);
  left: 2px;
  transform: ${({ isDark }) => (isDark ? 'translateX(28px)' : 'translateX(0)')};
  transition: transform 0.3s ease;
`;

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleWrapper
      type="button"
      aria-pressed={isDarkMode}
      isDark={isDarkMode}
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <IconTrack isDark={isDarkMode}>
        <LightModeOutlinedIcon />
        <DarkModeOutlinedIcon />
      </IconTrack>
      <ToggleKnob isDark={isDarkMode} />
    </ToggleWrapper>
  );
}

export default ThemeToggle;
