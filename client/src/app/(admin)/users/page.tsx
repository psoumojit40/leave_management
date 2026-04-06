'use client'; // FIX 1: Directive for hooks

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

// FIX 2: Define the User interface
interface User {
  id: number;
  name: string;
  email: string;
  role: 'Employee' | 'Manager' | 'Admin';
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export default function UsersPage() {
  // FIX 3: Add explicit types to state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data: User[] = [
          { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', department: 'Engineering', status: 'Active' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', department: 'Engineering', status: 'Active' },
          { id: 3, name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Admin', department: 'HR', status: 'Active' },
          { id: 4, name: 'Alice Brown', email: 'alice.brown@example.com', role: 'Employee', department: 'Marketing', status: 'Inactive' },
        ];
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    setSelectedUser({
      id: 0,
      name: '',
      email: '',
      role: 'Employee',
      department: '',
      status: 'Active'
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser({ ...user });
  };

  const handleDeleteUser = async (userId: number) => {
    console.log(`Deleting user ${userId}`);
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    console.log('Saving user:', selectedUser);
    
    if (selectedUser.id === 0) {
      setUsers(prev => [...prev, { ...selectedUser, id: Date.now() }]);
    } else {
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
    }
    
    setSelectedUser(null);
  };

  const handleCancelUser = () => {
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full border-4 border-t-indigo-600 border-b-transparent w-12 h-12"></div>
        <p className="mt-4">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Management</h2>
          <Button onClick={handleCreateUser} variant="outline">
            Add User
          </Button>
        </div>
        <p className="text-gray-600">
          Manage user accounts, roles, and permissions.
        </p>
      </div>
      
      {selectedUser && (
        <div className="bg-white rounded-lg shadow p-6 border-2 border-indigo-100">
          <h2 className="text-xl font-bold mb-4">
            {selectedUser.id === 0 ? 'Create New User' : 'Edit User'}
          </h2>
          
          <form onSubmit={handleSaveUser} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  id="role"
                  required
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  id="department"
                  type="text"
                  value={selectedUser.department}
                  onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                value={selectedUser.status}
                onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as any })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button type="button" onClick={handleCancelUser} variant="outline">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save User
              </Button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">User List</h2>
        
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'Manager' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleEditUser(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}