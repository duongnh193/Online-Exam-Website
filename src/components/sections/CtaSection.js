import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';

const CtaSection = () => {
  return (
    <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(45deg, #f8f9fa 30%, #ffffff 90%)',
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom color="text.primary">
            Ready to Start?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }} color="text.secondary">
            Join thousands of students who trust our platform for their online exams
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mr: 2 }}
          >
            Sign Up Now
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
          >
            Contact Us
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default CtaSection; 