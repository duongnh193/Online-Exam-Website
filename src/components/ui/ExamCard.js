import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const ExamCard = ({ 
  title, 
  imageSrc, 
  bgColor, 
  textColor = '#404D61', 
  position = {},
  delay = 0
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        ...position,
        zIndex: 1,
        '@media (max-width: 900px)': {
          position: 'relative',
          left: 'auto',
          right: 'auto',
          top: 'auto',
          mb: 4
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay }}
      >
        <Paper
          elevation={4}
          sx={{
            width: { xs: 260, md: 280 },
            height: { xs: 340, md: 380 },
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: bgColor,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 3,
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <Box
            component="img"
            src={imageSrc}
            alt={title}
            sx={{
              width: 180,
              height: 180,
              objectFit: 'contain',
              display: 'block',
              mx: 'auto',
              mt: 2
            }}
          />
          <Typography 
            variant="h5" 
            component="h3" 
            sx={{ 
              fontWeight: 700, 
              color: textColor,
              mt: 3,
              textAlign: 'center'
            }}
          >
            {title}
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default ExamCard; 