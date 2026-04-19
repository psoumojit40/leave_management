'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { loginUser } from '@/store/authSlice'; // Use our Redux thunk
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function LoginPage() {
  const [role, setRole] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [loginId, setLoginId] = useState(''); // Can be email, EMP_ID, or ADMIN
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Dispatch our Redux login action
      const resultAction = await dispatch(loginUser({ loginId, password, role }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success("Welcome back!");
        router.push('/dashboard');
      } else {
        toast.error(resultAction.payload as string || "Invalid Credentials");
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-6 p-10 bg-white rounded-3xl border border-gray-300 shadow-2xl shadow-gray-400/40">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sign In</h2>
          <p className="mt-2 text-sm text-gray-500">Select your role to access the portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Login As
            </label>
            <select 
              value={role}
              onChange={(e) => {
                setRole(e.target.value as any);
                setLoginId(''); // Clear input when switching roles
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-600 transition-all"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              {/* <option value="admin">Administrator</option> */}
            </select>
          </div>

          {/* Dynamic Login ID Field */}
          <div>
            <label htmlFor="loginId" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              {role === 'admin' ? 'Admin ID' : 'Email or User ID'}
            </label>
            <input
              id="loginId"
              type="text"
              required
              placeholder={role === 'admin' ? 'Enter ADMIN' : 'name@company.com or EMP_101'}
              className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 transition-all sm:text-sm"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="block w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 transition-all sm:text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full py-4 shadow-lg shadow-indigo-100" variant="primary" loading={loading}>
              Sign In
            </Button>
          </div>
        </form>
        
        {/* Navigation to Register */}
        <p className="text-center text-sm text-gray-500">
          New here?{' '}
          <a href="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}