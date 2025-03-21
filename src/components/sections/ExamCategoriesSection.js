import React from 'react';
import { Box, Container } from '@mui/material';
import ExamCard from '../ui/ExamCard';
import { NEUTRAL, ADDITIONAL } from '../../theme/colors';
import primaryExamImage from '../../assets/images/Bitmap-1.png';
import bankExamImage from '../../assets/images/Bitmap-2.png';
import nsiExamImage from '../../assets/images/Bitmap.png';

const ExamCategoriesSection = () => {
  return (
    <Box
      sx={{
        bgcolor: 'secondary.main',
        color: 'white',
        py: { xs: 6, md: 10 },
        position: 'relative',
        mt: { xs: 0, md: -5 }, // Negative margin to overlap with the section above
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            position: 'relative',
            mt: { xs: 2, md: 8 },
            minHeight: { xs: 1100, md: 400 }
          }}
        >
          {/* Primary Exam Card - Left position (lowest) */}
          <ExamCard 
            title="Primary Exam"
            imageSrc={primaryExamImage}
            bgColor={NEUTRAL.color400}
            position={{
              left: { xs: 'calc(50% - 280px)', md: 'calc(50% - 550px)' },
              top: { xs: 0, md: 250 },
              '@media (max-width: 1200px)': {
                left: 'calc(50% - 430px)',
              }
            }}
            delay={0.1}
          />

          {/* Bank Exam Card - Center position (middle height) */}
          <ExamCard 
            title="Bank Exam"
            imageSrc={bankExamImage}
            bgColor={NEUTRAL.color1000}
            textColor="white"
            position={{
              left: { xs: 'calc(50% - 140px)', md: 'calc(50% - 140px)' },
              top: { xs: 360, md: 60 },
              zIndex: 2
            }}
            delay={0.2}
          />

          {/* NSI Exam Card - Right position (highest) */}
          <ExamCard 
            title="NSI Exam"
            imageSrc={nsiExamImage}
            bgColor={ADDITIONAL.beige}
            position={{
              right: { xs: 'calc(50% - 280px)', md: 'calc(50% - 550px)' },
              top: { xs: 720, md: -130 },
              '@media (max-width: 1200px)': {
                right: 'calc(50% - 430px)',
              }
            }}
            delay={0.3}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default ExamCategoriesSection; 