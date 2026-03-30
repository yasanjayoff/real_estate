import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { userApi } from '../../api/services'
import { Modal, ConfirmDialog, EmptyState, PageLoader, SearchBar } from '../../components/common'
import { Plus, Pencil, Trash2, Users, Eye, EyeOff, ShieldCheck, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['ADMIN', 'BUYER']

const ROLE_CONFIG = {
  ADMIN: { bg: 'bg-purple-100 text-purple-700', icon: <ShieldCheck size={11} />, label: 'Admin' },
  BUYER: { bg: 'bg-blue-100 text-blue-700',     icon: <UserRound size={11} />,   label: 'Buyer' },
}

function RoleBadge({ role }) {
  const r = ROLE_CONFIG[role] || ROLE_CONFIG.BUYER
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${r.bg}`}>
      {r.icon} {r.label}
    </span>
  )
}

function UserForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  const [showPass, setShowPass] = useState(false)
  const isEdit = !!defaultValues?.id

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First Name *</label>
          <input className={`input-field ${errors.firstName ? 'input-error' : ''}`}
            placeholder="John"
            {...register('firstName', { required: 'First name is required' })} />
          {errors.firstName && <p className="error-msg">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="label">Last Name *</label>
          <input className={`input-field ${errors.lastName ? 'input-error' : ''}`}
            placeholder="Doe"
            {...register('lastName', { required: 'Last name is required' })} />
          {errors.lastName && <p className="error-msg">{errors.lastName.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="label">Email *</label>
          <input type="email" className={`input-field ${errors.email ? 'input-error' : ''}`}
            placeholder="john@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
            })} />
          {errors.email && <p className="error-msg">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Phone *</label>
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
          <label className="label">Role *</label>
          <select className={`input-field ${errors.role ? 'input-error' : ''}`}
            {...register('role', { required: 'Role is required' })}>
            <option value="">Select role</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
            ))}
          </select>
          {errors.role && <p className="error-msg">{errors.role.message}</p>}
        </div>

        <div className="col-span-2">
          <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'}
              className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}
              {...register('password', {
                required: !isEdit ? 'Password is required' : false,
                minLength: { value: 6, message: 'At least 6 characters' }
              })} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-400">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="error-msg">{errors.password.message}</p>}
        </div>

        {isEdit && (
          <div className="flex items-center col-span-2 gap-2">
            <input type="checkbox" id="active" className="rounded" {...register('active')} />
            <label htmlFor="active" className="text-sm font-medium text-slate-700">Active account</label>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <span className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />}
          {isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  )
}

export default function UsersPage() {
  const [users, setUsers]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [search, setSearch]           = useState('')
  const [filterRole, setFilterRole]   = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [deleteItem, setDeleteItem]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = filterRole ? await userApi.getByRole(filterRole) : await userApi.getAll()
      setUsers(res.data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filterRole])

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const adminCount = users.filter(u => u.role === 'ADMIN').length
  const buyerCount = users.filter(u => u.role === 'BUYER').length
  const activeCount = users.filter(u => u.active).length

  const handleSubmit = async (data) => {
    setFormLoading(true)
    try {
      if (editItem) {
        const payload = { ...data, active: data.active ?? true }
        if (!payload.password) delete payload.password
        await userApi.update(editItem.id, payload)
        toast.success('User updated')
      } else {
        await userApi.create(data)
        toast.success('User created')
      }
      setModalOpen(false); setEditItem(null); load()
    } finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await userApi.delete(deleteItem.id)
      toast.success('User deleted')
      setDeleteItem(null); load()
    } finally { setDeleteLoading(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="text-sm text-slate-500">{users.length} total users · {activeCount} active</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditItem(null); setModalOpen(true) }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', count: users.length,  bg: 'bg-slate-100', icon: <Users size={16} className="text-slate-600" /> },
          { label: 'Admins',      count: adminCount,    bg: 'bg-purple-100', icon: <ShieldCheck size={16} className="text-purple-600" /> },
          { label: 'Buyers',      count: buyerCount,    bg: 'bg-blue-100',   icon: <UserRound size={16} className="text-blue-600" /> },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 card">
            <div className={`p-2 rounded-lg ${s.bg}`}>{s.icon}</div>
            <div>
              <div className="text-xl font-bold font-display text-slate-800">{s.count}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Role filter pills + search */}
      <div className="flex flex-wrap items-center gap-3 p-4 card">
        <div className="flex gap-2">
          {['', ...ROLES].map(r => (
            <button key={r} onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterRole === r
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>
              {r ? ROLE_CONFIG[r].label : 'All Roles'}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email…" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden card">
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon={Users} title="No users found" message="No users match your search."
            action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} />Add User</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">User</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${!u.active ? 'opacity-50' : ''}`}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full bg-primary-100 text-primary-700 shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <span className="font-medium text-slate-900">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="table-cell text-slate-500">{u.email}</td>
                    <td className="table-cell">{u.phone}</td>
                    <td className="table-cell"><RoleBadge role={u.role} /></td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditItem({ ...u }); setModalOpen(true) }}
                          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="Edit user">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteItem(u)}
                          className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                          title="Delete user">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null) }}
        title={editItem ? 'Edit User' : 'Create User'} size="md">
        <UserForm onSubmit={handleSubmit}
          defaultValues={editItem || { role: 'BUYER', active: true }}
          loading={formLoading} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete}
        loading={deleteLoading} title="Delete User"
        message={`Permanently delete ${deleteItem?.firstName} ${deleteItem?.lastName}? This cannot be undone.`} />
    </div>
  )
}
