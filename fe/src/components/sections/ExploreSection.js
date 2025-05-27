import React from 'react';
import { Box, Container, Typography, Grid, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { NEUTRAL, THEME } from '../../theme/colors';

// Import subject icons
import mathIcon from '../../assets/subject-icons/math.svg';
import englishIcon from '../../assets/subject-icons/english.svg';
import scienceIcon from '../../assets/subject-icons/science.svg';
import physicsIcon from '../../assets/subject-icons/physics.svg';
import generalIcon from '../../assets/subject-icons/general.svg';

// Subject card component
const SubjectCard = ({ title, description, iconSrc, bgcolor = NEUTRAL.color200 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        bgcolor: bgcolor,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
        }
      }}
    >
      <Box 
        component="img"
        src={iconSrc}
        alt={title}
        sx={{ 
          width: 50, 
          height: 50, 
          mb: 2,
          objectFit: 'contain'
        }}
      />
      <Typography 
        variant="h6" 
        component="h3" 
        sx={{ 
          fontWeight: 600, 
          mb: 1,
          color: THEME.text.primary
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontSize: '0.875rem',
          lineHeight: 1.5 
        }}
      >
        {description}
      </Typography>
    </Paper>
  </motion.div>
);

const ExploreSection = () => {
  // Subject data with descriptions from the image
  const subjects = [
    {
      title: 'Math',
      description: 'Sky was cloudless and of a deep dark blue spectacle before us was indeed.',
      iconSrc: mathIcon, 
      bgcolor: '#FDF2E9' // Light beige for Math
    },
    {
      title: 'English',
      description: 'Even the all-powerful Pointing has no control about the blind texts.',
      iconSrc: englishIcon,
      bgcolor: '#EBF5FB' // Light blue for English
    },
    {
      title: 'Science',
      description: 'Unorthographic life One day however a small line of blind text.',
      iconSrc: scienceIcon,
      bgcolor: '#F4ECF7' // Light purple for Science
    },
    {
      title: 'Physics',
      description: 'However a small line of blind text by the name.',
      iconSrc: physicsIcon, 
      bgcolor: '#FEF9E7' // Light yellow for Physics
    },
    {
      title: 'General Knowledge',
      description: 'Text by the name of Lorem Ipsum decided to leave for the far World of Grammar.',
      iconSrc: generalIcon,
      bgcolor: '#E8F8F5' // Light mint for General Knowledge
    }
  ];

  return (
    <Box id="explore-section" sx={{ py: 8, bgcolor: THEME.background }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mb: 6,
          textAlign: 'center'
        }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#004D40', // Dark teal color matching the image
              mb: 3
            }}
          >
            Explore Our Exam
          </Typography>
          
          <Button 
            variant="outlined" 
            sx={{ 
              borderColor: '#E0E0E0',
              color: THEME.text.primary,
              fontSize: '0.75rem',
              px: 3,
              py: 0.5,
              borderRadius: 1,
              '&:hover': {
                borderColor: '#BDBDBD',
                bgcolor: 'rgba(0,0,0,0.01)'
              }
            }}
          >
            EXPLORE ALL
          </Button>
        </Box>

        {/* Cards Grid - Adjusted to match the image layout */}
        <Grid container spacing={3}>
          {/* Math - Larger card on the left */}
          <Grid item xs={12} sm={6} md={4}>
            <SubjectCard {...subjects[0]} />
          </Grid>
          
          {/* English - Larger card on the right */}
          <Grid item xs={12} sm={6} md={8}>
            <SubjectCard {...subjects[1]} />
          </Grid>
          
          {/* Science - Left side on second row */}
          <Grid item xs={12} sm={6} md={4}>
            <SubjectCard {...subjects[2]} />
          </Grid>
          
          {/* Physics - Middle-right on second row */}
          <Grid item xs={12} sm={6} md={4}>
            <SubjectCard {...subjects[3]} />
          </Grid>
          
          {/* General Knowledge - Far right on second row */}
          <Grid item xs={12} sm={6} md={4}>
            <SubjectCard {...subjects[4]} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ExploreSection; 