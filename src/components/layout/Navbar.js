import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { keyframes } from '@emotion/react';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as ScrollLink, scroller } from 'react-scroll';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import ResetPasswordModal from '../auth/ResetPasswordModal';
import logoImage from '../../assets/images/my_logo.png';

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
  const marqueePhrases = [
    'Your Knowledge, Our Commitment',
    'Exams Made Easy, From Anywhere',
    'Digital Exams, Real Results',
    'AI supported Instructional Excellence',
  ];
  const marqueeAnimation = keyframes`
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  `;

  return (
    <>
      <AppBar position="sticky" color="primary" sx={{ boxShadow: 'none' }}>
        <Box sx={{ width: '100%' }}>
          <Toolbar
            sx={{
              px: 0,
              height: { xs: 70, sm: 100 },
              minHeight: 'unset',
              justifyContent: 'flex-start',
              width: '100%',
              display: 'flex'
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                px: 0,
                flexShrink: 0,
              }}
            >
              <Box
                component="img"
                src={logoImage}
                alt="Brand logo"
                onClick={() => handleScrollClick('home', 'hero-section')}
                sx={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: '999px'
                }}
              />
            </Box>

            {/* Marquee */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                overflow: 'hidden',
                color: 'secondary.main',
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: 1.5,
                mx: 3,
                pointerEvents: 'none'
              }}
            >
              <Box
                component="span"
                sx={{
                  whiteSpace: 'nowrap',
                  animation: `${marqueeAnimation} 20s linear infinite`,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                {[0, 1].map((setIndex) => (
                  <Box
                    key={setIndex}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      mr: 6
                    }}
                  >
                    {marqueePhrases.map((phrase, idx) => (
                      <Box
                        key={`${setIndex}-${idx}`}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          mr: 6
                        }}
                      >
                        {/* <Box
                          component="img"
                          src={logoImage}
                          alt="Scrolling brand logo"
                          sx={{
                            height: 44,
                            width: 'auto',
                            objectFit: 'contain',
                            mr: 2,
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                          }}
                        /> */}
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            letterSpacing: 1.5,
                            textTransform: 'uppercase'
                          }}
                        >
                          {phrase}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>

            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                  sx={{ ml: 'auto', mr: 1 }}
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
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  ml: 'auto',
                  pr: { xs: 1, sm: 2 },
                  flexShrink: 0
                }}
              >
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
                        duration={200}
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
                    Register
                  </Button>
                </Box>
              </Box>
            )}
          </Toolbar>
        </Box>
      </AppBar>

      {/* Login Modal */}
      <LoginModal 
        show={showLoginModal} 
        handleClose={closeLoginModal} 
        onSwitchToRegister={openRegisterModal}
        onSwitchToResetPassword={openResetPasswordModal}
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
