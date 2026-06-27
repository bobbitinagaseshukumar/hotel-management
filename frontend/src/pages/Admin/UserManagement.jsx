import { useState, useEffect } from 'react';
import { FiSearch, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback demo users
  const demoUsers = [
    { id: '1', name: 'Aarav Gupta', email: 'aarav@gmail.com', role: 'customer', loyalty_points: 350 },
    { id: '2', name: 'Tanvi Shah', email: 'tanvi@gmail.com', role: 'customer', loyalty_points: 120 },
    { id: '3', name: 'Chef Suresh Kumar', email: 'chef@grandpalatial.com', role: 'kitchen_staff', loyalty_points: 0 },
    { id: '4', name: 'Manager Kabir', email: 'kabir@grandpalatial.com', role: 'manager', loyalty_points: 0 }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/auth/users'); // fallback or route
      if (res.data?.success) {
        setUsers(res.data.data);
      } else {
        setUsers(demoUsers);
      }
    } catch (err) {
      console.log('Error fetching system users, loading default list');
      setUsers(demoUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await api.put(`/api/auth/users/${id}/role`, { role: newRole });
      if (res.data?.success) {
        toast.success(`User role updated to "${newRole}"`);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to change user role');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-obsidian-900 p-4 rounded-2xl border border-obsidian-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Guest Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-obsidian-955 border border-obsidian-800 rounded-xl text-white placeholder:text-platinum-500 focus:outline-none focus:border-gold-500 text-sm"
          />
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-platinum-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-2 border-t-gold-500 border-r-transparent animate-spin mb-4" />
          <p className="text-platinum-400 text-sm">Collating guest registries...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-platinum-550 text-center py-10">No profiles matched your query.</p>
      ) : (
        <div className="overflow-x-auto bg-obsidian-900 rounded-2xl border border-obsidian-800">
          <table className="w-full text-left text-sm text-platinum-300">
            <thead className="text-xs uppercase tracking-wider text-platinum-500 border-b border-obsidian-800">
              <tr>
                <th className="py-4 px-4 font-display">Guest Name</th>
                <th className="py-4 px-4 font-display">Email Address</th>
                <th className="py-4 px-4 font-display">Loyalty Program</th>
                <th className="py-4 px-4 font-display">Authority Class</th>
                <th className="py-4 px-4 font-display text-right">Modify Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-800/40">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-obsidian-950/20">
                  <td className="py-4 px-4 font-semibold text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-obsidian-800 flex items-center justify-center border border-gold-500/20 text-gold-500">
                      <FiUser className="w-4 h-4" />
                    </div>
                    {user.name}
                  </td>
                  <td className="py-4 px-4">{user.email}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-gold-400">
                    {user.loyalty_points} pts
                  </td>
                  <td className="py-4 px-4 capitalize">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.role === 'customer' ? 'bg-gold-500/10 text-gold-400' : 'bg-blue-500/10 text-blue-450'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-3 py-1.5 bg-obsidian-955 border border-obsidian-800 rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="kitchen_staff">Kitchen Staff</option>
                      <option value="cashier">Cashier</option>
                      <option value="manager">Manager</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
