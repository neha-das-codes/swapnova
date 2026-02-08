import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { ref, push, onValue, set, get, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database } from '../firebase/config';
import { sendMarkCompleteEmail, sendExchangeCompletedEmail, sendGoogleMeetEmail } from '../services/emailservice';

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, userData } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [otherUserStatus, setOtherUserStatus] = useState({ online: false, lastSeen: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [exchangeStatus, setExchangeStatus] = useState(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false); // ✅ NEW
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    const userStatusRef = ref(database, `users/${currentUser.uid}/status`);
    set(userStatusRef, { online: true, lastSeen: Date.now() });

    const handleBeforeUnload = () => {
      set(userStatusRef, { online: false, lastSeen: Date.now() });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      set(userStatusRef, { online: false, lastSeen: Date.now() });
    };
  }, [currentUser]);

  useEffect(() => {
    const userParam = searchParams.get('user');
    if (userParam) {
      setSelectedChat(userParam);
      if (userData && currentUser) {
        const createConversation = async () => {
          const userRef = ref(database, `users/${userParam}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const otherUserData = snapshot.val();
            await set(ref(database, `conversations/${currentUser.uid}/${userParam}`), {
              lastMessage: '',
              lastMessageTime: Date.now(),
              otherUserName: otherUserData.fullName
            });
            await set(ref(database, `conversations/${userParam}/${currentUser.uid}`), {
              lastMessage: '',
              lastMessageTime: Date.now(),
              otherUserName: userData.fullName
            });
          }
        };
        createConversation();
      }
    }
  }, [searchParams, currentUser, userData]);

  useEffect(() => {
    if (!currentUser) return;
    const conversationsRef = ref(database, `conversations/${currentUser.uid}`);
    const unsubscribe = onValue(conversationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const convData = snapshot.val();
        const convList = Object.entries(convData)
          .filter(([key]) => key !== 'sent')
          .map(([oderId, data]) => ({ oderId, ...data }))
          .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        setConversations(convList);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const chatId = getChatId(currentUser.uid, selectedChat);
    const messagesRef = ref(database, `messages/${chatId}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const msgData = snapshot.val();
        const msgList = Object.entries(msgData).map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });

    const fetchOtherUser = async () => {
      const userRef = ref(database, `users/${selectedChat}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setOtherUser(snapshot.val());
      }
    };
    fetchOtherUser();

    const statusRef = ref(database, `users/${selectedChat}/status`);
    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setOtherUserStatus(snapshot.val());
      } else {
        setOtherUserStatus({ online: false, lastSeen: null });
      }
    });

    const exchangeRef = ref(database, `exchanges/${chatId}`);
    const exchangeUnsubscribe = onValue(exchangeRef, (snapshot) => {
      if (snapshot.exists()) {
        setExchangeStatus(snapshot.val());
      } else {
        setExchangeStatus(null);
      }
    });

    return () => {
      unsubscribe();
      statusUnsubscribe();
      exchangeUnsubscribe();
    };
  }, [selectedChat, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

  const sendMessageHandler = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const chatId = getChatId(currentUser.uid, selectedChat);
    const messageData = {
      senderId: currentUser.uid,
      senderName: userData.fullName,
      text: newMessage.trim(),
      type: 'text',
      timestamp: Date.now()
    };

    await push(ref(database, `messages/${chatId}`), messageData);
    await set(ref(database, `conversations/${currentUser.uid}/${selectedChat}`), {
      lastMessage: newMessage.trim(),
      lastMessageTime: Date.now(),
      otherUserName: otherUser?.fullName || 'User'
    });
    await set(ref(database, `conversations/${selectedChat}/${currentUser.uid}`), {
      lastMessage: newMessage.trim(),
      lastMessageTime: Date.now(),
      otherUserName: userData.fullName
    });
    setNewMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    setUploading(true);
    try {
      const storage = getStorage();
      const fileRef = storageRef(storage, `chat-media/${getChatId(currentUser.uid, selectedChat)}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      const chatId = getChatId(currentUser.uid, selectedChat);
      const messageData = {
        senderId: currentUser.uid,
        senderName: userData.fullName,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: downloadURL,
        fileName: file.name,
        timestamp: Date.now()
      };

      await push(ref(database, `messages/${chatId}`), messageData);
      const lastMsgText = file.type.startsWith('image/') ? '📷 Image' : `📎 ${file.name}`;
      await set(ref(database, `conversations/${currentUser.uid}/${selectedChat}`), {
        lastMessage: lastMsgText,
        lastMessageTime: Date.now(),
        otherUserName: otherUser?.fullName || 'User'
      });
      await set(ref(database, `conversations/${selectedChat}/${currentUser.uid}`), {
        lastMessage: lastMsgText,
        lastMessageTime: Date.now(),
        otherUserName: userData.fullName
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
 

  const markAsCompleted = async () => {
  if (!selectedChat || !otherUser) return;
  
  const chatId = getChatId(currentUser.uid, selectedChat);
  const currentExchange = exchangeStatus || {};
  const myCompletion = currentExchange[`completed_${currentUser.uid}`];
  const theirCompletion = currentExchange[`completed_${selectedChat}`];

  if (myCompletion) {
    alert('You have already marked this exchange as complete.');
    return;
  }

  try {
    await update(ref(database, `exchanges/${chatId}`), {
      [`completed_${currentUser.uid}`]: true,
      [`completedAt_${currentUser.uid}`]: Date.now(),
      users: [currentUser.uid, selectedChat],
      userNames: [userData.fullName, otherUser.fullName]
    });

    // ✅ FIXED: Send "Exchange Completed" email to ME immediately
    console.log('📧 Sending completion email to current user:', userData.email);
    if (userData?.email) {
      await sendExchangeCompletedEmail(userData, otherUser.fullName);
      console.log('✅ Completion email sent to current user');
    }

    // Send "Mark Complete" notification to OTHER user
    console.log('📧 Sending mark complete email to:', otherUser.email);
    if (otherUser.email && userData) {
      await sendMarkCompleteEmail(userData, otherUser);
      console.log('✅ Email sent to other user');
    }

    if (theirCompletion) {
      console.log('🎉 Both users completed! Giving credits...');
      
      await updateWallet(currentUser.uid, 5);
      await updateWallet(selectedChat, 5);

      await update(ref(database, `exchanges/${chatId}`), {
        fullyCompleted: true,
        fullyCompletedAt: Date.now()
      });
    }

    // ✅ Show feedback prompt instead of navigating immediately
    setShowFeedbackPrompt(true);
    
  } catch (error) {
    console.error('❌ Error marking complete:', error);
    alert('Failed to mark complete. Please try again.');
  }
};

 
  const updateWallet = async (userId, credits) => {
    try {
      const walletRef = ref(database, `users/${userId}/wallet`);
      const snapshot = await get(walletRef);
      
      const currentCredits = snapshot.exists() ? snapshot.val() : 10;
      const newBalance = currentCredits + credits;
      
      console.log(`💰 Updating wallet for ${userId}: ${currentCredits} + ${credits} = ${newBalance}`);
      
      await set(walletRef, newBalance);
      
      return newBalance;
    } catch (error) {
      console.error('❌ Error updating wallet:', error);
      throw error;
    }
  };

    const startGoogleMeet = async () => {
  if (!selectedChat || !otherUser) return;
  
  try {
    // ✅ FIXED: Use permanent Google Meet link
    const meetUrl = 'https://meet.google.com/uer-usjy-vnf';

      console.log('📧 Sending Google Meet email to:', otherUser.email);
      
      if (otherUser.email && userData) {
        await sendGoogleMeetEmail(userData, otherUser, meetUrl);
        console.log('✅ Google Meet email sent successfully');
        
        window.open(meetUrl, '_blank');
        
        alert(`✅ Google Meet link sent to ${otherUser.fullName}!`);
      } else {
        alert('❌ Unable to send meeting link. User email not found.');
      }
      
    } catch (error) {
      console.error('❌ Error starting Google Meet:', error);
      alert('Failed to start Google Meet. Please try again.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Offline';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Last seen just now';
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    return `Last seen at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasMarkedComplete = exchangeStatus?.[`completed_${currentUser?.uid}`];
  const otherHasMarkedComplete = exchangeStatus?.[`completed_${selectedChat}`];

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="h-[calc(100vh-80px)] flex">
        <div className={`w-full md:w-80 lg:w-96 bg-white border-r flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b">
            <div className="relative">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div
                  key={conv.oderId}
                  onClick={() => setSelectedChat(conv.oderId)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    selectedChat === conv.oderId ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(conv.otherUserName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.otherUserName}</h3>
                      <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat && otherUser ? (
            <>
              <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(otherUser.fullName)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{otherUser.fullName}</h3>
                    <p className={`text-xs ${otherUserStatus.online ? 'text-green-500' : 'text-gray-500'}`}>
                      {otherUserStatus.online ? '● Online' : formatLastSeen(otherUserStatus.lastSeen)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Voice Call"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>

                  <button
                    onClick={startGoogleMeet}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Video Call"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <button
                    onClick={markAsCompleted}
                    disabled={hasMarkedComplete}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                      hasMarkedComplete ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    ✓ {hasMarkedComplete ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              </div>

              {!hasMarkedComplete && otherHasMarkedComplete && (
                <div className="bg-yellow-50 px-4 py-2 text-sm text-yellow-800 border-b">
                  ⚠️ {otherUser.fullName} marked complete. Please confirm to finalize.
                </div>
              )}

              {/* ✅ NEW: Feedback Prompt Banner (shows after marking complete) */}
              {showFeedbackPrompt && (
                <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-semibold text-green-900">Exchange marked as complete!</p>
                        <p className="text-sm text-green-700">Help others by sharing your experience</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/feedback/${getChatId(currentUser.uid, selectedChat)}`)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Give Feedback
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#e5ddd5', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M50 0L0 50M100 0L50 50M100 50L50 100M50 50L0 100\' stroke=\'%23d1ccc3\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")' }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600">
                    <p className="font-medium">Start your conversation with {otherUser.fullName?.split(' ')[0]}</p>
                    <p className="text-sm">Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`mb-3 flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg shadow-sm ${msg.senderId === currentUser.uid ? 'bg-green-100 rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                        {msg.type === 'image' ? (
                          <div className="p-1">
                            <img src={msg.fileUrl} alt="Shared" className="max-w-full rounded-lg cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
                            <p className="text-xs text-gray-500 text-right px-2 pb-1">{formatTime(msg.timestamp)}</p>
                          </div>
                        ) : msg.type === 'file' ? (
                          <div className="p-3">
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm">{msg.fileName}</span>
                            </a>
                            <p className="text-xs text-gray-500 text-right mt-1">{formatTime(msg.timestamp)}</p>
                          </div>
                        ) : (
                          <div className="px-3 py-2">
                            <p className="text-gray-800">{msg.text}</p>
                            <p className="text-xs text-gray-500 text-right mt-1">{formatTime(msg.timestamp)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white px-4 py-3 border-t">
                <form onSubmit={sendMessageHandler} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" className="hidden" />
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${otherUser.fullName?.split(' ')[0]}...`}
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-2.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-500">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;