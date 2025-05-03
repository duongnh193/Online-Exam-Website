import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as ScrollLink, scroller } from 'react-scroll';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import ResetPasswordModal from '../auth/ResetPasswordModal';

const Navbar = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  
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

  const handleScrollClick = (tab, target) => {
    setActiveTab(tab);
    // Close menu immediately for better responsiveness
    handleClose();
    
    // Use scroller for immediate effect
    setTimeout(() => {
      scroller.scrollTo(target, {
        smooth: true,
        offset: -60,
        duration: 300
      });
    }, 10);
  };

  const openLoginModal = () => {
    handleClose();
    setShowRegisterModal(false);
    setShowResetPasswordModal(false);
    setShowLoginModal(true);
  };

  const openRegisterModal = () => {
    handleClose();
    setShowLoginModal(false);
    setShowResetPasswordModal(false);
    setShowRegisterModal(true);
  };

  const openResetPasswordModal = () => {
    handleClose();
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowResetPasswordModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const closeResetPasswordModal = () => {
    setShowResetPasswordModal(false);
  };

  const navItems = [
    { name: 'Home', value: 'home', target: 'hero-section' },
    { name: 'About', value: 'about', target: 'explore-section' },
    { name: 'Exam', value: 'exam', target: 'exam-categories-section' },
    { name: 'Contact', value: 'contact', target: 'contact-section' },
    { name: 'Resource', value: 'resource', target: 'resource-section' }
  ];

  return (
    <>
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
                  {navItems.map((item) => (
                    <MenuItem 
                      key={item.value} 
                      onClick={() => handleScrollClick(item.value, item.target)}
                    >
                      <span style={{ width: '100%' }}>
                        {item.name}
                      </span>
                    </MenuItem>
                  ))}
                  <MenuItem>
                    <Button 
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      onClick={openLoginModal}
                    >
                      Login
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      fullWidth
                      onClick={openRegisterModal}
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
                  {navItems.map((item) => (
                    <Box 
                      key={item.value}
                      sx={{ 
                        position: 'relative',
                        mx: 2
                      }}
                    >
                      <ScrollLink
                        to={item.target}
                        spy={true}
                        smooth={true}
                        offset={-60}
                        duration={300}
                        onSetActive={() => setActiveTab(item.value)}
                      >
                        <Button 
                          color="inherit" 
                          sx={{ 
                            color: activeTab === item.value ? 'secondary.main' : 'text.primary',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          {item.name}
                        </Button>
                      </ScrollLink>
                      {activeTab === item.value && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '2px', 
                            bgcolor: 'secondary.main',
                            borderRadius: '8px'
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
                    onClick={openLoginModal}
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
                    onClick={openRegisterModal}
                  >
                    Get started
                  </Button>
                </Box>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Login Modal */}
      <LoginModal 
        show={showLoginModal} 
        handleClose={closeLoginModal} 
        onSwitchToRegister={openRegisterModal}
        onSwitchToLogin={openLoginModal}
      />

      {/* Register Modal */}
      <RegisterModal 
        show={showRegisterModal} 
        handleClose={closeRegisterModal} 
        onSwitchToLogin={openLoginModal}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal 
        show={showResetPasswordModal}
        handleClose={closeResetPasswordModal}
        onSwitchToLogin={openLoginModal}
      />
    </>
  );
};

export default Navbar; 