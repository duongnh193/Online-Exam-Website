import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/sections/HeroSection';
import ExamCategoriesSection from '../components/sections/ExamCategoriesSection';
import ExploreSection from '../components/sections/ExploreSection';
import ContactSection from '../components/sections/ContactSection';
import ResourceSection from '../components/sections/ResourceSection';

const HomePage = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <HeroSection />
      <ExamCategoriesSection />
      <ExploreSection />
      <ContactSection />
      <ResourceSection />
    </Box>
  );
};

export default HomePage; 