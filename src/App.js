import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Paper, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import SecurityIcon from '@mui/icons-material/Security';
import { THEME, NEUTRAL } from './theme/colors';
import './App.css';

// Create a white theme
const theme = createTheme({
  palette: {
    primary: {
      main: THEME.background, // White for AppBar
      contrastText: THEME.text.primary, // Dark text for contrast on white
    },
    secondary: {
      main: THEME.primary, // Purple for buttons and accents
    },
    background: {
      default: THEME.background,
      paper: THEME.background,
    },
    text: {
      primary: THEME.text.primary,
      secondary: THEME.text.secondary,
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: THEME.text.primary,
    },
    h2: {
      fontWeight: 600,
      color: THEME.text.primary,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)',
          borderBottom: `1px solid ${THEME.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedSecondary: {
          color: THEME.background,
          '&:hover': {
            backgroundColor: NEUTRAL.color800,
          },
        },
        outlinedSecondary: {
          borderColor: THEME.primary,
          color: THEME.primary,
          '&:hover': {
            borderColor: NEUTRAL.color800,
            color: NEUTRAL.color800,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: THEME.background,
          borderColor: THEME.border,
        },
      },
    },
  },
});

function App() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    handleClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ overflowX: 'hidden' }}>
        {/* Navigation Bar */}
        <AppBar position="sticky" color="primary">
          <Container maxWidth="lg">
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        bgcolor: 'secondary.main',
                        mx: '1px'
                      }} 
                    />
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        bgcolor: 'secondary.main',
                        mx: '1px'
                      }} 
                    />
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        bgcolor: 'secondary.main',
                        mx: '1px'
                      }} 
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        bgcolor: 'secondary.main',
                        mx: '1px'
                      }} 
                    />
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        bgcolor: 'secondary.main',
                        mx: '1px'
                      }} 
                    />
                    <Box 
                      sx={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        bgcolor: 'secondary.main',
                        mx: '1px'
                      }} 
                    />
                  </Box>
                </Box>
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: 'secondary.main',
                    ml: 1,
                    fontSize: '1.5rem'
                  }}
                >
                  logo
                </Typography>
              </Box>
              
              {isMobile ? (
                <>
                  <IconButton
                    size="large"
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleMenu}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => handleTabChange('home')}>Home</MenuItem>
                    <MenuItem onClick={() => handleTabChange('about')}>About</MenuItem>
                    <MenuItem onClick={() => handleTabChange('resources')}>Resources</MenuItem>
                    <MenuItem onClick={() => handleTabChange('contact')}>Contact</MenuItem>
                    <MenuItem>
                      <Button 
                        variant="outlined"
                        color="secondary"
                        fullWidth
                      >
                        Login
                      </Button>
                    </MenuItem>
                    <MenuItem>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        fullWidth
                      >
                        Get started
                      </Button>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {/* Navigation Links */}
                  <Box sx={{ display: 'flex', mr: 4 }}>
                    {[
                      { name: 'Home', value: 'home' },
                      { name: 'About', value: 'about' },
                      { name: 'Resources', value: 'resources' },
                      { name: 'Contact', value: 'contact' }
                    ].map((item) => (
                      <Box 
                        key={item.value}
                        sx={{ 
                          position: 'relative',
                          mx: 2
                        }}
                      >
                        <Button 
                          color="inherit" 
                          onClick={() => handleTabChange(item.value)}
                          sx={{ 
                            color: activeTab === item.value ? 'secondary.main' : 'text.primary',
                            fontWeight: 500
                          }}
                        >
                          {item.name}
                        </Button>
                        {activeTab === item.value && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '2px', 
                              bgcolor: 'secondary.main',
                              borderRadius: '2px'
                            }} 
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                  
                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      sx={{ 
                        mr: 3,
                        borderRadius: '20px',
                        px: 3
                      }}
                    >
                      Login
                    </Button>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      sx={{ 
                        borderRadius: '20px',
                        px: 3
                      }}
                    >
                      Get started
                    </Button>
                  </Box>
                </Box>
              )}
            </Toolbar>
          </Container>
        </AppBar>

        {/* Hero Section - Updated to match the design */}
        <Box
          sx={{
            bgcolor: 'background.default',
            color: 'text.primary',
            py: { xs: 6, md: 10 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
                    src={require('./assets/Bitmap-3.png')}
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

        {/* Exam Categories Section */}
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
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 'calc(50% - 280px)', md: 'calc(50% - 550px)' },
                  top: { xs: 0, md: 250 },
                  zIndex: 1,
                  '@media (max-width: 1200px)': {
                    left: 'calc(50% - 430px)',
                  },
                  '@media (max-width: 900px)': {
                    position: 'relative',
                    left: 'auto',
                    top: 'auto',
                    mb: 4
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      width: { xs: 260, md: 280 },
                      height: { xs: 340, md: 380 },
                      borderRadius: 4,
                      overflow: 'hidden',
                      bgcolor: NEUTRAL.color400,
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
                      src={require('./assets/Bitmap-1.png')}
                      alt="Primary Exam"
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
                        color: THEME.text.primary,
                        mt: 3,
                        textAlign: 'center'
                      }}
                    >
                      Primary Exam
                    </Typography>
                  </Paper>
                </motion.div>
              </Box>

              {/* Bank Exam Card - Center position (middle height) */}
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 'calc(50% - 140px)', md: 'calc(50% - 140px)' },
                  top: { xs: 360, md: 60 },
                  zIndex: 2,
                  '@media (max-width: 900px)': {
                    position: 'relative',
                    left: 'auto',
                    top: 'auto',
                    mb: 4
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      width: { xs: 260, md: 280 },
                      height: { xs: 340, md: 380 },
                      borderRadius: 4,
                      overflow: 'hidden',
                      bgcolor: '#0D2A3E',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 3,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={require('./assets/Bitmap-2.png')}
                      alt="Bank Exam"
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
                        color: 'white',
                        mt: 3,
                        textAlign: 'center'
                      }}
                    >
                      Bank Exam
                    </Typography>
                  </Paper>
                </motion.div>
              </Box>

              {/* NSI Exam Card - Right position (highest) */}
              <Box
                sx={{
                  position: 'absolute',
                  right: { xs: 'calc(50% - 280px)', md: 'calc(50% - 550px)' },
                  top: { xs: 720, md: -130 },
                  zIndex: 1,
                  '@media (max-width: 1200px)': {
                    right: 'calc(50% - 430px)',
                  },
                  '@media (max-width: 900px)': {
                    position: 'relative',
                    right: 'auto',
                    top: 'auto'
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      width: { xs: 260, md: 280 },
                      height: { xs: 340, md: 380 },
                      borderRadius: 4,
                      overflow: 'hidden',
                      bgcolor: '#FCE9D9',
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
                      src={require('./assets/Bitmap.png')}
                      alt="NSI Exam"
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
                        color: THEME.text.primary,
                        mt: 3,
                        textAlign: 'center'
                      }}
                    >
                      NSI Exam
                    </Typography>
                  </Paper>
                </motion.div>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, color: 'text.primary' }}
          >
            Why Choose Us?
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <SchoolIcon sx={{ fontSize: 40 }} />,
                title: 'Flexible Learning',
                description: 'Access your exams from any device, at any time.',
              },
              {
                icon: <TimerIcon sx={{ fontSize: 40 }} />,
                title: 'Time Management',
                description: 'Efficient exam scheduling and time tracking features.',
              },
              {
                icon: <SecurityIcon sx={{ fontSize: 40 }} />,
                title: 'Secure Platform',
                description: 'Advanced security measures to ensure exam integrity.',
              },
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <Box sx={{ color: 'secondary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" align="center">
                      {feature.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* CTA Section */}
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
