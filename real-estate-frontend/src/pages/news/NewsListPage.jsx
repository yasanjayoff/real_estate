import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { newsEventApi } from '../../api/services'
import { Calendar, Newspaper, MapPin, Clock, ChevronRight, Search, Loader2 } from 'lucide-react'
import Header from "../../Header";
import Footer from "../../Footer";

export default function NewsListPage() {
  const [items, setItems]       = useState([])
  const [filtered, setFiltered] = useState([])
  const [tab, setTab]           = useState('ALL')
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    newsEventApi.getAll()
      .then(r => { setItems(r.data); setFiltered(r.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = items
    if (tab !== 'ALL') result = result.filter(i => i.type === tab)
    if (search.trim())
      result = result.filter(
        i => i.title.toLowerCase().includes(search.toLowerCase()) ||
             (i.summary || '').toLowerCase().includes(search.toLowerCase())
      )
    setFiltered(result)
  }, [tab, search, items])

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const formatEventDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-white to-gray-100 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">News & Events</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Stay up to date with the latest announcements, property launches, and upcoming events.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search news or events..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2.5
                         text-sm text-gray-800 placeholder-gray-400 focus:outline-none
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'NEWS', 'EVENT'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition
                  ${tab === t
                    ? t === 'EVENT'
                      ? 'bg-purple-600 text-white'
                      : t === 'NEWS'
                      ? 'bg-sky-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
                  }`}
              >
                {t === 'ALL' ? 'All' : t === 'NEWS' ? '📰 News' : '📅 Events'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Newspaper size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => (
              <NewsCard
                key={item.id}
                item={item}
                onView={() => navigate(`/news/${item.id}`)}
                formatDate={formatDate}
                formatEventDate={formatEventDate}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function NewsCard({ item, onView, formatDate, formatEventDate }) {
  const isEvent = item.type === 'EVENT'
  const preview = item.summary || item.content?.substring(0, 120) + '...'

  return (
    <div
      onClick={onView}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden
                 hover:border-gray-400 hover:shadow-xl hover:shadow-gray-200/60
                 cursor-pointer transition-all duration-200 flex flex-col"
    >
      {/* Cover image or placeholder */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className={`h-44 w-full flex items-center justify-center
          ${isEvent ? 'bg-gradient-to-br from-purple-100 to-violet-50'
                    : 'bg-gradient-to-br from-sky-100 to-blue-50'}`}>
          {isEvent ? <Calendar size={40} className="text-purple-400 opacity-60" />
                   : <Newspaper size={40} className="text-sky-400 opacity-60" />}
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* Badge + date */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide
            ${isEvent ? 'bg-purple-100 text-purple-700'
                      : 'bg-sky-100 text-sky-700'}`}>
            {isEvent ? '📅 Event' : '📰 News'}
          </span>
          <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
        </div>

        <h3 className="text-gray-900 font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
          {preview}
        </p>

        {/* Event-specific meta */}
        {isEvent && (
          <div className="mt-3 space-y-1">
            {item.eventDate && (
              <div className="flex items-center gap-1.5 text-xs text-purple-600">
                <Clock size={12} />
                <span>{formatEventDate(item.eventDate)}</span>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={12} />
                <span className="truncate">{item.location}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center text-xs font-medium text-blue-500 group-hover:text-blue-600">
          Read more <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}