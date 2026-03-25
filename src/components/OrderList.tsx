import React, { useState, useEffect, useCallback } from 'react'
import { ordersApi, OrderItem } from '../api'

interface OrderListProps {
  onExportOrder: () => void
  onExportRecords: () => void
}

const STATUS_COLOR: Record<string, string> = {
  '已完成': '#222',
  '已支付': '#222',
  '已取消': '#222',
  '待支付': '#222',
  '退款/售后': '#222',
  '处理中': '#222',
}

const datePresets = ['今天', '昨天', '近7天', '近30天', '本月']

const fmt = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getPresetDates(preset: string): { start: string; end: string } {
  const todayDate = new Date()
  const today = fmt(todayDate)

  switch (preset) {
    case '今天': return { start: today, end: today }
    case '昨天': {
      const d = new Date(todayDate); d.setDate(d.getDate() - 1)
      return { start: fmt(d), end: fmt(d) }
    }
    case '近7天': {
      const d = new Date(todayDate); d.setDate(d.getDate() - 6)
      return { start: fmt(d), end: today }
    }
    case '近30天': {
      const d = new Date(todayDate); d.setDate(d.getDate() - 29)
      return { start: fmt(d), end: today }
    }
    case '本月': return { start: today.slice(0, 7) + '-01', end: today }
    default: return { start: today, end: today }
  }
}

