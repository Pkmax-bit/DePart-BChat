'use client';

export default function SimpleTestPage() {
  const testAPI = async () => {
    console.log('=== Testing API calls ===');

    try {
      // Test user-chat API
      console.log('Testing user-chat API...');
      const response = await fetch('http://localhost:8001/api/v1/user-chat/user/8');
      console.log('User-chat status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User-chat data:', data);
        alert(`User-chat API: ${data.length} records found`);
      } else {
        console.error('User-chat error:', response.status);
        alert(`User-chat API error: ${response.status}`);
      }

      // Test chat-history API
      console.log('Testing chat-history API...');
      const response2 = await fetch('http://localhost:8001/api/v1/chat-history/conversation/bdd47818-c62a-4a92-854d-5a87a34f9985');
      console.log('Chat-history status:', response2.status);

      if (response2.ok) {
        const data2 = await response2.json();
        console.log('Chat-history data:', data2);
        alert(`Chat-history API: ${data2.length} messages found`);
      } else {
        console.error('Chat-history error:', response2.status);
        alert(`Chat-history API error: ${response2.status}`);
      }

    } catch (error) {
      console.error('Test error:', error);
      alert(`Test error: ${error.message}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple API Test</h1>
      <button
        onClick={testAPI}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test API Calls
      </button>
      <div className="mt-4">
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
}
