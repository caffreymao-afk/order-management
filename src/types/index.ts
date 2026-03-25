export type OrderStatus = '全部状态' | '待支付' | '已支付' | '处理中' | '已完成' | '已取消' | '退款/售后'

export type ExportStatus = '已完成' | '生成中' | '已失效' | '失败'

export interface Order {
  id: string
  orderNo: string
  createTime: string
  productName: string
  productCount: number
  payAmount: number
  discountAmount: number
  payMethod: string
  orderStatus: OrderStatus
  shop: string
  isRefund?: boolean
}

export interface ExportRecord {
  id: string
  dateRange: string
  exportCount: number | null
  format: 'XLS' | 'CSV'
  filterShop: string
  status: ExportStatus
  createdAt: string
  expireDate: string | null
  operator: string
}

export interface ExportConfig {
  datePreset: 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'lastMonth' | 'custom'
  startDate: string
  endDate: string
  orderStatus: string
  shop: string
  productName: string
  format: 'xlsx' | 'csv'
}
