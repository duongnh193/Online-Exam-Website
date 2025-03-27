import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '../components/sections/HeroSection';
import ExamCategoriesSection from '../components/sections/ExamCategoriesSection';
import ExploreSection from '../components/sections/ExploreSection';
import ContactSection from '../components/sections/ContactSection';
import ResourceSection from '../components/sections/ResourceSection';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <HeroSection />
      <ExamCategoriesSection />
      <ExploreSection />
      <ContactSection />
      <ResourceSection />
      <Footer />
    </Box>
  );
};

export default HomePage; 