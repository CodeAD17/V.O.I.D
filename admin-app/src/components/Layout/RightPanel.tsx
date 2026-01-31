import { useState, useEffect } from 'react';
import { Activity, Server, Radio, Shield, Terminal, RefreshCw } from 'lucide-react';
import { systemAPI } from '../../api/client';

const RightPanel = () => {
    const [status, setStatus] = useState<{
        active_connections: number;
        connected_agents: Array<{ username: string; role: string }>;
    } | null>(null);
    const [backendOnline, setBackendOnline] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const checkStatus = async () => {
        const res = await systemAPI.status();
        setLastUpdated(new Date());
        if (res.success && res.data) {
            setStatus(res.data);
            setBackendOnline(true);
        } else {
            setBackendOnline(false);
            setStatus(null);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const isAgentConnected = (role: string) => {
        return status?.connected_agents.some(a => a.role === role) || false;
    };

    const StatusRow = ({ label, icon: Icon, isOnline, subtext }: { label: string, icon: any, isOnline: boolean, subtext?: string }) => (
        <div className="flex items-center justify-between p-3 bg-black/5 rounded-lg border border-black/5">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
                    {subtext && <p className="text-[10px] text-gray-500">{subtext}</p>}
                </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 border-l border-gray-100 bg-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg text-gray-900">System Status</h2>
                <button onClick={checkStatus} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-3">
                {/* Manual Status Cards for VOID Components */}

                <StatusRow
                    label="MCP Server"
                    icon={Server}
                    isOnline={backendOnline}
                    subtext={backendOnline ? `Gateway Active • ${status?.active_connections || 0} Connections` : 'Connection Refused'}
                />

                <StatusRow
                    label="Fix Agent"
                    icon={Shield}
                    isOnline={isAgentConnected('fix_agent')}
                    subtext="Autonomous Repair Worker"
                />

                <StatusRow
                    label="Voice Agent"
                    icon={Radio}
                    isOnline={isAgentConnected('voice_agent')}
                    subtext="Voice Input Interface"
                />

                <StatusRow
                    label="Admin Console"
                    icon={Terminal}
                    isOnline={true}
                    subtext="Frontend Connected"
                />
            </div>

            {/* Logs Area Placeholder */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">System Logs</h3>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 h-[300px] overflow-y-auto">
                    <div className="opacity-50 mb-2 border-b border-gray-700 pb-2">
                        Displaying recent events...
                    </div>
                    {backendOnline ? (
                        <>
                            <p className="mb-1"><span className="text-gray-500">[{lastUpdated.toLocaleTimeString()}]</span> Connected to MCP Server</p>
                            {status?.connected_agents.map((agent, i) => (
                                <p key={i} className="mb-1">
                                    <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span> Agent <span className="text-white">{agent.username}</span> ({agent.role}) active
                                </p>
                            ))}
                        </>
                    ) : (
                        <p className="text-red-400">
                            <span className="text-gray-500">[{lastUpdated.toLocaleTimeString()}]</span> Error: Cannot reach MCP Server (ECONNREFUSED)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RightPanel;
