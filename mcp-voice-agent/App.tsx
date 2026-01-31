import React from 'react';
import VoiceAgent from './components/VoiceAgent';
import { UserContext } from './types';

// Mock Data - This would come from your app in a real integration
const MOCK_USER_CONTEXT: UserContext = {
    user_id: "u_9921_alex",
    route: "/dashboard/analytics",
    device: "Chrome 122 on macOS",
    logs: [
        "[INFO] App mounted at 10:00:01",
        "[WARN] Low latency detected on socket #4",
        "[ERROR] TypeError: Cannot read property 'map' of undefined in Chart.tsx:42"
    ],
    recent_errors: ["TypeError in Chart.tsx"]
};

import { connectToSSEStream } from './services/mcpService';

const App: React.FC = () => {
    React.useEffect(() => {
        // Auto-connect to MCP Server so we show up as "ONLINE" in the admin dashboard
        connectToSSEStream();
    }, []);

    return (
        <VoiceAgent userContext={MOCK_USER_CONTEXT} />
    );
};

export default App;
