import React from 'react';
import styled from 'styled-components';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import chatHistoryService from '../../services/chatHistoryService';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (max-width: 768px) {
    background: rgba(0, 0, 0, 0.5);
  }
`;

const HistoryPanelContainer = styled.div`
  position: fixed;
  left: ${props => props.isOpen ? 'var(--sidebar-width, 240px)' : '-400px'};
  top: 0;
  width: 350px;
  height: 100vh;
  background: var(--bg-secondary, #ffffff);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));

  @media (max-width: 768px) {
    width: 85%;
    max-width: 350px;
    left: ${props => props.isOpen ? '0' : '-100%'};
  }
`;

const HistoryHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color, rgba(15, 23, 42, 0.08));
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-primary, #f8f9fa);
`;

const HistoryTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary, #1f1f1f);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary, #6f6f6f);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--hover-bg, rgba(106, 0, 255, 0.1));
    color: var(--text-primary, #1f1f1f);
  }
`;

const HistoryList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(106, 0, 255, 0.3);
    border-radius: 10px;

    &:hover {
      background: rgba(106, 0, 255, 0.5);
    }
  }
`;

const HistoryItem = styled.div`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  background: ${props => props.isActive 
    ? 'var(--hover-bg, rgba(106, 0, 255, 0.1))' 
    : 'transparent'};
  border: 1px solid ${props => props.isActive 
    ? 'var(--highlight-color, #6a00ff)' 
    : 'transparent'};
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: var(--hover-bg, rgba(106, 0, 255, 0.08));
  }
`;

const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const HistoryItemTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary, #1f1f1f);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0.5rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary, #6f6f6f);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease, color 0.2s ease;

  ${HistoryItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 0, 0, 0.1);
    color: #ff3e3e;
  }
`;

const HistoryItemMeta = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary, #6f6f6f);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MessageCount = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary, #6f6f6f);
  font-size: 0.9rem;
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ChatHistoryPanel = ({ 
  isOpen, 
  onClose, 
  currentConversationId,
  onSelectConversation,
  onDeleteConversation 
}) => {
  const [histories, setHistories] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      loadHistories();
    }
  }, [isOpen]);

  const loadHistories = async () => {
    setLoading(true);
    try {
      const allHistories = await chatHistoryService.getAllHistories(true);
      setHistories(allHistories);
    } catch (error) {
      console.error('Failed to load histories:', error);
      // Fallback to localStorage
      try {
        const allHistories = await chatHistoryService.getAllHistories(false);
        setHistories(allHistories);
      } catch (fallbackError) {
        console.error('Failed to load from localStorage:', fallbackError);
        setHistories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await chatHistoryService.deleteConversation(conversationId);
        await loadHistories();
        if (onDeleteConversation) {
          onDeleteConversation(conversationId);
        }
      } catch (error) {
        console.error('Failed to delete conversation:', error);
        alert('Failed to delete conversation. Please try again.');
      }
    }
  };

  const handleSelect = (conversationId) => {
    if (onSelectConversation) {
      onSelectConversation(conversationId);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <HistoryPanelContainer isOpen={isOpen}>
        <HistoryHeader>
          <HistoryTitle>
            <HistoryIcon style={{ fontSize: '1.25rem' }} />
            Chat History
          </HistoryTitle>
          <CloseButton onClick={onClose} aria-label="Close history">
            ×
          </CloseButton>
        </HistoryHeader>
      
      <HistoryList>
        {loading ? (
          <EmptyState>
            <p>Loading conversations...</p>
          </EmptyState>
        ) : histories.length === 0 ? (
          <EmptyState>
            <ChatBubbleOutlineIcon style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }} />
            <p>No conversation history yet</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Start a new conversation to see it here
            </p>
          </EmptyState>
        ) : (
          histories.map((history) => (
            <HistoryItem
              key={history.id}
              isActive={history.id === currentConversationId}
              onClick={() => handleSelect(history.id)}
            >
              <HistoryItemHeader>
                <HistoryItemTitle title={history.title}>
                  {history.title}
                </HistoryItemTitle>
                <DeleteButton
                  onClick={(e) => handleDelete(e, history.id)}
                  aria-label="Delete conversation"
                >
                  <DeleteIcon style={{ fontSize: '1rem' }} />
                </DeleteButton>
              </HistoryItemHeader>
              <HistoryItemMeta>
                <MessageCount>
                  <ChatBubbleOutlineIcon style={{ fontSize: '0.75rem' }} />
                  {history.messageCount} messages
                </MessageCount>
                <span>•</span>
                <span>{formatDate(history.updatedAt)}</span>
              </HistoryItemMeta>
            </HistoryItem>
          ))
        )}
      </HistoryList>
    </HistoryPanelContainer>
    </>
  );
};

export default ChatHistoryPanel;
