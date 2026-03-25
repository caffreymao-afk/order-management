import React from 'react'

type PageType = 'orders' | 'export-records'
type OrderFilterType = 'all' | 'pending-pay' | 'processing' | 'completed' | 'cancelled' | 'refund'

interface SidebarProps {
  currentPage: PageType
  orderFilter: OrderFilterType
  onPageChange: (page: PageType) => void
  onFilterChange: (filter: OrderFilterType) => void
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, orderFilter, onPageChange, onFilterChange }) => {
  const orderMenuItems: { key: OrderFilterType; label: string; badge?: number }[] = [
    { key: 'all', label: '全部订单', badge: 128 },
    { key: 'pending-pay', label: '待支付', badge: 12 },
    { key: 'processing', label: '处理中', badge: 8 },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' },
    { key: 'refund', label: '退款/售后' },
  ]

  return (
    <aside style={{
      width: 180,
      background: '#fff',
      borderRight: '1px solid #e8e8e8',
      position: 'fixed',
      top: 56,
      left: 0,
      bottom: 0,
      overflowY: 'auto',
    }}>
      {/* 订单中心 */}
      <div>
        <div style={{
          padding: '16px 16px 8px',
          fontSize: 12,
          color: '#999',
          fontWeight: 500,
          letterSpacing: 0.5,
        }}>订单中心</div>
        <ul style={{ listStyle: 'none' }}>
          {orderMenuItems.map(item => {
            const isActive = currentPage === 'orders' && orderFilter === item.key
            return (
              <li
                key={item.key}
                onClick={() => { onPageChange('orders'); onFilterChange(item.key) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                  height: 40,
                  cursor: 'pointer',
                  background: isActive ? '#FFF3E8' : 'transparent',
                  borderLeft: isActive ? '3px solid #FF7800' : '3px solid transparent',
                  color: isActive ? '#FF7800' : '#444',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#fafafa' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span style={{
                    background: isActive ? '#FF7800' : '#FF4D4F',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '1px 6px',
                    fontSize: 11,
                    fontWeight: 600,
                    minWidth: 20,
                    textAlign: 'center',
                  }}>{item.badge}</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <div style={{ height: 1, background: '#f0f0f0', margin: '8px 0' }} />

      {/* 数据工具 */}
      <div>
        <div style={{
          padding: '8px 16px',
          fontSize: 12,
          color: '#999',
          fontWeight: 500,
          letterSpacing: 0.5,
        }}>数据工具</div>
        <ul style={{ listStyle: 'none' }}>
          <li
            onClick={() => onPageChange('export-records')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              height: 40,
              cursor: 'pointer',
              background: currentPage === 'export-records' ? '#FFF3E8' : 'transparent',
              borderLeft: currentPage === 'export-records' ? '3px solid #FF7800' : '3px solid transparent',
              color: currentPage === 'export-records' ? '#FF7800' : '#444',
              fontWeight: currentPage === 'export-records' ? 600 : 400,
              fontSize: 14,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (currentPage !== 'export-records') (e.currentTarget as HTMLElement).style.background = '#fafafa' }}
            onMouseLeave={e => { if (currentPage !== 'export-records') (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span>导出记录</span>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
