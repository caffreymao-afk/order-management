import React, { useState, useEffect, useCallback } from 'react'
import { exportsApi, ExportTask } from '../api'

interface ExportRecordsProps {
  onNewExport: () => void
}

const STATUS_LABEL: Record<ExportTask['status'], string> = {
  pending: '等待中',
  generating: '生成中...',
  completed: '●已完成',
  failed: '●失败',
  expired: '●已失效',
}

const STATUS_COLOR: Record<ExportTask['status'], string> = {
  pending: '#1677FF',
  generating: '#1677FF',
  completed: '#52C41A',
  failed: '#FF4D4F',
  expired: '#FF4D4F',
}

const ExportRecords: React.FC<ExportRecordsProps> = ({ onNewExport }) => {
  const [tasks, setTasks] = useState<ExportTask[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const result = await exportsApi.getList()
      setTasks(result.list)
      setTotal(result.total)
    } catch (err) {
      console.error('获取导出记录失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // 轮询：有"生成中"任务时，每3秒刷新
  useEffect(() => {
    const hasGenerating = tasks.some(t => t.status === 'generating' || t.status === 'pending')
    if (!hasGenerating) return
    const timer = setInterval(fetchTasks, 3000)
    return () => clearInterval(timer)
  }, [tasks, fetchTasks])

  const handleDownload = (id: string) => {
    window.open(exportsApi.getDownloadUrl(id), '_blank')
  }

  const handleRetry = async (id: string) => {
    try {
      await exportsApi.retry(id)
      fetchTasks()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '重新导出失败')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#222' }}>导出记录</h2>
          <span style={{ fontSize: 13, color: '#999' }}>共 {total} 条</span>
        </div>
        <button onClick={onNewExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', height: 36, background: '#FF7800', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          新建导出
        </button>
      </div>

      {/* Info Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E6F4FF', border: '1px solid #91CAFF', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#1677FF' }}>
        <span>ℹ️</span>
        <span>导出文件保留 7 天，过期后自动删除，请及时下载。超过10万条时请缩小筛选范围。</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        {loading && tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: 14 }}>加载中...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                {['导出时间范围', '导出条数', '格式', '筛选门店', '任务状态', '创建时间', '文件有效期', '操作者', '操作'].map(col => (
                  <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#888', fontWeight: 500, whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#bbb', fontSize: 14 }}>暂无导出记录</td></tr>
              ) : tasks.map((task, idx) => {
                const isExpired = task.status === 'expired'
                const isGenerating = task.status === 'generating' || task.status === 'pending'
                return (
                  <tr key={task.id} style={{ background: isExpired ? '#fafafa' : '#fff', borderBottom: idx < tasks.length - 1 ? '1px solid #f5f5f5' : 'none', opacity: isExpired ? 0.65 : 1 }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: isExpired ? '#bbb' : '#333' }}>{task.dateRange}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#555' }}>{task.exportCount !== null ? `${task.exportCount.toLocaleString()} 条` : '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 500, color: '#555' }}>{task.format}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#555' }}>{task.filterShop}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {isGenerating ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E6F4FF', border: '1px solid #91CAFF', borderRadius: 12, padding: '3px 10px', fontSize: 12, color: '#1677FF', fontWeight: 500 }}>
                          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span> 生成中...
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: STATUS_COLOR[task.status], fontWeight: 500 }}>{STATUS_LABEL[task.status]}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#666' }}>{task.createdAt}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      {isExpired ? <span style={{ color: '#FF4D4F', fontWeight: 600 }}>已过期</span>
                        : task.expireDate ? <span style={{ color: '#555' }}>{task.expireDate}</span>
                        : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#555' }}>{task.operator}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {task.status === 'completed' && (
                          <>
                            <button onClick={() => handleDownload(task.id)} style={{ background: 'none', border: 'none', color: '#FF7800', fontSize: 13, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 12v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="#FF7800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              下载
                            </button>
                            <span style={{ color: '#e0e0e0' }}>|</span>
                            <button onClick={() => handleRetry(task.id)} style={{ background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 0 }}>重新导出</button>
                          </>
                        )}
                        {isGenerating && <span style={{ color: '#bbb', fontSize: 13 }}>下载</span>}
                        {(task.status === 'expired' || task.status === 'failed') && (
                          <>
                            <button onClick={() => handleRetry(task.id)} style={{ background: 'none', border: 'none', color: '#FF7800', fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 500 }}>重新导出</button>
                            {task.status === 'failed' && task.errorMsg && (
                              <>
                                <span style={{ color: '#e0e0e0' }}>|</span>
                                <button title={task.errorMsg} style={{ background: 'none', border: 'none', color: '#FF4D4F', fontSize: 13, cursor: 'pointer', padding: 0 }}>失败原因</button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default ExportRecords
