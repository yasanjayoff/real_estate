import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { profitApi, propertyApi, dealApi } from '../../api/services'
import { Modal, ConfirmDialog, EmptyState, PageLoader } from '../../components/common'
import {
  Plus, Pencil, Trash2, TrendingUp, DollarSign, Receipt,
  Layers, ChevronDown, ChevronUp, Percent, Hash,
  ArrowUpRight, ArrowDownRight, BarChart3,
  Calendar, FileText, Megaphone, Scale, Wrench, Package
} from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Constants ──────────────────────────────────────────────────────────────────
const EXPENSE_ROWS = [
  { key: 'advertisingExpense', label: 'Advertising',  Icon: Megaphone, color: 'text-pink-600',   bg: 'bg-pink-50'   },
  { key: 'legalExpense',       label: 'Legal & Docs', Icon: Scale,     color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'maintenanceExpense', label: 'Maintenance',  Icon: Wrench,    color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'otherExpense',       label: 'Other',        Icon: Package,   color: 'text-slate-600',  bg: 'bg-slate-100' },
]

const fmt  = (n) => Number(n || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })
const fmtD = (n) => Number(n || 0).toFixed(2)
const pct  = (n) => `${Number(n || 0).toFixed(2)}%`

// ─── Stat card ──────────────────────────────────────────────────────────────────
function Card({ title, value, sub, Icon, iconCls, positive }) {
  return (
    <div className="flex items-start gap-4 p-5 card">
      <div className={`p-2.5 rounded-xl ${iconCls}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium tracking-wide uppercase text-slate-500">{title}</p>
        <p className="text-lg font-display font-bold text-slate-900 mt-0.5 truncate">{value}</p>
        {sub && (
          <p className={`text-xs mt-0.5 ${positive === true ? 'text-green-600' : positive === false ? 'text-red-500' : 'text-slate-400'}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Live Calculation Preview ────────────────────────────────────────────────────
function LiveCalc({ salePrice, commissionType, commissionRate, fixedAmount, advExp, legExp, mntExp, othExp }) {
  const sp       = Number(salePrice || 0)
  const comm     = commissionType === 'PERCENTAGE'
    ? sp * Number(commissionRate || 0) / 100
    : Number(fixedAmount || 0)
  const totalExp = Number(advExp || 0) + Number(legExp || 0) + Number(mntExp || 0) + Number(othExp || 0)
  const net      = comm - totalExp
  const margin   = sp > 0 ? (net / sp) * 100 : 0

  return (
    <div className="p-4 space-y-3 border-2 rounded-xl border-primary-200 bg-gradient-to-r from-primary-50 to-indigo-50">
      <p className="text-xs font-bold text-primary-700 uppercase tracking-wider flex items-center gap-1.5">
        <BarChart3 size={12} /> Live Calculation Preview
      </p>
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-white/70 rounded-lg p-2.5 text-center">
          <div className="mb-1 text-xs text-slate-500">Sale Price</div>
          <div className="text-sm font-bold text-slate-800">LKR {fmt(sp)}</div>
        </div>
        <div className="bg-white/70 rounded-lg p-2.5 text-center">
          <div className="mb-1 text-xs text-blue-600">Commission</div>
          <div className="text-sm font-bold text-blue-800">LKR {fmt(comm)}</div>
          {commissionType === 'PERCENTAGE' && commissionRate > 0 && (
            <div className="text-xs text-blue-500">{fmtD(commissionRate)}%</div>
          )}
        </div>
        <div className="bg-white/70 rounded-lg p-2.5 text-center">
          <div className="mb-1 text-xs text-orange-600">Total Expenses</div>
          <div className="text-sm font-bold text-orange-700">LKR {fmt(totalExp)}</div>
        </div>
        <div className={`rounded-lg p-2.5 text-center ${net >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className={`text-xs mb-1 font-semibold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>Net Profit</div>
          <div className={`font-bold text-sm ${net >= 0 ? 'text-green-800' : 'text-red-700'}`}>LKR {fmt(net)}</div>
          <div className={`text-xs ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{pct(margin)}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Section heading helper ──────────────────────────────────────────────────────
function SectionHeading({ number, label, optional }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full bg-primary-600 shrink-0">
        {number}
      </span>
      <span className="text-xs font-bold tracking-widest uppercase text-slate-500">{label}</span>
      {optional && <span className="text-xs font-normal text-slate-400">(optional)</span>}
    </div>
  )
}

// ─── Profit Form ─────────────────────────────────────────────────────────────────
// KEY PROP on this component forces full remount when switching add↔edit,
// so useForm always picks up the correct defaultValues.
function ProfitForm({ onSubmit, defaultValues, properties, loading }) {
  const isEdit = !!defaultValues?.id

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: defaultValues ?? {
      commissionType:  'PERCENTAGE',
      transactionDate: new Date().toISOString().split('T')[0],
    }
  })

  const propertyId     = watch('propertyId')
  const commissionType = watch('commissionType')
  const salePrice      = watch('salePrice')
  const commRate       = watch('commissionRate')
  const fixedAmt       = watch('fixedCommissionAmount')
  const advExp         = watch('advertisingExpense')
  const legExp         = watch('legalExpense')
  const mntExp         = watch('maintenanceExpense')
  const othExp         = watch('otherExpense')

  const [deals, setDeals]           = useState([])
  const [loadingDeals, setLoadDeals] = useState(false)

  const selectedProp = properties.find(p => String(p.id) === String(propertyId))

  // Auto-fill sale price when property selected (create only)
  useEffect(() => {
    if (!selectedProp || isEdit) return
    const suggested = selectedProp.pricePerBlock || selectedProp.pricePerUnit || selectedProp.price
    if (suggested) setValue('salePrice', suggested)
  }, [propertyId])

  // Load deals for the selected property
  useEffect(() => {
    if (!propertyId) { setDeals([]); return }
    setLoadDeals(true)
    dealApi.getByProperty(propertyId)
      .then(r => setDeals(r.data.data || []))
      .catch(() => setDeals([]))
      .finally(() => setLoadDeals(false))
  }, [propertyId])

  const isPercentage = commissionType === 'PERCENTAGE'

  const impliedRate = salePrice && fixedAmt && Number(salePrice) > 0
    ? (Number(fixedAmt) / Number(salePrice) * 100).toFixed(3)
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">

      {/* ── 1. Property ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeading number="1" label="Select Property" />
        <div className="grid grid-cols-2 gap-4 mt-3">

          <div className="col-span-2">
            <label className="label">Property *</label>
            <select className={`input-field ${errors.propertyId ? 'input-error' : ''}`}
              {...register('propertyId', { required: 'Please select a property' })}>
              <option value="">— Choose a property —</option>
              {properties.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.propertyType === 'LAND' ? '🌿' : '🏢'} {p.title} — {p.city}
                  {p.pricePerBlock
                    ? ` · LKR ${fmt(p.pricePerBlock)}/block`
                    : p.pricePerUnit
                      ? ` · LKR ${fmt(p.pricePerUnit)}/unit`
                      : ` · LKR ${fmt(p.price)}`}
                </option>
              ))}
            </select>
            {errors.propertyId && <p className="error-msg">{errors.propertyId.message}</p>}
          </div>

          {/* Property banner */}
          {selectedProp && (
            <div className="flex items-center col-span-2 gap-3 p-3 border bg-slate-50 border-slate-200 rounded-xl">
              {selectedProp.images?.[0] && (
                <img src={selectedProp.images[0].imageData} alt=""
                  className="object-cover w-12 h-10 rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{selectedProp.title}</p>
                <p className="text-xs text-slate-500">{selectedProp.address}, {selectedProp.city}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">Listed price</p>
                <p className="text-sm font-bold text-primary-700">LKR {fmt(selectedProp.price)}</p>
              </div>
            </div>
          )}

          {/* Deal link */}
          <div className="col-span-2">
            <label className="label">
              Link to Deal
              <span className="ml-1 font-normal text-slate-400">(optional)</span>
            </label>
            <select className="input-field" {...register('dealId')}
              disabled={!propertyId || loadingDeals}>
              <option value="">No deal linked</option>
              {deals.map(d => (
                <option key={d.id} value={String(d.id)}>
                  Deal #{d.id} · {d.status} · LKR {fmt(d.offerPrice)}
                  {d.buyer ? ` · ${d.buyer.firstName} ${d.buyer.lastName}` : ''}
                </option>
              ))}
            </select>
            {!propertyId && (
              <p className="mt-1 text-xs text-slate-400">Select a property first to see its deals</p>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Commission ────────────────────────────────────────────────── */}
      <div className="pt-5 border-t border-slate-100">
        <SectionHeading number="2" label="Sale Price & Commission" />
        <div className="grid grid-cols-2 gap-4 mt-3">

          <div className="col-span-2">
            <label className="label">Sale / Transaction Price (LKR) *</label>
            <input type="number" className={`input-field ${errors.salePrice ? 'input-error' : ''}`}
              placeholder="e.g. 12500000"
              min="0"
              onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
              {...register('salePrice', {
                required: 'Sale price is required',
                min: { value: 1, message: 'Must be positive' }
              })} />
            {errors.salePrice && <p className="error-msg">{errors.salePrice.message}</p>}
          </div>

          {/* Commission type cards */}
          <div className="col-span-2">
            <label className="label">Commission Type *</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { val: 'PERCENTAGE', Icon: Percent, title: '% Percentage',   desc: 'Calculated as % of the sale price' },
                { val: 'FIXED',      Icon: Hash,    title: '# Fixed Amount', desc: 'A flat fixed commission value'     },
              ].map(({ val, Icon: Ico, title, desc }) => (
                <label key={val}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all select-none
                    ${commissionType === val
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <input type="radio" value={val} className="mt-0.5 accent-primary-600"
                    {...register('commissionType')} />
                  <div>
                    <div className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                      <Ico size={13} className="text-primary-600" />{title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Percentage input */}
          {isPercentage && (
            <div className="col-span-2">
              <label className="label">Commission Rate (%) *</label>
              <div className="relative">
                <input type="number" step="0.01"
                  className={`input-field pr-10 ${errors.commissionRate ? 'input-error' : ''}`}
                  placeholder="e.g. 2.50"
                  min="0"
                  onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                  {...register('commissionRate', {
                    required: isPercentage ? 'Rate is required' : false,
                    min: { value: 0.01, message: 'Must be > 0' },
                    max: { value: 100,  message: 'Max 100%' }
                  })} />
                <span className="absolute text-sm font-semibold -translate-y-1/2 right-3 top-1/2 text-slate-400">%</span>
              </div>
              {errors.commissionRate && <p className="error-msg">{errors.commissionRate.message}</p>}
              {salePrice && commRate && (
                <p className="mt-1 text-xs font-medium text-primary-600">
                  → Commission: LKR {fmt(Number(salePrice) * Number(commRate) / 100)}
                </p>
              )}
            </div>
          )}

          {/* Fixed amount input */}
          {!isPercentage && (
            <div className="col-span-2">
              <label className="label">Fixed Commission Amount (LKR) *</label>
              <div className="relative">
                <input type="number"
                  className={`input-field pr-16 ${errors.fixedCommissionAmount ? 'input-error' : ''}`}
                  placeholder="e.g. 250000"
                  min="0"
                  onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                  {...register('fixedCommissionAmount', {
                    required: !isPercentage ? 'Amount is required' : false,
                    min: { value: 1, message: 'Must be positive' }
                  })} />
                <span className="absolute text-xs font-medium -translate-y-1/2 right-3 top-1/2 text-slate-400">LKR</span>
              </div>
              {errors.fixedCommissionAmount && <p className="error-msg">{errors.fixedCommissionAmount.message}</p>}
              {impliedRate && (
                <p className="mt-1 text-xs text-slate-400">
                  Implied rate: <span className="font-semibold text-slate-600">{impliedRate}%</span> of sale price
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Expenses ──────────────────────────────────────────────────── */}
      <div className="pt-5 border-t border-slate-100">
        <SectionHeading number="3" label="Expense Breakdown" optional />
        <div className="grid grid-cols-2 gap-3 mt-3">
          {EXPENSE_ROWS.map(({ key, label, Icon: Ico, color, bg }) => (
            <div key={key}>
              <label className="label flex items-center gap-1.5">
                <span className={`p-1 rounded ${bg}`}><Ico size={11} className={color} /></span>
                {label}
              </label>
              <input type="number" className="input-field" placeholder="0"
                min="0"
                onKeyDown={(e) => { if (e.key === '-') e.preventDefault() }}
                {...register(key, { min: { value: 0, message: 'Cannot be negative' } })} />
              {errors[key] && <p className="error-msg">{errors[key].message}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Details ───────────────────────────────────────────────────── */}
      <div className="pt-5 border-t border-slate-100">
        <SectionHeading number="4" label="Details" />
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <label className="label flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" />Transaction Date
            </label>
            <input type="date" className="input-field" {...register('transactionDate')} />
          </div>
          <div className="col-span-2">
            <label className="label flex items-center gap-1.5">
              <FileText size={12} className="text-slate-400" />Notes
            </label>
            <textarea className="resize-none input-field" rows={2}
              placeholder="Any additional notes about this record…"
              {...register('notes')} />
          </div>
        </div>
      </div>

      {/* Live preview */}
      <LiveCalc
        salePrice={salePrice}
        commissionType={commissionType}
        commissionRate={commRate}
        fixedAmount={fixedAmt}
        advExp={advExp}
        legExp={legExp}
        mntExp={mntExp}
        othExp={othExp}
      />

      <div className="flex justify-end pt-2 border-t border-slate-100">
        <button type="submit" disabled={loading} className="px-6 btn-primary">
          {loading && (
            <span className="inline-block w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
          )}
          {isEdit ? 'Update Record' : 'Save Profit Record'}
        </button>
      </div>
    </form>
  )
}

// ─── Expanded row detail ────────────────────────────────────────────────────────
function RowDetail({ p }) {
  const hasExp = EXPENSE_ROWS.some(r => Number(p[r.key]) > 0)
  return (
    <div className="grid grid-cols-3 gap-5 px-6 py-4 text-sm border-t bg-slate-50 border-slate-100">

      {/* Commission detail */}
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-wider uppercase text-slate-400">Commission Detail</p>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Commission Type</span>
          <span className="flex items-center gap-1 font-medium">
            {p.commissionType === 'PERCENTAGE'
              ? <><Percent size={10} className="text-primary-500" />{fmtD(p.commissionRate)}%</>
              : <><Hash size={10} className="text-primary-500" />Fixed</>}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Sale Price</span>
          <span className="font-semibold">LKR {fmt(p.salePrice)}</span>
        </div>
        <div className="flex justify-between pt-1 text-xs border-t border-slate-200">
          <span className="font-medium text-slate-500">Commission Earned</span>
          <span className="font-bold text-blue-700">LKR {fmt(p.commissionAmount)}</span>
        </div>
      </div>

      {/* Expenses */}
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-wider uppercase text-slate-400">Expense Breakdown</p>
        {hasExp
          ? EXPENSE_ROWS.map(({ key, label, Icon: Ico, color }) => Number(p[key]) > 0 && (
            <div key={key} className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500">
                <Ico size={10} className={color} />{label}
              </span>
              <span className={`font-medium ${color}`}>LKR {fmt(p[key])}</span>
            </div>
          ))
          : <p className="text-xs text-slate-400">No expenses recorded</p>
        }
        {hasExp && (
          <div className="flex justify-between pt-1 text-xs border-t border-slate-200">
            <span className="font-semibold text-slate-600">Total Expenses</span>
            <span className="font-bold text-orange-700">LKR {fmt(p.totalExpenses)}</span>
          </div>
        )}
      </div>

      {/* Result + notes */}
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-wider uppercase text-slate-400">Result</p>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Profit Margin</span>
          <span className={`font-bold ${Number(p.profitMargin) >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {pct(p.profitMargin)}
          </span>
        </div>
        {p.deal && (
          <div className="text-xs">
            <span className="text-slate-500">Linked Deal: </span>
            <span className="font-medium">#{p.deal.id} · {p.deal.status}</span>
          </div>
        )}
        {p.notes && (
          <div className="mt-1 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 leading-relaxed">
            {p.notes}
          </div>
        )}
        <p className="pt-1 text-xs text-slate-400">
          Added {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfitsPage() {
  const [profits, setProfits]         = useState([])
  const [properties, setProperties]   = useState([])
  const [summary, setSummary]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editItem, setEditItem]       = useState(null)   // null = create, object = edit
  const [deleteItem, setDeleteItem]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)

  // Filters
  const [fProp, setFProp]   = useState('')
  const [fMonth, setFMonth] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, propRes, sRes] = await Promise.all([
        profitApi.getAll(),
        propertyApi.getAll(),
        profitApi.getSummary(),
      ])
      setProfits(pRes.data.data || [])
      setProperties(propRes.data.data || [])
      setSummary(sRes.data.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => profits.filter(p => {
    if (fProp  && String(p.property?.id) !== fProp)                return false
    if (fMonth && p.transactionDate?.substring(0, 7) !== fMonth)   return false
    return true
  }), [profits, fProp, fMonth])

  const months = useMemo(() =>
    [...new Set(profits.map(p => p.transactionDate?.substring(0, 7)).filter(Boolean))].sort().reverse(),
    [profits])

  const handleSubmit = async (data) => {
    setFormLoading(true)
    try {
      const payload = {
        propertyId:            Number(data.propertyId),
        dealId:                data.dealId ? Number(data.dealId) : null,
        salePrice:             Number(data.salePrice),
        commissionType:        data.commissionType,
        commissionRate:        data.commissionType === 'PERCENTAGE' ? Number(data.commissionRate || 0) : null,
        fixedCommissionAmount: data.commissionType === 'FIXED' ? Number(data.fixedCommissionAmount || 0) : null,
        // incomeType removed — default to COMMISSION on backend
        incomeType:            'COMMISSION',
        advertisingExpense:    Number(data.advertisingExpense || 0),
        legalExpense:          Number(data.legalExpense || 0),
        maintenanceExpense:    Number(data.maintenanceExpense || 0),
        otherExpense:          Number(data.otherExpense || 0),
        transactionDate:       data.transactionDate || null,
        notes:                 data.notes || '',
      }
      if (editItem) {
        await profitApi.update(editItem.id, payload)
        toast.success('Profit record updated')
      } else {
        await profitApi.create(payload)
        toast.success('Profit record saved!')
      }
      setModalOpen(false)
      setEditItem(null)
      load()
    } finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await profitApi.delete(deleteItem.id)
      toast.success('Record deleted')
      setDeleteItem(null)
      load()
    } finally { setDeleteLoading(false) }
  }

  const openEdit = (p) => {
    setEditItem({
      id:                    p.id,
      // Must be strings — HTML select option values are always strings
      propertyId:            String(p.property?.id ?? ''),
      dealId:                p.deal?.id ? String(p.deal.id) : '',
      // Numeric fields — coerce to plain JS numbers so inputs render correctly
      salePrice:             Number(p.salePrice),
      commissionType:        p.commissionType,                // 'PERCENTAGE' or 'FIXED'
      commissionRate:        p.commissionType === 'PERCENTAGE' ? Number(p.commissionRate) : '',
      fixedCommissionAmount: p.commissionType === 'FIXED'     ? Number(p.commissionAmount) : '',
      advertisingExpense:    Number(p.advertisingExpense) > 0 ? Number(p.advertisingExpense) : '',
      legalExpense:          Number(p.legalExpense)       > 0 ? Number(p.legalExpense)       : '',
      maintenanceExpense:    Number(p.maintenanceExpense) > 0 ? Number(p.maintenanceExpense) : '',
      otherExpense:          Number(p.otherExpense)       > 0 ? Number(p.otherExpense)       : '',
      transactionDate:       p.transactionDate || '',
      notes:                 p.notes || '',
    })
    setModalOpen(true)
  }

  const totals = useMemo(() => ({
    salePrice:        filtered.reduce((s, p) => s + Number(p.salePrice || 0), 0),
    commissionAmount: filtered.reduce((s, p) => s + Number(p.commissionAmount || 0), 0),
    totalExpenses:    filtered.reduce((s, p) => s + Number(p.totalExpenses || 0), 0),
    netProfit:        filtered.reduce((s, p) => s + Number(p.netProfit || 0), 0),
    avgMargin:        filtered.length > 0
      ? filtered.reduce((s, p) => s + Number(p.profitMargin || 0), 0) / filtered.length
      : 0,
  }), [filtered])

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Profit & Commission Tracking</h1>
          <p className="text-sm text-slate-500">
            {profits.length} record{profits.length !== 1 ? 's' : ''} · Admin only
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditItem(null); setModalOpen(true) }}>
          <Plus size={16} /> Add Record
        </button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <Card title="Total Net Profit"
            value={`LKR ${fmt(summary.totalNetProfit)}`}
            sub={`${pct(summary.avgProfitMargin)} avg margin`}
            positive={Number(summary.totalNetProfit) >= 0}
            Icon={TrendingUp} iconCls="bg-green-500" />
          <Card title="Total Commission"
            value={`LKR ${fmt(summary.totalCommission)}`}
            sub={`${summary.totalRecords} records`}
            Icon={DollarSign} iconCls="bg-blue-500" />
          <Card title="Total Expenses"
            value={`LKR ${fmt(summary.totalExpenses)}`}
            sub="All categories combined"
            positive={false}
            Icon={Receipt} iconCls="bg-orange-500" />
          <Card title="Total Sale Value"
            value={`LKR ${fmt(summary.totalSaleValue)}`}
            sub={`${summary.totalRecords} transactions`}
            Icon={Layers} iconCls="bg-purple-500" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 card">
        <select className="input-field w-auto min-w-[160px]" value={fProp}
          onChange={e => setFProp(e.target.value)}>
          <option value="">All Properties</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select className="w-auto input-field" value={fMonth}
          onChange={e => setFMonth(e.target.value)}>
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {(fProp || fMonth) && (
          <button onClick={() => { setFProp(''); setFMonth('') }}
            className="text-xs underline transition-colors text-slate-400 hover:text-red-500">
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} of {profits.length} shown
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden card">
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No profit records"
            message={profits.length > 0
              ? 'No records match your filters.'
              : 'Select a property and add your first profit record.'}
            action={profits.length === 0 && (
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Add Record
              </button>
            )} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Property</th>
                  <th className="table-header">Sale Price</th>
                  <th className="table-header">Commission</th>
                  <th className="table-header">Expenses</th>
                  <th className="table-header">Net Profit</th>
                  <th className="table-header">Margin</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const isExpanded = expandedRow === p.id
                  const netPos = Number(p.netProfit) >= 0
                  return [
                    <tr key={p.id}
                      onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <span className="text-base shrink-0">
                            {p.property?.propertyType === 'LAND' ? '🌿' : '🏢'}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 text-sm truncate max-w-[160px]">
                              {p.property?.title || '—'}
                            </div>
                            <div className="text-xs text-slate-400">{p.property?.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-sm font-medium">
                        LKR {fmt(p.salePrice)}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm font-semibold text-blue-700">
                          LKR {fmt(p.commissionAmount)}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5">
                          {p.commissionType === 'PERCENTAGE'
                            ? <><Percent size={9} />{fmtD(p.commissionRate)}%</>
                            : <><Hash size={9} />Fixed</>}
                        </div>
                      </td>
                      <td className="table-cell">
                        {Number(p.totalExpenses) > 0
                          ? <span className="text-sm font-medium text-orange-600">LKR {fmt(p.totalExpenses)}</span>
                          : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="table-cell">
                        <div className={`font-bold text-sm flex items-center gap-0.5 ${netPos ? 'text-green-700' : 'text-red-600'}`}>
                          {netPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          LKR {fmt(p.netProfit)}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`text-sm font-semibold ${netPos ? 'text-green-600' : 'text-red-500'}`}>
                          {pct(p.profitMargin)}
                        </span>
                      </td>
                      <td className="table-cell text-sm text-slate-500">
                        {p.transactionDate
                          ? new Date(p.transactionDate + 'T00:00:00').toLocaleDateString(
                              'en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
                          : '—'}
                      </td>
                      <td className="table-cell" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setExpandedRow(isExpanded ? null : p.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors" title="Details">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteItem(p)}
                            className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>,

                    isExpanded && (
                      <tr key={`${p.id}-exp`}>
                        <td colSpan={8} className="p-0 border-b border-slate-100">
                          <RowDetail p={p} />
                        </td>
                      </tr>
                    ),
                  ]
                })}
              </tbody>

              {/* Totals footer */}
              {filtered.length > 1 && (
                <tfoot>
                  <tr className="text-sm font-semibold border-t-2 bg-slate-50 border-slate-200">
                    <td className="table-cell text-slate-700">
                      Totals <span className="font-normal text-slate-400">({filtered.length})</span>
                    </td>
                    <td className="table-cell text-slate-800">LKR {fmt(totals.salePrice)}</td>
                    <td className="table-cell text-blue-700">LKR {fmt(totals.commissionAmount)}</td>
                    <td className="table-cell text-orange-600">LKR {fmt(totals.totalExpenses)}</td>
                    <td className="table-cell text-green-700">LKR {fmt(totals.netProfit)}</td>
                    <td className="table-cell text-green-600">{pct(totals.avgMargin)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Form modal — key forces remount so useForm re-initialises with correct defaultValues */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditItem(null) }}
        title={editItem ? 'Edit Profit Record' : 'New Profit Record'} size="xl">
        <ProfitForm
          key={editItem?.id ?? 'new'}
          onSubmit={handleSubmit}
          defaultValues={editItem}
          properties={properties}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete} loading={deleteLoading}
        title="Delete Profit Record"
        message={`Delete profit record for "${deleteItem?.property?.title}"? LKR ${fmt(deleteItem?.netProfit)} net profit will be removed from totals.`} />
    </div>
  )
}