const OrderList: React.FC<OrderListProps> = ({ onExportOrder, onExportRecords }) => {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [shops, setShops] = useState<string[]>(['全部门店'])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 筛选条件
  const [datePreset, setDatePreset] = useState('今天')
  const [startDate, setStartDate] = useState(() => fmt(new Date()))
  const [endDate, setEndDate] = useState(() => fmt(new Date()))
  const [orderStatus, setOrderStatus] = useState('全部状态')
  const [shop, setShop] = useState('全部门店')
  const [productName, setProductName] = useState('')

  // 分页
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [jumpPage, setJumpPage] = useState('1')

  const totalPages = Math.ceil(total / pageSize) || 1

  // 获取订单列表
  const fetchOrders = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const result = await ordersApi.getList({
        page: p, pageSize,
        startDate, endDate,
        orderStatus: orderStatus === '全部状态' ? undefined : orderStatus,
        shop: shop === '全部门店' ? undefined : shop,
        productName: productName || undefined,
      })
      setOrders(result.list)
      setTotal(result.total)
    } catch (err) {
      console.error('获取订单失败:', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, startDate, endDate, orderStatus, shop, productName])

  // 获取门店列表
  useEffect(() => {
    ordersApi.getShops().then(setShops).catch(console.error)
  }, [])

  // 初始加载
  useEffect(() => {
    fetchOrders(1)
    setPage(1)
  }, []) // eslint-disable-line

  const handleSearch = () => {
    setPage(1)
    fetchOrders(1)
  }

  const handleReset = () => {
    setDatePreset('今天')
    setStartDate('2026-03-23')
    setEndDate('2026-03-23')
    setOrderStatus('全部状态')
    setShop('全部门店')
    setProductName('')
    setPage(1)
    setTimeout(() => fetchOrders(1), 0)
  }

  const handlePreset = (preset: string) => {
    setDatePreset(preset)
    const { start, end } = getPresetDates(preset)
    setStartDate(start)
    setEndDate(end)
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? orders.map(o => o.id) : [])
  }

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id))
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    setJumpPage(String(p))
    fetchOrders(p)
  }

  const handleJump = () => {
    const p = parseInt(jumpPage)
    if (!isNaN(p) && p >= 1 && p <= totalPages) handlePageChange(p)
  }

  const getStatusLabel = (o: OrderItem) => o.orderStatus === '退款/售后' ? '已退款' : o.orderStatus

  return (
    <div style={{ padding: 20 }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#222' }}>全部订单</h2>
          <span style={{ fontSize: 13, color: '#999' }}>共 {total} 条</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onExportOrder} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', height: 36, background: '#FF7800', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            导出订单
          </button>
          <button onClick={onExportRecords} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', height: 36, background: '#fff', color: '#555', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 14, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1" stroke="#666" strokeWidth="1.5"/><path d="M5 6h6M5 9h4" stroke="#666" strokeWidth="1.5" strokeLinecap="round"/></svg>
            导出记录
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 12, border: '1px solid #f0f0f0' }}>
        {/* Date Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: '#666', whiteSpace: 'nowrap' }}>下单时间</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {datePresets.map(p => (
              <button key={p} onClick={() => handlePreset(p)} style={{ padding: '4px 12px', height: 30, border: datePreset === p ? '1px solid #FF7800' : '1px solid #d9d9d9', borderRadius: 4, background: '#fff', color: datePreset === p ? '#FF7800' : '#444', fontSize: 13, cursor: 'pointer' }}>{p}</button>
            ))}
          </div>
          <input type="text" value={startDate} onChange={e => { setStartDate(e.target.value); setDatePreset('') }} style={{ padding: '4px 10px', height: 30, width: 120, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} />
          <span style={{ color: '#999', fontSize: 13 }}>至</span>
          <input type="text" value={endDate} onChange={e => { setEndDate(e.target.value); setDatePreset('') }} style={{ padding: '4px 10px', height: 30, width: 120, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }} />
        </div>
        {/* Status & Shop & Product */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#666' }}>订单状态</label>
            <div style={{ position: 'relative' }}>
              <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} style={{ appearance: 'none', padding: '4px 28px 4px 10px', height: 30, width: 110, border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', fontSize: 13, cursor: 'pointer' }}>
                {['全部状态', '待支付', '已支付', '处理中', '已完成', '已取消', '退款/售后'].map(s => <option key={s}>{s}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }}>▾</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#666' }}>门店</label>
            <div style={{ position: 'relative' }}>
              <select value={shop} onChange={e => setShop(e.target.value)} style={{ appearance: 'none', padding: '4px 28px 4px 10px', height: 30, width: 120, border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', fontSize: 13, cursor: 'pointer' }}>
                {shops.map(s => <option key={s}>{s}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999' }}>▾</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#666' }}>商品</label>
            <input type="text" placeholder="搜索商品名称..." value={productName} onChange={e => setProductName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} style={{ padding: '4px 10px', height: 30, width: 160, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, background: '#fafafa' }} />
          </div>
          <button onClick={handleSearch} style={{ padding: '0 20px', height: 30, background: '#FF7800', color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>查询</button>
          <button onClick={handleReset} style={{ padding: '0 16px', height: 30, background: '#fff', color: '#444', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>重置</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: 14 }}>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> 加载中...
          </div>
        )}
        {!loading && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px 16px', width: 40 }}>
                  <input type="checkbox" checked={orders.length > 0 && selectedIds.length === orders.length} onChange={e => handleSelectAll(e.target.checked)} style={{ cursor: 'pointer', accentColor: '#FF7800' }} />
                </th>
                {['订单编号', '下单时间', '商品名称', '实付金额', '优惠金额', '支付方式', '订单状态', '门店', '操作'].map(col => (
                  <th key={col} style={{ padding: '12px 12px', textAlign: 'left', fontSize: 13, color: '#888', fontWeight: 500, whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: '#bbb', fontSize: 14 }}>暂无数据</td></tr>
              ) : orders.map((order, idx) => {
                const isSelected = selectedIds.includes(order.id)
                const isRefund = order.payAmount < 0
                const isCancelled = order.orderStatus === '已取消'
                return (
                  <tr key={order.id}
                    style={{ background: isSelected ? '#FFF8F0' : '#fff', borderBottom: idx < orders.length - 1 ? '1px solid #f5f5f5' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#fafafa' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSelected ? '#FFF8F0' : '#fff' }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <input type="checkbox" checked={isSelected} onChange={e => handleSelect(order.id, e.target.checked)} style={{ cursor: 'pointer', accentColor: '#FF7800' }} />
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: '#333' }}>{order.orderNo}</td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: '#666' }}>{order.createTime}</td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: '#333' }}>{order.productName} ×{order.productCount}</td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: isRefund ? '#FF4D4F' : '#333', fontWeight: 500 }}>
                      {isRefund ? `−¥${Math.abs(order.payAmount).toFixed(2)}` : `¥${order.payAmount.toFixed(2)}`}
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: isCancelled ? '#bbb' : '#666', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                      {order.discountAmount > 0 ? `¥${order.discountAmount.toFixed(2)}` : '¥0.00'}
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: order.payMethod ? '#666' : '#bbb' }}>{order.payMethod || '待支付'}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: STATUS_COLOR[order.orderStatus] || '#222' }}>{getStatusLabel(order)}</span>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: '#555' }}>{order.shop}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ background: 'none', border: 'none', color: '#FF7800', fontSize: 13, cursor: 'pointer', padding: 0 }}>查看详情</button>
                        {(order.orderStatus === '已完成' || order.orderStatus === '已支付') && (
                          <button style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', padding: 0 }}>打印</button>
                        )}
                        {order.orderStatus === '待支付' && (
                          <button style={{ background: 'none', border: 'none', color: '#FF7800', fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 500 }}>催付</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 13, color: '#666' }}>已选 {selectedIds.length} 条 | 共 {total} 条</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PBtn label="«" onClick={() => handlePageChange(1)} disabled={page === 1} />
              <PBtn label="‹" onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(p => (
                <PBtn key={p} label={String(p)} onClick={() => handlePageChange(p)} active={page === p} />
              ))}
              {totalPages > 4 && <span style={{ padding: '0 4px', color: '#999' }}>···</span>}
              {totalPages > 3 && <PBtn label={String(totalPages)} onClick={() => handlePageChange(totalPages)} active={page === totalPages} />}
              <PBtn label="›" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
              <PBtn label="»" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 12, fontSize: 13, color: '#666' }}>
                每页 <select style={{ padding: '2px 6px', height: 28, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13 }}><option>10 条</option><option>20 条</option><option>50 条</option></select>
                跳至 <input type="text" value={jumpPage} onChange={e => setJumpPage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJump()} style={{ width: 44, height: 28, border: '1px solid #d9d9d9', borderRadius: 4, textAlign: 'center', fontSize: 13, padding: '0 4px' }} /> 页
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const PBtn: React.FC<{ label: string; onClick: () => void; active?: boolean; disabled?: boolean }> = ({ label, onClick, active, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{ width: 30, height: 30, border: active ? '1px solid #FF7800' : '1px solid #d9d9d9', borderRadius: 4, background: active ? '#FF7800' : '#fff', color: active ? '#fff' : disabled ? '#ccc' : '#444', fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{label}</button>
)

export default OrderList
