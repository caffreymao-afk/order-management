import React from 'react'

const Header: React.FC = () => {
  return (
    <header style={{
      height: 56,
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 48 }}>
        <div style={{
          width: 32, height: 32,
          background: '#FF7800',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 16,
        }}>Q</div>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#333', whiteSpace: 'nowrap' }}>牵牛花商家端</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', gap: 0, flex: 1 }}>
        {['首页', '订单管理', '商品管理', '数据分析', '营销活动'].map(item => (
          <a
            key={item}
            href="#"
            style={{
              padding: '0 20px',
              height: 56,
              display: 'flex', alignItems: 'center',
              color: item === '订单管理' ? '#FF7800' : '#555',
              fontSize: 14,
              fontWeight: item === '订单管理' ? 600 : 400,
              borderBottom: item === '订单管理' ? '2px solid #FF7800' : '2px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { if (item !== '订单管理') (e.target as HTMLElement).style.color = '#FF7800' }}
            onMouseLeave={e => { if (item !== '订单管理') (e.target as HTMLElement).style.color = '#555' }}
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="#888"/>
          </svg>
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#FF4D4F', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600,
          }}>2</span>
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{
            width: 28, height: 28,
            background: '#FF7800',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 600,
          }}>商</div>
          <span style={{ fontSize: 14, color: '#333' }}>朝阳旗舰店</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </header>
  )
}

export default Header
