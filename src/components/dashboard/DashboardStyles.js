import { Link } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';

export const ThemeStyles = createGlobalStyle`
  .light-theme {
    --bg-primary: #f8f9fa;
    --bg-secondary: #ffffff;
    --bg-sidebar: #6a00ff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #eeeeee;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    --highlight-color: #6a00ff;
  }
  
  .dark-theme {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2a2a2a;
    --bg-sidebar: #3a3a3a;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #444444;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    --highlight-color: #8d47ff;
  }
`;

export const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
`;

export const Sidebar = styled.aside`
  width: 180px;
  background-color: ${props => props.theme === 'dark' ? 'var(--bg-sidebar)' : '#6a00ff'};
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  border-radius: 0 20px 20px 0;
  transition: background-color 0.3s ease;
`;

export const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: "⦿⦿⦿";
    letter-spacing: 2px;
    font-size: 10px;
    margin-right: 8px;
    color: white;
  }
`;

export const SidebarMenu = styled.div`
  flex: 1;
  margin-top: 1rem;
`;

export const NavItem = styled(Link)`
  padding: 0.75rem 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
  text-decoration: none;
  font-size: 0.9rem;
  
  &.active {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: white;
  }
`;

export const NavIcon = styled.span`
  margin-right: 12px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  opacity: 0.9;
`;

export const BottomMenu = styled.div`
  margin-bottom: 2rem;
`;

export const MainContent = styled.main`
  flex: 1;
  margin-left: 180px;
  padding: 2rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

export const NotificationIcon = styled.div`
  width: 24px;
  height: 24px;
  position: relative;
  cursor: pointer;
  
  &::before {
    content: '🔔';
    font-size: 18px;
  }
`;

export const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #6a00ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
`;

export const DropdownContainer = styled.div`
  position: relative;
`;

export const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  width: 180px;
  z-index: 100;
  overflow: hidden;
`;

export const DropdownItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: var(--bg-primary);
  }
`;

export const PageTitle = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    color: var(--text-primary);
  }
  
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
`;

export const SortDropdown = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
  color: #666;
  cursor: pointer;
  outline: none;
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => (props.wrap === false ? 'nowrap' : 'wrap')};
  gap: 1.5rem;
  margin-bottom: ${props => props.marginBottom || '0'};
`;

export const CardRow = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

export const Card = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  flex: 1;
  min-width: ${props => props.minWidth || '280px'};
  position: relative;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
`;

export const CardHeader = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
`;

export const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: ${props => props.color || 'var(--text-primary)'};
`;

export const ChartContainer = styled.div`
  height: 120px;
  margin-top: 1rem;
`;

export const StatButton = styled.div`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
    transform: scale(1.1);
  }
  
  &::before {
    content: '📊';
    font-size: 14px;
    opacity: 0.8;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const ModalContainer = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1.25rem;
  width: 85%;
  max-width: 1000px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--card-shadow);
  padding: 1.75rem;
  transform: translateY(20px);
  animation: slideUp 0.3s forwards;
  transition: background-color 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0.8; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #b8b8b8;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--highlight-color);
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

export const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin: 0;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
`;

export const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
  
  &:first-child {
    border-top-left-radius: 0.5rem;
  }
  
  &:last-child {
    border-top-right-radius: 0.5rem;
  }
`;

export const TableRow = styled.tr`
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-primary)'};
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

export const TableCell = styled.td`
  padding: 1rem;
  color: var(--text-primary);
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border-color);
`;

export const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

export const PageInfo = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

export const PageButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const PageButton = styled.button`
  background-color: ${props => props.active ? '#6a00ff' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid ${props => props.active ? '#6a00ff' : '#ddd'};
  border-radius: 0.25rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover {
    background-color: ${props => props.active ? '#6a00ff' : '#f5f5f5'};
  }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #6a00ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ff3e3e;
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const DataCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  border-top: 4px solid 
    ${props => {
      switch(props.type) {
        case 'exam': return '#6a00ff';
        case 'class': return '#ff2e8e';
        default: return 'var(--highlight-color)';
      }
    }};
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

export const CardInfo = styled.div`
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  
  strong {
    color: var(--text-primary);
    margin-right: 0.5rem;
  }
`;

export const CardActions = styled.div`
  margin-top: 1rem;
`;

export const ActionButton = styled.button`
  background-color: var(--highlight-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #7b24ff;
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background-color: ${props => {
    switch (props.status) {
      case 'ACTIVE':
      case 'ONGOING':
        return '#28a745';
      case 'INACTIVE':
      case 'COMPLETED':
        return '#6c757d';
      case 'PENDING':
      case 'SCHEDULED':
        return '#ffc107';
      default:
        return '#6a00ff';
    }
  }};
`;

export const SkeletonCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
  flex: 1;
  min-width: 250px;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { opacity: 0.7; }
    50% { opacity: 1; }
    100% { opacity: 0.7; }
  }
`;

export const SkeletonLine = styled.div`
  height: 12px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.08);
  margin-bottom: 0.75rem;
  width: ${props => props.width || '100%'};
`;

export const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 0;
    display: none;
  }
`;

export const TabButton = styled.button`
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: ${props => props.active ? 'var(--highlight-color)' : 'var(--text-secondary)'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  cursor: pointer;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active ? 'var(--highlight-color)' : 'transparent'};
  }
  
  &:hover {
    color: var(--highlight-color);
  }
`;

export const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
`;

export const ViewToggleButton = styled.button`
  background-color: ${props => props.active ? 'var(--highlight-color)' : 'var(--bg-secondary)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  span {
    margin-right: 0.25rem;
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--highlight-color)' : 'var(--bg-primary)'};
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #eee;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  gap: 0.75rem;
`;

export const SearchIcon = styled.div`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
`;

export const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 0.9rem;
  background: transparent;
  color: var(--text-primary);
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;
