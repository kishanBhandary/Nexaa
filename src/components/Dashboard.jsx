import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Home, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText,
  Search,
  Plus,
  ChevronDown,
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import UserProfile from './UserProfile';

const Dashboard = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Welcome to your dashboard!', type: 'info', time: '2 min ago' },
    { id: 2, message: 'New feature update available', type: 'success', time: '1 hour ago' },
    { id: 3, message: 'Your subscription expires in 7 days', type: 'warning', time: '2 hours ago' }
  ]);

  // Sample data for charts and metrics
  const [metrics] = useState({
    totalUsers: 12543,
    activeProjects: 24,
    completedTasks: 187,
    revenue: '$45,231'
  });

  const [chartData] = useState([
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 }
  ]);

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const MetricCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-white/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="text-black" size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-white text-sm">
            <TrendingUp size={16} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );

  const NotificationItem = ({ notification, onDismiss }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      notification.type === 'info' ? 'bg-blue-500/10 border-blue-500' :
      notification.type === 'success' ? 'bg-green-500/10 border-green-500' :
      'bg-yellow-500/10 border-yellow-500'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white text-sm">{notification.message}</p>
          <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
        </div>
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-gray-400 hover:text-white transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon={Users}
          trend="+12%"
          color="from-white to-gray-300"
        />
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          icon={FileText}
          trend="+8%"
          color="from-gray-200 to-gray-400"
        />
        <MetricCard
          title="Completed Tasks"
          value={metrics.completedTasks}
          icon={Activity}
          trend="+23%"
          color="from-white to-gray-200"
        />
        <MetricCard
          title="Revenue"
          value={metrics.revenue}
          icon={TrendingUp}
          trend="+15%"
          color="from-gray-300 to-gray-500"
        />
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Performance Overview</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-white to-gray-300 rounded-t-lg transition-all hover:from-gray-200 hover:to-gray-400"
                  style={{ height: `${(item.value / 5000) * 100}%` }}
                ></div>
                <span className="text-gray-400 text-sm mt-2">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-white text-sm">Project "AI Dashboard" completed</p>
                <p className="text-gray-400 text-xs">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="text-white text-sm">New team member joined</p>
                <p className="text-gray-400 text-xs">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              </div>
              <div>
                <p className="text-white text-sm">System update deployed</p>
                <p className="text-gray-400 text-xs">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'analytics':
        return (
          <div className="text-center py-20">
            <BarChart3 className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-gray-400">Advanced analytics features coming soon...</p>
          </div>
        );
      case 'projects':
        return (
          <div className="text-center py-20">
            <FileText className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-2xl font-bold text-white mb-2">Projects</h3>
            <p className="text-gray-400">Project management tools coming soon...</p>
          </div>
        );
      case 'team':
        return (
          <div className="text-center py-20">
            <Users className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-2xl font-bold text-white mb-2">Team</h3>
            <p className="text-gray-400">Team collaboration features coming soon...</p>
          </div>
        );
      case 'messages':
        return (
          <div className="text-center py-20">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-2xl font-bold text-white mb-2">Messages</h3>
            <p className="text-gray-400">Messaging system coming soon...</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-20">
            <Calendar className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-2xl font-bold text-white mb-2">Calendar</h3>
            <p className="text-gray-400">Calendar integration coming soon...</p>
          </div>
        );
      case 'profile':
        return <UserProfile onBack={() => setActiveTab('overview')} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Application Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Dark Mode</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-12 h-6 rounded-full ${darkMode ? 'bg-cyan-500' : 'bg-slate-600'} relative transition-colors`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'} absolute top-0.5`}></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Email Notifications</span>
                    <button className="w-12 h-6 rounded-full bg-cyan-500 relative">
                      <div className="w-5 h-5 rounded-full bg-white translate-x-6 absolute top-0.5"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Auto-save</span>
                    <button className="w-12 h-6 rounded-full bg-cyan-500 relative">
                      <div className="w-5 h-5 rounded-full bg-white translate-x-6 absolute top-0.5"></div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Privacy & Security</h3>
                <div className="space-y-4">
                  <button className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <div className="text-white font-medium">Data Export</div>
                    <div className="text-gray-400 text-sm">Download your data</div>
                  </button>
                  <button className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <div className="text-white font-medium">Account Deactivation</div>
                    <div className="text-gray-400 text-sm">Temporarily disable account</div>
                  </button>
                  <button className="w-full text-left p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                    <div className="text-red-400 font-medium">Delete Account</div>
                    <div className="text-red-300/70 text-sm">Permanently remove account</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 transition-all duration-300 relative`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white to-gray-300"></div>
            {sidebarOpen && <span className="text-white font-bold text-xl">AI Dashboard</span>}
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
        >
          {sidebarOpen ? '<' : '>'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-800/50 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-white focus:outline-none"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white border border-gray-700/50 hover:border-white/30 transition-all">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                </button>
              </div>

              {/* Profile Dropdown */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white to-gray-300 flex items-center justify-center">
                  <User className="text-black" size={20} />
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium">{user?.username || 'User'}</p>
                  <p className="text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
                </div>
                <button 
                  onClick={onSignOut}
                  className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 transition-all"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {notifications.length > 0 && activeTab === 'overview' && (
            <div className="mb-6 space-y-3">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDismiss={(id) => setNotifications(notifications.filter(n => n.id !== id))}
                />
              ))}
            </div>
          )}
          
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;