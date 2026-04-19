'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [role, setRole] = useState<'employee' | 'manager'>('employee');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    gender: '',
    employeeId: '',
    managerId: '',
    dob: '',
    department: 'Engineering', // ✅ Add default value
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: role,
          gender: formData.gender,
          department: formData.department, 
          employeeId: formData.employeeId || undefined,
          managerId: formData.managerId || undefined,
          dob: formData.dob || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
          const firstError = data.errors[0];
          throw new Error(`${firstError.path}: ${firstError.message}`);
        }
        throw new Error(data.message || 'Registration failed');
      }

      toast.success("Account created successfully! Please login.");
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message);
      console.error("Registration Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-6 p-10 bg-white rounded-3xl border border-gray-300 shadow-2xl shadow-gray-400/40">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900">Join the Portal</h2>
          <p className="mt-2 text-sm text-gray-500">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Register As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
            <select
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {/* Department Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Department
            </label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            >
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">First Name</label>
              <input
                required
                type="text"
                placeholder="John"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 ml-1">Last Name</label>
              <input
                required
                type="text"
                placeholder="Doe"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Email Address</label>
            <input
              required
              type="email"
              placeholder="john.doe@company.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-gray-50 mt-4 space-y-4">
            {/* Conditional Fields for Employee */}
            {role === 'employee' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 ml-1">Employee ID</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. EMP_101"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 ml-1">Date of Birth</label>
                  <input
                    required
                    type="date"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Conditional Fields for Manager */}
            {role === 'manager' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 ml-1">Manager ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. MANGR_101"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full py-4 mt-4" variant="primary" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="font-bold text-indigo-600 hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  );
}