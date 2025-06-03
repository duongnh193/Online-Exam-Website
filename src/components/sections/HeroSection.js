import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import heroImage from '../../assets/images/Bitmap-3.png';

const HeroSection = () => {
  return (
    <Box id="hero-section" sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Take Online<br />Exam.
              </Typography>
              
              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  component="p"
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  NUMBER OF ACTIVE USERS RIGHT NOW
                </Typography>
                <Typography 
                  variant="h4" 
                  component="p"
                  sx={{ 
                    color: 'secondary.main',
                    fontWeight: 700,
                    mt: 0.5
                  }}
                >
                  200+
                </Typography>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Box
                component="img"
                src={heroImage}
                alt="Online Exam Platform"
                sx={{
                  width: '100%',
                  maxWidth: 420,
                  display: 'block',
                  margin: 'auto',
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection; 