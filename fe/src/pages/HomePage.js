import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/sections/HeroSection';
import ExamCategoriesSection from '../components/sections/ExamCategoriesSection';
import ExploreSection from '../components/sections/ExploreSection';
import ContactSection from '../components/sections/ContactSection';
import ResourceSection from '../components/sections/ResourceSection';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import styled from 'styled-components';

const ThemeToggleContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const HomePage = () => {
  const { theme } = useTheme();
  
  return (
    <Box 
      sx={{ 
        overflowX: 'hidden',
        bgcolor: theme === 'dark' ? 'var(--bg-primary)' : 'background.default',
        color: theme === 'dark' ? 'var(--text-primary)' : 'text.primary',
      }}
      className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
    >
      <ThemeToggleContainer>
        <ThemeToggle />
      </ThemeToggleContainer>
      <HeroSection />
      <ExamCategoriesSection />
      <ExploreSection />
      <ContactSection />
      <ResourceSection />
    </Box>
  );
};

export default HomePage; 