import React, { useEffect, useState, useContext, useRef } from 'react';
import AllInOne from '../../../complexOne';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

const StaffChat = () => {
  const { userId, restaurantDetails } = useContext(AllInOne);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async (showLoader = false) => {
    if (!userId) return;
    if (showLoader) {
      setLoading(true);
    }
    try {
      const res = await fetch(`http://localhost:8000/restaurant_messages/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setMessages([]);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || !userId) return;
    setSending(true);
    try {
      const payload = {
        id: uuidv4(),
        restaurant_id: userId,
        sender_id: userId,
        sender_role: 'admin',
        sender_name: restaurantDetails ? restaurantDetails.name : 'Admin',
        message: input.trim(),
      };
      const res = await fetch('http://localhost:8000/restaurant_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setInput('');
        fetchMessages(false);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="staff-chat-container">
      <div className="staff-chat-header">
        <h2>Team Chat</h2>
        <p>Talk with your waiters about important updates.</p>
      </div>
      <div className="staff-chat-messages">
        {loading ? (
          <p className="staff-chat-info">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="staff-chat-info">No messages yet. Start the conversation!</p>
        ) : (
          <ul>
            {(() => {
              let lastDateKey = null;
              const sortedMessages = [...messages].sort((a, b) => {
                const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                return aTime - bTime; // oldest first, newest last
              });

              return sortedMessages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin';
                const msgDate = msg.created_at ? new Date(msg.created_at) : null;
                const dateKey = msgDate ? msgDate.toDateString() : null;

                let dateLabel = null;
                if (dateKey && dateKey !== lastDateKey) {
                  const today = new Date();
                  const yesterday = new Date();
                  yesterday.setDate(today.getDate() - 1);

                  if (dateKey === today.toDateString()) {
                    dateLabel = 'Today';
                  } else if (dateKey === yesterday.toDateString()) {
                    dateLabel = 'Yesterday';
                  } else {
                    dateLabel = msgDate.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });
                  }

                  lastDateKey = dateKey;
                }

                return (
                  <React.Fragment key={msg.id}>
                    {dateLabel && (
                      <li className="staff-chat-date-separator">
                        <span>{dateLabel}</span>
                      </li>
                    )}
                    <li className={`staff-chat-row ${isAdmin ? 'self' : 'other'}`}>
                      <div className={`staff-chat-message-main ${isAdmin ? 'self' : 'other'}`}>
                        <span className="staff-chat-sender">
                          {msg.sender_name || (msg.sender_role === 'admin' ? 'Admin' : 'Waiter')}
                        </span>
                        <span className="staff-chat-text">{msg.message}</span>
                      </div>
                      <span className="staff-chat-time">
                        {msgDate &&
                          msgDate.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </span>
                    </li>
                  </React.Fragment>
                );
              });
            })()}
            <li ref={messagesEndRef} />
          </ul>
        )}
      </div>
      <div className="staff-chat-input">
        <input
          type="text"
          placeholder="Type a message to your team..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
        />
        <button type="button" onClick={handleSend} disabled={sending || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default StaffChat;


