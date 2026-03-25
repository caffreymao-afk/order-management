import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import OrderList from './components/OrderList'
import ExportRecords from './components/ExportRecords'
import ExportModal from './components/ExportModal'
import AsyncExportToast from './components/AsyncExportToast'

type PageType = 'orders' | 'export-records'
type OrderFilterType = 'all' | 'pending-pay' | 'processing' | 'completed' | 'cancelled' | 'refund'

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('orders')
  const [orderFilter, setOrderFilter] = useState<OrderFilterType>('all')
  const [showExportModal, setShowExportModal] = useState(false)
  const [showAsyncToast, setShowAsyncToast] = useState(false)

  const handleExportSuccess = (isAsync: boolean) => {
    if (isAsync) {
      setShowAsyncToast(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header />
      <div style={{ display: 'flex', paddingTop: 56 }}>
        <Sidebar
          currentPage={currentPage}
          orderFilter={orderFilter}
          onPageChange={setCurrentPage}
          onFilterChange={setOrderFilter}
        />
        <main style={{ flex: 1, marginLeft: 180, minHeight: 'calc(100vh - 56px)' }}>
          {currentPage === 'orders' && (
            <OrderList
              onExportOrder={() => setShowExportModal(true)}
              onExportRecords={() => setCurrentPage('export-records')}
            />
          )}
          {currentPage === 'export-records' && (
            <ExportRecords
              onNewExport={() => setShowExportModal(true)}
            />
          )}
        </main>
      </div>

      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExportSuccess={handleExportSuccess}
        />
      )}

      <AsyncExportToast
        visible={showAsyncToast}
        onClose={() => setShowAsyncToast(false)}
        onViewRecords={() => { setCurrentPage('export-records'); setShowAsyncToast(false) }}
      />
    </div>
  )
}

export default App
