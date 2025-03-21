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

const Navbar = () => {
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
  );
};

export default Navbar; 