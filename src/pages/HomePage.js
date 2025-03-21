import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/sections/HeroSection';
import ExamCategoriesSection from '../components/sections/ExamCategoriesSection';
import ExploreSection from '../components/sections/ExploreSection';
import CtaSection from '../components/sections/CtaSection';

const HomePage = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <HeroSection />
      <ExamCategoriesSection />
      <ExploreSection />
      <CtaSection />
    </Box>
  );
};

export default HomePage; 