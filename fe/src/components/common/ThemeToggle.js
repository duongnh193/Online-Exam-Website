import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

const ToggleButton = styled.div`
  position: relative;
  width: 56px;
  height: 28px;
  border-radius: 14px;
  background-color: ${props => props.isDark ? '#333' : '#e1e1e1'};
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 4px;
  box-sizing: border-box;
  transition: background-color 0.3s;
  
  &::before {
    content: ${props => props.isDark ? '"🌙"' : '"☀️"'};
    position: absolute;
    font-size: 16px;
    left: ${props => props.isDark ? 'auto' : '6px'};
    right: ${props => props.isDark ? '6px' : 'auto'};
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transform: translateX(${props => props.isDark ? '24px' : '0'});
    transition: transform 0.3s;
  }
`;

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <ToggleButton 
      isDark={isDarkMode} 
      onClick={toggleTheme} 
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    />
  );
}

export default ThemeToggle; 