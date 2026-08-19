import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use((config) => { const token = localStorage.getItem('accessToken'); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((response) => response, async (error) => { const original = error.config; const refreshToken = localStorage.getItem('refreshToken'); if (error.response?.status === 401 && refreshToken && !original._retry && !original.url.includes('refresh-token')) { original._retry = true; try { const { data } = await api.post('/auth/refresh-token', { token: refreshToken }); localStorage.setItem('accessToken', data.accessToken); original.headers.Authorization = `Bearer ${data.accessToken}`; return api(original) } catch { localStorage.clear() } } return Promise.reject(error) })
export const messageFrom = (error) => {
	const status = error.response?.status
	const responseMessage = error.response?.data?.message
	const detail = responseMessage || error.message || 'Unknown request error'
	if (import.meta.env.DEV) console.error('API request failed', { url: error.config?.url, status, detail, error })
	return import.meta.env.DEV
		? `${detail}${status ? ` (HTTP ${status})` : ''}`
		: responseMessage || 'Something went wrong. Please try again.'
}
export default api
