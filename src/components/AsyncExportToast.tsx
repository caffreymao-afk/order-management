import React, { useEffect, useState } from 'react'

interface AsyncExportToastProps {
  visible: boolean
  onClose: () => void
  onViewRecords: () => void
}

const AsyncExportToast: React.FC<AsyncExportToastProps> = ({ visible, onClose, onViewRecords }) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible && !show) return null

  return (
    <div style={{
      position: 'fixed',
      top: 72,
      left: '50%',
      transform: `translateX(-50%) translateY(${show ? '0' : '-20px'})`,
      opacity: show ? 1 : 0,
      transition: 'all 0.3s ease',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      background: '#fff',
      borderRadius: 8,
      padding: '12px 18px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      border: '1px solid #f0f0f0',
      minWidth: 380,
    }}>
      {/* Icon */}
      <span style={{ fontSize: 20 }}>💡</span>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 14, color: '#333' }}>
          导出任务正在后台处理中，完成后将通过站内消息通知您，无需等待
        </span>
      </div>

      {/* View Records Link */}
      <button
        onClick={() => { onViewRecords(); setShow(false); setTimeout(onClose, 300) }}
        style={{
          background: 'none', border: 'none',
          color: '#FF7800', fontSize: 13, cursor: 'pointer',
          padding: 0, fontWeight: 500, whiteSpace: 'nowrap',
        }}
      >查看记录</button>

      {/* Close */}
      <button
        onClick={() => { setShow(false); setTimeout(onClose, 300) }}
        style={{
          width: 20, height: 20,
          border: 'none', background: 'none',
          cursor: 'pointer', color: '#bbb',
          fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
        }}
      >×</button>
    </div>
  )
}

export default AsyncExportToast
