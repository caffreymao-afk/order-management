import React, { useState, useEffect, useRef } from 'react'
import { ordersApi, exportsApi } from '../api'

interface ExportModalProps {
  onClose: () => void
  onExportSuccess: (isAsync: boolean) => void
}

const datePresets = ['今天', '昨天', '近7天', '本月', '上月', '自定义']

const fmt = (d: Date) => d.toLocaleDateString('sv-SE')
const todayStr = fmt(new Date())

function getPresetDates(preset: string) {
  const now = new Date()
  const today = fmt(now)
  switch (preset) {
    case '今天': return { start: today, end: today }
    case '昨天': { const d = new Date(now); d.setDate(d.getDate() - 1); const s = fmt(d); return { start: s, end: s } }
    case '近7天': { const d = new Date(now); d.setDate(d.getDate() - 6); return { start: fmt(d), end: today } }
    case '本月': return { start: today.slice(0, 7) + '-01', end: today }
    case '上月': {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: fmt(d), end: fmt(last) }
    }
    default: return { start: today, end: today }
  }
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExportSuccess }) => {
  const [datePreset, setDatePreset] = useState('今天')
  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(todayStr)
  const [orderStatus, setOrderStatus] = useState('全部')
  const [shop, setShop] = useState('全部门店')
  const [productName, setProductName] = useState('')
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx')
  const [shops, setShops] = useState<string[]>(['全部门店'])

  const [estimatedCount, setEstimatedCount] = useState<number | null>(null)
  const [overLimit, setOverLimit] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const estimateTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 获取门店列表
  useEffect(() => {
    ordersApi.getShops().then(setShops).catch(console.error)
  }, [])

  // 当筛选条件变化时，防抖预估数量
  useEffect(() => {
    if (estimateTimer.current) clearTimeout(estimateTimer.current)
    estimateTimer.current = setTimeout(async () => {
      setEstimating(true)
      try {
        const result = await ordersApi.estimate({
          startDate, endDate,
          orderStatus: orderStatus === '全部' ? undefined : orderStatus,
          shop: shop === '全部门店' ? undefined : shop,
          productName: productName || undefined,
        })
        setEstimatedCount(result.estimatedCount)
        setOverLimit(result.overLimit)
      } catch {
        setEstimatedCount(null)
      } finally {
        setEstimating(false)
      }
    }, 400)
    return () => { if (estimateTimer.current) clearTimeout(estimateTimer.current) }
  }, [startDate, endDate, orderStatus, shop, productName])

  const handleDatePreset = (p: string) => {
    setDatePreset(p)
    if (p !== '自定义') {
      const { start, end } = getPresetDates(p)
      setStartDate(start)
      setEndDate(end)
    }
  }

  const handleConfirm = async () => {
    if (overLimit || submitting) return
    setSubmitting(true)
    try {
      const result = await exportsApi.create({
        startDate, endDate,
        orderStatus: orderStatus === '全部' ? undefined : orderStatus,
        shop: shop === '全部门店' ? undefined : shop,
        productName: productName || undefined,
        format,
      })
      onClose()
      onExportSuccess(result.isAsync)

      // 同步导出：直接下载
      if (!result.isAsync && result.task.id) {
        window.open(exportsApi.getDownloadUrl(result.task.id), '_blank')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '导出失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const statusOptions = ['全部', '待支付', '已支付', '已完成', '已取消', '已退款']

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 540, padding: '28px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', position: 'relative' }}>
        {/* Header */}
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#222' }}>导出订单</h3>
        <p style={{ fontSize: 13, color: '#999', marginTop: 4, marginBottom: 0 }}>配置筛选条件，导出符合条件的订单数据（单次上限 10 万条）</p>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 28, height: 28, border: 'none', background: '#f5f5f5', borderRadius: '50%', cursor: 'pointer', fontSize: 16, color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

        <div style={{ height: 1, background: '#f0f0f0', margin: '16px 0' }} />

        {/* Time Range */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ color: '#FF4D4F', fontSize: 13 }}>*</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#222' }}>时间范围</span>
            <span style={{ fontSize: 12, color: '#999' }}>(必填)</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {datePresets.map(p => (
              <button key={p} onClick={() => handleDatePreset(p)} style={{ padding: '6px 16px', border: datePreset === p ? '1px solid #FF7800' : '1px solid #d9d9d9', borderRadius: 6, background: datePreset === p ? '#FFF3E8' : '#fff', color: datePreset === p ? '#FF7800' : '#444', fontSize: 13, cursor: 'pointer' }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input type="text" value={startDate} onChange={e => { setStartDate(e.target.value); setDatePreset('自定义') }} style={{ width: '100%', padding: '7px 32px 7px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13 }} />
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>📅</span>
            </div>
            <span style={{ color: '#666' }}>至</span>
            <div style={{ position: 'relative', flex: 1 }}>
              <input type="text" value={endDate} onChange={e => { setEndDate(e.target.value); setDatePreset('自定义') }} style={{ width: '100%', padding: '7px 32px 7px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13 }} />
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>📅</span>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#222', marginBottom: 10 }}>订单状态</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statusOptions.map(s => (
              <button key={s} onClick={() => setOrderStatus(s)} style={{ padding: '6px 16px', border: orderStatus === s ? '1px solid #FF7800' : '1px solid #d9d9d9', borderRadius: 6, background: orderStatus === s ? '#FFF3E8' : '#fff', color: orderStatus === s ? '#FF7800' : '#444', fontSize: 13, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Shop & Product */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#222', marginBottom: 8 }}>门店</div>
            <div style={{ position: 'relative' }}>
              <select value={shop} onChange={e => setShop(e.target.value)} style={{ width: '100%', padding: '7px 28px 7px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', fontSize: 13, appearance: 'none', cursor: 'pointer' }}>
                {shops.map(s => <option key={s}>{s}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none' }}>▾</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#222', marginBottom: 8 }}>商品名称</div>
            <input type="text" placeholder="模糊搜索商品名称..." value={productName} onChange={e => setProductName(e.target.value)} style={{ width: '100%', padding: '7px 12px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13, background: '#fafafa' }} />
          </div>
        </div>

        {/* Format */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#222', marginBottom: 10 }}>导出格式</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['xlsx', 'csv'] as const).map(f => (
              <label key={f} onClick={() => setFormat(f)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: format === f ? '1px solid #FF7800' : '1px solid #d9d9d9', borderRadius: 6, background: format === f ? '#FFF3E8' : '#fff', cursor: 'pointer' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${format === f ? '#FF7800' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {format === f && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF7800' }} />}
                </div>
                <span style={{ fontSize: 13, color: format === f ? '#FF7800' : '#444' }}>
                  {f === 'xlsx' ? 'Excel (.xlsx)' : 'CSV (.csv)'}
                </span>
                {f === 'xlsx' && <span style={{ background: '#FF7800', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>推荐</span>}
              </label>
            ))}
          </div>
        </div>

        {/* Info / Warning Box */}
        {overLimit ? (
          <div style={{ background: '#FFF0EE', border: '1px solid #FFCDC9', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span>🚫</span>
              <span style={{ fontSize: 14, color: '#D4380D', fontWeight: 600 }}>数据量超出限制</span>
            </div>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>
              当前条件预计导出 <span style={{ color: '#D4380D', fontWeight: 600 }}>约 {estimatedCount?.toLocaleString()} 条</span> 订单数据，超出单次上限 10 万条。
            </p>
            <ul style={{ fontSize: 12, color: '#888', paddingLeft: 16, lineHeight: 1.8 }}>
              <li>缩短时间范围（如按月分批导出）</li>
              <li>筛选特定订单状态</li>
              <li>指定单个门店</li>
            </ul>
          </div>
        ) : (
          <div style={{ background: '#FFFBE6', border: '1px solid #FFE58F', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ marginTop: 1 }}>⚠️</span>
              <div>
                <p style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>
                  {estimating ? '预估中...' : (
                    <>当前条件预计导出 <span style={{ color: '#FF7800', fontWeight: 600 }}>约 {estimatedCount ?? '--'} 条</span> 订单数据，文件将立即生成并下载。</>
                  )}
                </p>
                <ul style={{ fontSize: 12, color: '#888', paddingLeft: 16, lineHeight: 1.8 }}>
                  <li>数据量 ≤ 1000 条：同步生成，浏览器直接下载</li>
                  <li>数据量 &gt; 1000 条：异步生成，完成后站内通知，可在「导出记录」查看</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '0 24px', height: 38, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#444', fontSize: 14, cursor: 'pointer' }}>取消</button>
          <button onClick={handleConfirm} disabled={overLimit || submitting} style={{ padding: '0 24px', height: 38, border: 'none', borderRadius: 6, background: (overLimit || submitting) ? '#ccc' : '#FF7800', color: '#fff', fontSize: 14, fontWeight: 500, cursor: (overLimit || submitting) ? 'not-allowed' : 'pointer' }}>
            {submitting ? '导出中...' : '确认导出'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal
