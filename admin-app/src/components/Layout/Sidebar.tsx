import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bell, User, Plus, LogOut } from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const NavItem = ({ icon: Icon, filledIcon: FilledIcon, label, path }: any) => {
        const active = location.pathname === path;
        const IconComponent = active ? FilledIcon : Icon;

        return (
            <div
                onClick={() => navigate(path)}
                className={`group flex items-center xl:justify-start justify-center cursor-pointer w-full p-3 mb-1 rounded-xl transition-all duration-200
                    ${active ? 'bg-gray-100 text-[--color-accent]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
            >
                <IconComponent className={`w-[22px] h-[22px] ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className={`text-[15px] hidden xl:block ml-3 ${active ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full w-full p-4">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2 cursor-pointer" onClick={() => navigate('/')}>
                <img src="/logo-new.png" alt="VOID" className="w-10 h-10 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300" />
                <span className="font-bold text-xl tracking-tight hidden xl:block text-gray-900 font-display">void.</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 w-full space-y-1">
                <NavItem
                    path="/"
                    label="Dashboard"
                    icon={Home}
                    filledIcon={Home}
                />
                <NavItem
                    path="/alerts"
                    label="Notifications"
                    icon={Bell}
                    filledIcon={Bell}
                />
                <NavItem
                    path="/profile"
                    label="Settings"
                    icon={User}
                    filledIcon={User}
                />
            </nav>

            {/* Create Button (Glassy) */}
            <button className="hidden xl:flex w-full items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98] mb-6 overflow-hidden relative group text-white">
                <div className="absolute inset-0 bg-[url('/art-bg.png')] bg-cover bg-center opacity-90 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm"></div>
                <div className="relative flex items-center gap-2 z-10">
                    <Plus className="w-5 h-5" />
                    <span>New Ticket</span>
                </div>
            </button>
            <button className="xl:hidden w-full flex items-center justify-center bg-[url('/art-bg.png')] bg-cover text-white p-3 rounded-xl shadow-lg mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm"></div>
                <Plus className="w-6 h-6 relative z-10" />
            </button>

            {/* Profile / Logout */}
            <div className="mt-auto border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <img src="/avatar.png" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" />
                    <div className="flex-1 hidden xl:block min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">Admin</div>
                        <div className="text-xs text-gray-500 truncate">admin@void.corp</div>
                    </div>
                    <LogOut className="w-4 h-4 text-gray-400 hidden xl:block" />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
