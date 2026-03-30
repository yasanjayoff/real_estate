import { useState, useEffect, useRef } from 'react'
import { newsEventApi } from '../../api/services'
import toast from 'react-hot-toast'
import {
  Plus, Pencil, Trash2, Eye, Calendar, Newspaper, Loader2,
  MapPin, Clock, X, Save, Mail, ChevronDown, Upload, ImageIcon,
  ExternalLink,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EMPTY_FORM = {
  title: '', summary: '', content: '', type: 'NEWS',
  imageUrl: '', imageBase64: '', eventDate: '', location: '',
}

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''

const fmtEvent = (iso) =>
  iso ? new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : ''

const toInputDatetime = (iso) => iso ? iso.slice(0, 16) : ''

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

export default function NewsEventsAdminPage() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('ALL')
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [imgPreview, setImgPreview] = useState(null)
  const [imgMode, setImgMode]   = useState('url')
  const fileRef = useRef(null)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    newsEventApi.getAll()
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load news & events'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const visible = tab === 'ALL' ? items : items.filter(i => i.type === tab)

  const openCreate = () => {
    setForm(EMPTY_FORM); setImgPreview(null); setImgMode('url'); setModal('create')
  }
  const openEdit = (item) => {
    setSelected(item)
    setForm({
      title: item.title, summary: item.summary || '', content: item.content,
      type: item.type, imageUrl: item.imageUrl || '', imageBase64: '',
      eventDate: toInputDatetime(item.eventDate), location: item.location || '',
    })
    setImgPreview(item.imageUrl || null)
    setImgMode('url')
    setModal('edit')
  }
  const openDelete = (item) => { setSelected(item); setModal('delete') }
  const close = () => { setModal(null); setSelected(null); setImgPreview(null) }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    try {
      const base64 = await fileToBase64(file)
      setForm(f => ({ ...f, imageBase64: base64, imageUrl: '' }))
      setImgPreview(base64)
      toast.success('Image loaded ✓')
    } catch { toast.error('Failed to read image') }
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required'); return
    }
    setSaving(true)
    // Store base64 in imageUrl field if file was uploaded
    const imageUrl = form.imageBase64 ? form.imageBase64 : form.imageUrl
    const payload = {
      title: form.title, summary: form.summary, content: form.content,
      type: form.type, imageUrl,
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
      location: form.location,
    }
    try {
      if (modal === 'create') {
        await newsEventApi.create(payload)
        toast.success('Published! Email notifications sent to all users 📧')
      } else {
        await newsEventApi.update(selected.id, payload)
        toast.success('Updated successfully')
      }
      load(); close()
    } catch { toast.error('Operation failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await newsEventApi.delete(selected.id)
      toast.success('Deleted successfully')
      load(); close()
    } catch { toast.error('Delete failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News & Events</h1>
          <p className="text-gray-500 text-sm mt-0.5">Publishing a new item emails all registered users automatically.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/news')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition">
            <ExternalLink size={15} /> Public View
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition">
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Posts',   value: items.length,                               color: 'text-blue-600'   },
          { label: 'News Articles', value: items.filter(i => i.type === 'NEWS').length,  color: 'text-sky-600'    },
          { label: 'Events',        value: items.filter(i => i.type === 'EVENT').length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {['ALL', 'NEWS', 'EVENT'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}>
            {t === 'ALL' ? 'All' : t === 'NEWS' ? '📰 News' : '📅 Events'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={30} className="animate-spin text-blue-500" /></div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Newspaper size={36} className="mx-auto mb-3 opacity-30" /><p>No posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3.5 text-gray-500 font-medium w-16">Image</th>
                <th className="text-left px-4 py-3.5 text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3.5 text-gray-500 font-medium">Type</th>
                <th className="text-left px-4 py-3.5 text-gray-500 font-medium">Date</th>
                <th className="text-right px-4 py-3.5 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-12 h-10 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImageIcon size={14} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-xs">{item.title}</div>
                    {item.summary && <div className="text-gray-400 text-xs mt-0.5 truncate max-w-xs">{item.summary}</div>}
                    {item.type === 'EVENT' && item.location && (
                      <div className="flex items-center gap-1 text-purple-600 text-xs mt-1">
                        <MapPin size={11} />{item.location}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                      ${item.type === 'EVENT' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>
                      {item.type === 'EVENT' ? <><Calendar size={11} />Event</> : <><Newspaper size={11} />News</>}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">
                    {item.type === 'EVENT' && item.eventDate
                      ? <span className="flex items-center gap-1"><Clock size={12}/>{fmtEvent(item.eventDate)}</span>
                      : fmt(item.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/news/${item.id}`)} title="Preview"
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(item)} title="Edit"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => openDelete(item)} title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <Modal onClose={close}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{modal === 'create' ? '+ New News / Event' : 'Edit Post'}</h2>
            <button onClick={close} className="text-gray-400 hover:text-gray-700 transition"><X size={20} /></button>
          </div>

          {modal === 'create' && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
              <Mail size={16} className="shrink-0 mt-0.5" />
              <span>All registered users will receive an email notification when you publish this post.</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="form-label">Type</label>
              <div className="relative">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="form-input appearance-none pr-9">
                  <option value="NEWS">📰 News Article</option>
                  <option value="EVENT">📅 Event</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Enter title..." value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            {/* Summary */}
            <div>
              <label className="form-label">Summary <span className="text-gray-400">(shown in email & list)</span></label>
              <input className="form-input" placeholder="Short preview sentence..." value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
            </div>

            {/* Content */}
            <div>
              <label className="form-label">Full Content *</label>
              <textarea rows={6} className="form-input resize-none"
                placeholder="Write the full article or event description..." value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </div>

            {/* Cover Image */}
            <div>
              <label className="form-label">Cover Image</label>
              <div className="flex gap-2 mb-3">
                {['upload', 'url'].map(mode => (
                  <button key={mode} type="button"
                    onClick={() => {
                      setImgMode(mode)
                      if (mode === 'url') { setForm(f => ({ ...f, imageBase64: '' })); setImgPreview(form.imageUrl || null) }
                      else { setForm(f => ({ ...f, imageUrl: '' })); setImgPreview(null) }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition
                      ${imgMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-800'}`}>
                    {mode === 'upload' ? '📁 Upload File' : '🔗 Image URL'}
                  </button>
                ))}
              </div>

              {imgMode === 'upload' ? (
                <div>
                  <div onClick={() => fileRef.current?.click()}
                    className="relative border-2 border-dashed border-gray-300 rounded-xl p-6
                               flex flex-col items-center justify-center gap-2 cursor-pointer
                               hover:border-blue-400 hover:bg-blue-50 transition-all group">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {imgPreview && form.imageBase64 ? (
                      <img src={imgPreview} alt="Preview" className="w-full max-h-40 object-cover rounded-lg" />
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400 group-hover:text-blue-500 transition" />
                        <p className="text-gray-500 text-sm text-center">
                          <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop<br/>
                          <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB — stored in database</span>
                        </p>
                      </>
                    )}
                  </div>
                  {form.imageBase64 && (
                    <button type="button" onClick={() => { setForm(f => ({ ...f, imageBase64: '' })); setImgPreview(null) }}
                      className="mt-2 text-xs text-red-500 hover:text-red-400 flex items-center gap-1">
                      <X size={12} /> Remove image
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <input className="form-input" placeholder="https://example.com/image.jpg" value={form.imageUrl}
                    onChange={e => {
                      setForm(f => ({ ...f, imageUrl: e.target.value, imageBase64: '' }))
                      setImgPreview(e.target.value || null)
                    }} />
                  {imgPreview && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                      <img src={imgPreview} alt="URL preview" className="w-full max-h-40 object-cover"
                        onError={() => setImgPreview(null)} />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Event-specific fields */}
            {form.type === 'EVENT' && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="col-span-2 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Event Details</div>
                <div>
                  <label className="form-label">Event Date & Time</label>
                  <input type="datetime-local" className="form-input" value={form.eventDate}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Location / Venue</label>
                  <input className="form-input" placeholder="e.g. City Hall, Zoom link..." value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={close} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {modal === 'create' ? 'Publish & Notify Users' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal onClose={close} maxWidth="max-w-md">
          <div className="text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Post?</h2>
            <p className="text-gray-500 text-sm mb-6">
              <span className="font-medium text-gray-900">"{selected?.title}"</span> will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={close} className="btn-secondary px-6">Cancel</button>
              <button onClick={handleDelete} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition">
                {saving ? <Loader2 size={14} className="animate-spin" /> : null} Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose, maxWidth = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`w-full ${maxWidth} bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}