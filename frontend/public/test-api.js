// Test script để kiểm tra API calls từ frontend
async function testAPICalls() {
  console.log('=== Testing API calls ===');

  try {
    // Test user-chat API
    console.log('Testing user-chat API...');
    const userChatResponse = await fetch('http://localhost:8001/api/v1/user-chat/user/8');
    console.log('User-chat status:', userChatResponse.status);

    if (userChatResponse.ok) {
      const userChatData = await userChatResponse.json();
      console.log('User-chat data:', userChatData);

      // Test chat-history API for each conversation
      for (const record of userChatData) {
        console.log(`Testing chat-history for conversation: ${record.conversation_id}`);
        const chatResponse = await fetch(`http://localhost:8001/api/v1/chat-history/conversation/${record.conversation_id}`);
        console.log('Chat-history status:', chatResponse.status);

        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          console.log('Chat data:', chatData);
        } else {
          console.error('Chat-history error:', await chatResponse.text());
        }
      }
    } else {
      console.error('User-chat error:', await userChatResponse.text());
    }

    // Test users API
    console.log('Testing users API...');
    const usersResponse = await fetch('http://localhost:8001/api/v1/users/');
    console.log('Users status:', usersResponse.status);

    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('Users data length:', usersData.users?.length || 'No users array');
    } else {
      console.error('Users error:', await usersResponse.text());
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run test
testAPICalls();
