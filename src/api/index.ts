// 开发环境走 Vite proxy（/api → localhost:3001）
// 生产环境走 VITE_API_BASE（Railway 地址）
const API_BASE = import.meta.env.VITE_API_BASE || ''

// 统一请求封装
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (json.code !== 0) throw new Error(json.msg || '请求失败')
  return json.data as T
}

// ==================== 订单 API ====================

export interface OrderItem {
  id: string
  orderNo: string
  createTime: string
  productName: string
  productCount: number
  payAmount: number
  discountAmount: number
  payMethod: string
  orderStatus: string
  shop: string
}

export interface OrdersQuery {
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  orderStatus?: string
  shop?: string
  productName?: string
}

export interface OrdersResult {
  list: OrderItem[]
  total: number
  page: number
  pageSize: number
}

export interface EstimateResult {
  estimatedCount: number
  overLimit: boolean
}

export const ordersApi = {
  // 获取订单列表
  getList(params: OrdersQuery = {}): Promise<OrdersResult> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== '全部状态' && v !== '全部门店') {
        query.set(k, String(v))
      }
    })
    return request<OrdersResult>(`/api/orders?${query}`)
  },

  // 获取门店列表
  getShops(): Promise<string[]> {
    return request<string[]>('/api/orders/meta/shops')
  },

  // 预估导出数量
  estimate(params: Omit<OrdersQuery, 'page' | 'pageSize'>): Promise<EstimateResult> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== '全部' && v !== '全部门店') {
        query.set(k, String(v))
      }
    })
    return request<EstimateResult>(`/api/orders/meta/estimate?${query}`)
  },
}

// ==================== 导出 API ====================

export interface ExportTask {
  id: string
  dateRange: string
  exportCount: number | null
  format: string
  filterShop: string
  filterStatus: string
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'expired'
  createdAt: string
  expireDate: string | null
  operator: string
  downloadUrl: string | null
  errorMsg: string | null
}

export interface CreateExportParams {
  startDate: string
  endDate: string
  orderStatus?: string
  shop?: string
  productName?: string
  format: 'xlsx' | 'csv'
}

export interface CreateExportResult {
  task: ExportTask
  isAsync: boolean
  message: string
}

export const exportsApi = {
  // 获取导出记录列表
  getList(): Promise<{ list: ExportTask[]; total: number }> {
    return request('/api/exports')
  },

  // 创建导出任务
  create(params: CreateExportParams): Promise<CreateExportResult> {
    return request('/api/exports', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  // 查询单个任务状态
  getById(id: string): Promise<ExportTask> {
    return request(`/api/exports/${id}`)
  },

  // 获取下载地址
  getDownloadUrl(id: string): string {
    return `/api/exports/${id}/download`
  },

  // 重新导出
  retry(id: string): Promise<CreateExportResult> {
    return request(`/api/exports/${id}/retry`, { method: 'POST' })
  },
}
