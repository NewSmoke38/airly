import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Heart, 
  Eye, 
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { adminService, AnalyticsData, PaginatedUsers, User } from '../../services/adminService';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {change !== undefined && (
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change} this week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

interface ChartCardProps {
  title: string;
  data: Array<{ _id: string; count: number }>;
  color: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, color }) => {
  const maxValue = Math.max(...data.map(d => d.count));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {new Date(item._id).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${(item.count / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8 text-right">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, onEdit, onDelete }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <img className="h-10 w-10 rounded-full" src={user.pfp} alt={user.fullName} />
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
          <div className="text-sm text-gray-500">@{user.username}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        user.role === 'admin' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {user.role}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date(user.createdAt).toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {user.followers?.length || 0}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button
        onClick={() => onEdit(user)}
        className="text-indigo-600 hover:text-indigo-900 mr-3"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(user._id)}
        className="text-red-600 hover:text-red-900"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </td>
  </tr>
);

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAnalytics();
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, currentPage]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers(currentPage, 10);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!editingUser) return;
    
    try {
      await adminService.updateUser(editingUser._id, userData);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor platform analytics and manage users</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === id
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={analytics.overview.totalUsers}
              change={analytics.overview.newUsersThisWeek}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Posts"
              value={analytics.overview.totalTweets}
              change={analytics.overview.newTweetsThisWeek}
              icon={FileText}
              color="bg-green-500"
            />
            <StatCard
              title="Total Likes"
              value={analytics.overview.totalLikes}
              icon={Heart}
              color="bg-red-500"
            />
            <StatCard
              title="Total Views"
              value={analytics.overview.totalViews}
              icon={Eye}
              color="bg-purple-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Daily User Registrations (Last 7 Days)"
              data={analytics.charts.dailyRegistrations}
              color="bg-blue-500"
            />
            <ChartCard
              title="Daily Posts (Last 7 Days)"
              data={analytics.charts.dailyPosts}
              color="bg-green-500"
            />
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Popular Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
              <div className="space-y-3">
                {analytics.insights.popularTags.slice(0, 5).map((tag, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">#{tag.tag}</span>
                    <span className="text-sm font-medium text-gray-900">{tag.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
              <div className="space-y-3">
                {analytics.insights.mostActiveUsers.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img src={user.pfp} alt={user.fullName} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.postCount} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Liked Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Liked Posts</h3>
              <div className="space-y-3">
                {analytics.insights.mostLikedPosts.slice(0, 3).map((post, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-xs text-gray-500 mb-1">{post.content.substring(0, 60)}...</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.likesCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.views}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && users && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600">Total: {users.pagination.total} users</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Followers
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.users.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, users.pagination.total)} of {users.pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(users.pagination.pages, currentPage + 1))}
                disabled={currentPage === users.pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateUser({
                fullName: formData.get('fullName') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as 'user' | 'admin'
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={editingUser.fullName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 