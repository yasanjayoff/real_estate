import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { newsEventApi } from "../../api/services";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Newspaper,
  Loader2,
  AlertCircle,
  Home,
  ChevronRight,
} from "lucide-react";

const fmt = (iso, opts) =>
  iso ? new Date(iso).toLocaleString("en-US", opts) : "";

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    newsEventApi
      .getById(id)
      .then((r) => setItem(r.data))
      .catch(() => setError("This article could not be found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f2f0eb" }}
      >
        <Loader2 size={36} className="animate-spin text-green-600" />
      </div>
    );

  if (error || !item)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400"
        style={{ background: "#f2f0eb" }}
      >
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-lg text-slate-600">{error || "Item not found."}</p>
        <button
          onClick={() => navigate("/news")}
          className="text-green-600 hover:underline text-sm font-medium"
        >
          ← Back to News & Events
        </button>
      </div>
    );

  const isEvent = item.type === "EVENT";

  return (
    <div className="min-h-screen" style={{ background: "#f2f0eb" }}>
      {/* Top Navigation Bar */}
      <nav style={{ background: "#1a2234", borderBottom: "1px solid #2d3f5c" }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
              <Home size={15} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">RealEstate Pro</span>
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link to="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <ChevronRight size={14} />
            <Link to="/news" className="hover:text-white transition">
              News & Events
            </Link>
            <ChevronRight size={14} />
            <span className="text-white truncate max-w-48">{item.title}</span>
          </div>
          <Link
            to="/news"
            className="text-sm text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-700 flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> All Posts
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back link */}
        <button
          onClick={() => navigate("/news")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition text-sm mb-8 font-medium"
        >
          <ArrowLeft size={16} /> Back to News & Events
        </button>

        {/* Article card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
          {/* Cover image */}
          {item.imageUrl && (
            <div className="h-80 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Badge */}
            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5
                rounded-full uppercase tracking-wide
                ${isEvent ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}
              >
                {isEvent ? (
                  <>
                    <Calendar size={12} /> Event
                  </>
                ) : (
                  <>
                    <Newspaper size={12} /> News
                  </>
                )}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-5 leading-tight">
              {item.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-100">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-green-600" />
                <span className="text-slate-600">Published</span>
                <span className="font-medium text-slate-700">
                  {fmt(item.createdAt, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Updated{" "}
                  {fmt(item.updatedAt, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                ${isEvent ? "bg-purple-100 text-purple-600" : "bg-sky-100 text-sky-600"}`}
              >
                {isEvent ? "Event" : "News Article"}
              </span>
            </div>

            {/* Event details card */}
            {isEvent && (item.eventDate || item.location) && (
              <div className="mb-8 p-5 rounded-xl bg-purple-50 border border-purple-200">
                <h3 className="text-purple-700 font-semibold mb-3 text-sm uppercase tracking-wider">
                  Event Details
                </h3>
                <div className="space-y-2">
                  {item.eventDate && (
                    <div className="flex items-center gap-2.5 text-slate-700 text-sm">
                      <Calendar
                        size={16}
                        className="text-purple-500 shrink-0"
                      />
                      <span className="font-medium">
                        {fmt(item.eventDate, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center gap-2.5 text-slate-700 text-sm">
                      <MapPin size={16} className="text-purple-500 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {item.summary && (
              <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium border-l-4 border-green-500 pl-5 bg-green-50/50 py-3 rounded-r-lg">
                {item.summary}
              </p>
            )}

            {/* Full content */}
            <div className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
              {item.content}
            </div>

            {/* Footer CTA */}
            <div className="mt-14 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-400 text-sm">
                Want to see more news and events?
              </p>
              <button
                onClick={() => navigate("/news")}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold
                           rounded-xl transition flex items-center gap-2"
              >
                Browse All News & Events <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
