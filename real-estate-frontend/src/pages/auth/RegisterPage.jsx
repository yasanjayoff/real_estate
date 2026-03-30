import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Loader2, Home, Eye, EyeOff, UserCheck } from 'lucide-react'
import { useState } from 'react'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      // role is NOT sent — backend always assigns BUYER
      const { confirmPassword, ...payload } = data
      await registerUser(payload)
      toast.success('Account created! Welcome.')
      navigate('/')
    } catch {}
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4 shadow-lg w-14 h-14 bg-primary-600 rounded-2xl">
            <Home size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white font-display">RealEstate Pro</h1>
          <p className="mt-1 text-sm text-slate-400">Create your buyer account</p>
        </div>

        <div className="p-8 shadow-2xl card">
          <h2 className="mb-2 text-xl font-semibold font-display text-slate-900">Create Account</h2>

          {/* Role badge */}
          <div className="flex items-center gap-2 px-3 py-2 mb-5 border rounded-lg bg-primary-50 border-primary-200">
            <UserCheck size={14} className="text-primary-600 shrink-0" />
            <p className="text-xs text-primary-700">
              New accounts are registered as <span className="font-semibold">Buyer</span>. Contact admin to change roles.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="John"
                  {...register('firstName', { required: 'Required' })} />
                {errors.firstName && <p className="error-msg">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Doe"
                  {...register('lastName', { required: 'Required' })} />
                {errors.lastName && <p className="error-msg">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })} />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone Number *</label>
              <input className={`input-field ${errors.phone ? 'input-error' : ''}`}
                placeholder="07XXXXXXXX"
                maxLength={10}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: { value: /^[0-9]{10}$/, message: 'Must be exactly 10 digits' },
                  minLength: { value: 10, message: 'Must be exactly 10 digits' },
                  maxLength: { value: 10, message: 'Must be exactly 10 digits' }
                })} />
              {errors.phone && <p className="error-msg">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 6 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' }
                  })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password *</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: val => val === watch('password') || 'Passwords do not match'
                  })} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-2.5 mt-2">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Create Account
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
