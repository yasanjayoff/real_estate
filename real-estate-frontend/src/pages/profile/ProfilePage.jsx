
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { userApi } from '../../api/services'
import { ConfirmDialog } from '../../components/common'
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  Save, Trash2, ShieldCheck, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving]           = useState(false)
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      firstName:       user?.firstName || '',
      lastName:        user?.lastName  || '',
      email:           user?.email     || '',
      phone:           user?.phone     || '',
      currentPassword: '',
      newPassword:     '',
      confirmPassword: '',
    }
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = {
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        phone:     data.phone,
      }
      // only include password fields if user is setting a new password
      if (data.newPassword) {
        payload.currentPassword = data.currentPassword
        payload.newPassword     = data.newPassword
      }

      await userApi.updateProfile(payload)
      toast.success('Profile updated successfully')

      // refresh local auth state
      const refreshed = await userApi.getMe()
      const updated = { ...user, ...refreshed.data.data }
      localStorage.setItem('re_user', JSON.stringify(updated))

      reset({
        ...data,
        currentPassword: '',
        newPassword:     '',
        confirmPassword: '',
      })
    } catch {
      // handled by axios interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await userApi.deleteAccount()
      toast.success('Account deleted')
      logout()
      navigate('/login')
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="text-sm text-slate-500">Update your personal information and password</p>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-3 p-4 border bg-slate-50 border-slate-200 rounded-xl">
        <div className="flex items-center justify-center w-12 h-12 text-lg font-bold rounded-full bg-primary-100 text-primary-700 shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-xs font-semibold">
          <ShieldCheck size={13} />
          {hasRole('ADMIN') ? 'Administrator' : 'Buyer'}
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 card">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <User size={16} className="text-primary-600" /> Personal Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input className={`input-field ${errors.firstName ? 'input-error' : ''}`}
              {...register('firstName', { required: 'First name is required' })} />
            {errors.firstName && <p className="error-msg">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input className={`input-field ${errors.lastName ? 'input-error' : ''}`}
              {...register('lastName', { required: 'Last name is required' })} />
            {errors.lastName && <p className="error-msg">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">
            <Mail size={13} className="inline mr-1" /> Email Address *
          </label>
          <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
            })} />
          {errors.email && <p className="error-msg">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">
            <Phone size={13} className="inline mr-1" /> Phone Number *
          </label>
          <input className={`input-field ${errors.phone ? 'input-error' : ''}`}
            {...register('phone', {
              required: 'Phone is required',
              pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' }
            })} />
          {errors.phone && <p className="error-msg">{errors.phone.message}</p>}
        </div>

        {/* Change password section */}
        <div className="pt-5 border-t border-slate-100">
          <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-800">
            <Lock size={14} className="text-primary-600" /> Change Password
            <span className="text-xs font-normal text-slate-400">(leave blank to keep current)</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input type={showCurrent ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
                  placeholder="Enter current password"
                  {...register('currentPassword', {
                    validate: val => {
                      const newPwd = watch('newPassword')
                      if (newPwd && !val) return 'Current password is required'
                      return true
                    }
                  })} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.currentPassword && <p className="error-msg">{errors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="Min 6 characters"
                  {...register('newPassword', {
                    minLength: { value: 6, message: 'At least 6 characters' }
                  })} />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && <p className="error-msg">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter new password"
                  {...register('confirmPassword', {
                    validate: val => {
                      const newPwd = watch('newPassword')
                      if (newPwd && val !== newPwd) return 'Passwords do not match'
                      return true
                    }
                  })} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving
              ? <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
              : <Save size={15} />}
            Save Changes
          </button>
        </div>
      </form>

      {/* Danger zone — delete account */}
      {!hasRole('ADMIN') && (
        <div className="p-6 border-2 border-red-200 card">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-red-700">Delete Account</h3>
              <p className="mb-4 text-sm text-slate-500">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700">
                <Trash2 size={14} /> Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        loading={deleteLoading}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All your inquiries, appointments, and data will be removed. This cannot be undone."
      />
    </div>
  )
}
