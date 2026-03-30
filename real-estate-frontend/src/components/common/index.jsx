// src/components/common/index.jsx
import { X, AlertTriangle, Loader2 } from 'lucide-react'

// ─── Modal ───────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} animate-slide-in max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-display font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm animate-slide-in p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-lg shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm px-4 py-2">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="btn-danger text-sm px-4 py-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────
export function Spinner({ className = '' }) {
  return <Loader2 size={20} className={`animate-spin text-primary-600 ${className}`} />
}

// ─── Page Loader ──────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-8 h-8" />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────
export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-slate-100 rounded-full mb-4">
        <Icon size={32} className="text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{message}</p>
      {action}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────
const statusColors = {
  AVAILABLE:         'bg-green-100 text-green-700',
  UNDER_NEGOTIATION: 'bg-yellow-100 text-yellow-700',
  SOLD:              'bg-blue-100 text-blue-700',
  INACTIVE:          'bg-slate-100 text-slate-600',
  NEW:               'bg-sky-100 text-sky-700',
  NEGOTIATING:       'bg-orange-100 text-orange-700',
  CLOSED:            'bg-green-100 text-green-700',
  CANCELLED:         'bg-red-100 text-red-700',
  SCHEDULED:         'bg-blue-100 text-blue-700',
  COMPLETED:         'bg-green-100 text-green-700',
  RESCHEDULED:       'bg-purple-100 text-purple-700',
  PENDING:           'bg-yellow-100 text-yellow-700',
  VERIFIED:          'bg-green-100 text-green-700',
  EXPIRED:           'bg-red-100 text-red-700',
  REJECTED:          'bg-red-100 text-red-700',
  ADMIN:             'bg-purple-100 text-purple-700',
  AGENT:             'bg-blue-100 text-blue-700',
  BUYER:             'bg-teal-100 text-teal-700',
  SELLER:            'bg-orange-100 text-orange-700',
}

export function StatusBadge({ status }) {
  const color = statusColors[status] || 'bg-slate-100 text-slate-600'
  return (
    <span className={`badge ${color}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

// ─── Search Bar ───────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field max-w-xs"
    />
  )
}

// ─── Stat Card ────────────────────────────────────────────
export function StatCard({ title, value, icon: Icon, color = 'blue', sub }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   text: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600', text: 'text-green-700' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', text: 'text-orange-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-700' },
  }
  const c = colors[color]
  return (
    <div className={`card p-5 ${c.bg} border-0`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${c.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className={`text-2xl font-display font-bold ${c.text} mb-1`}>{value}</div>
      <div className="text-sm font-medium text-slate-600">{title}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

// ─── Select Field ─────────────────────────────────────────
export function SelectField({ label, error, options, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select className={`input-field ${error ? 'input-error' : ''}`} {...props}>
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}

// ─── Input Field ──────────────────────────────────────────
export function InputField({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input className={`input-field ${error ? 'input-error' : ''}`} {...props} />
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}

// ─── Textarea Field ────────────────────────────────────────
export function TextareaField({ label, error, rows = 3, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea className={`input-field resize-none ${error ? 'input-error' : ''}`} rows={rows} {...props} />
      {error && <p className="error-msg">{error}</p>}
    </div>
  )
}
