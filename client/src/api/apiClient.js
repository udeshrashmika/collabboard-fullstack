import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// attach the token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('collabboard_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// if the token expires, clear it and bounce to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('collabboard_token')
      localStorage.removeItem('collabboard_user')
    }
    return Promise.reject(err)
  }
)

export default apiClient