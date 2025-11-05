import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import ThemeToggle from '../components/common/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationModal from '../components/common/ConfirmationModal';
import ChatbotWidget from '../components/common/ChatbotWidget';
import {
  ThemeStyles,
  DashboardContainer,
  Sidebar,
  Logo,
  SidebarMenu,
  NavItem,
  NavIcon,
  BottomMenu,
  MainContent,
  Header,
  HeaderRight,
  NotificationIcon,
  UserAvatar,
  DropdownContainer,
  Dropdown,
  DropdownItem,
  PageTitle,
} from '../components/dashboard/DashboardStyles';

const lecturerNavItems = [
  { to: '/lecturer-dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/exams', label: 'Exams', icon: '📝' },
  { to: '/class', label: 'Class', icon: '📋' },
  { to: '/reports', label: 'Reports', icon: '📊' },
  { to: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
];

const studentNavItems = [
  { to: '/student-dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/exams', label: 'Exams', icon: '📝' },
  { to: '/results', label: 'Results', icon: '📊' },
  { to: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
];

function AIAssistantPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);

  const isLecturer = user?.role === 'ROLE_LECTURER';
  const assistantRole = isLecturer ? 'lecturer' : 'student';
  const navigationItems = isLecturer ? lecturerNavItems : studentNavItems;

  useEffect(() => {
    if (user) {
      const enabled = authService.is2FAEnabled();
      setTwoFactorEnabled(enabled);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
    setShowDropdown(false);
    localStorage.removeItem('theme');
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
  };

  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      return `${firstName} ${lastName}`.trim() || user.username || 'User';
    }
    return 'User';
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handle2FAToggle = async () => {
    if (!user?.id) {
      alert('User information not available');
      return;
    }

    try {
      setUpdating2FA(true);
      const nextState = !twoFactorEnabled;

      if (nextState) {
        await authService.enable2FA();
      } else {
        await authService.disable2FA();
      }

      setTwoFactorEnabled(nextState);
      alert(`Two-factor authentication has been ${nextState ? 'enabled' : 'disabled'}`);
      setShowDropdown(false);
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || 'Failed to update two-factor authentication'}`);
    } finally {
      setUpdating2FA(false);
    }
  };

  const goToSettings = () => {
    navigate('/settings');
    setShowDropdown(false);
  };

  const isRouteActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      <ThemeStyles />
      <DashboardContainer className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        <Sidebar theme={theme}>
          <Logo>logo</Logo>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                className={isRouteActive(item.to) ? 'active' : ''}
              >
                <NavIcon>{item.icon}</NavIcon>
                {item.label}
              </NavItem>
            ))}
          </SidebarMenu>
          <BottomMenu>
            <NavItem
              to="/settings"
              className={isRouteActive('/settings') ? 'active' : ''}
            >
              <NavIcon>⚙️</NavIcon>
              Settings
            </NavItem>
            <NavItem
              to="#"
              onClick={(event) => {
                event.preventDefault();
                handleLogout();
              }}
            >
              <NavIcon>🚪</NavIcon>
              Sign out
            </NavItem>
          </BottomMenu>
        </Sidebar>

        <MainContent>
          <Header>
            <PageTitle>
              <h1>AI Assistant</h1>
              <p>Hi, {getFullName()}!</p>
            </PageTitle>

            <HeaderRight>
              <ThemeToggle />
              <NotificationIcon />
              <DropdownContainer ref={dropdownRef}>
                <UserAvatar onClick={toggleDropdown}>{getUserInitial()}</UserAvatar>
                {showDropdown && (
                  <Dropdown>
                    <DropdownItem onClick={goToSettings}>
                      <span>👤</span> Profile
                    </DropdownItem>
                    <DropdownItem onClick={goToSettings}>
                      <span>⚙️</span> Settings
                    </DropdownItem>
                    <DropdownItem onClick={handle2FAToggle} disabled={updating2FA}>
                      <span>{twoFactorEnabled ? '🔒' : '🔓'}</span>
                      {updating2FA ? 'Updating...' : (twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                    </DropdownItem>
                    <DropdownItem onClick={handleLogout}>
                      <span>🚪</span> Sign out
                    </DropdownItem>
                  </Dropdown>
                )}
              </DropdownContainer>
            </HeaderRight>
          </Header>

          <ChatbotWidget userRole={assistantRole} user={user} />
        </MainContent>

        <ConfirmationModal
          isOpen={showLogoutConfirmation}
          onClose={() => setShowLogoutConfirmation(false)}
          onConfirm={handleConfirmLogout}
          message="Are you sure you want to logout?"
        />
      </DashboardContainer>
    </>
  );
}

export default AIAssistantPage;
