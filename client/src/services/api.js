import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.accessToken || user?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401 with token refresh
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user?.refreshToken) {
                    const res = await axios.post('/api/auth/refresh-token', {
                        refreshToken: user.refreshToken,
                    });

                    const newAccessToken = res.data.accessToken;
                    user.accessToken = newAccessToken;
                    user.token = newAccessToken;
                    localStorage.setItem('user', JSON.stringify(user));

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return API(originalRequest);
                }
            } catch {
                // Refresh failed — clear user and redirect
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ── Auth ──
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const refreshToken = (token) => API.post('/auth/refresh-token', { refreshToken: token });
export const getMe = () => API.get('/auth/me');
export const getUserStats = () => API.get('/auth/stats');
export const uploadAvatar = (formData) =>
    API.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ── Users ──
export const getLeaderboard = (limit) =>
    API.get('/users/leaderboard', { params: { limit } });

// ── Debates ──
export const getDebates = (params) => API.get('/debates', { params });
export const searchDebates = (params) => API.get('/debates/search', { params });
export const getTrendingDebates = (limit) =>
    API.get('/debates/trending', { params: { limit } });
export const getDebateById = (id, userId) =>
    API.get(`/debates/${id}`, { params: { userId } });
export const createDebate = (data) => API.post('/debates', data);
export const deleteDebate = (id) => API.delete(`/debates/${id}`);
export const voteOnDebate = (debateId, side) =>
    API.post(`/debates/${debateId}/vote`, { side });
export const incrementView = (debateId) =>
    API.post(`/debates/${debateId}/view`);

// ── Arguments ──
export const getArguments = (debateId, userId) =>
    API.get(`/arguments/${debateId}`, { params: { userId } });
export const createArgument = (data) => API.post('/arguments', data);
export const replyToArgument = (data) => API.post('/arguments/reply', data);
export const likeArgument = (argumentId) =>
    API.post('/arguments/like', { argumentId });
export const deleteArgument = (argumentId) => API.delete(`/arguments/${argumentId}`);

// ── Bookmarks ──
export const toggleBookmark = (debateId) =>
    API.post('/bookmarks', { debateId });
export const getBookmarks = () => API.get('/bookmarks');

// ── Reports ──
export const reportArgument = (data) => API.post('/reports', data);
export const getReports = () => API.get('/reports');
export const resolveReport = (id) => API.patch(`/reports/${id}`);

// ── Admin ──
export const adminGetUsers = (params) => API.get('/admin/users', { params });
export const adminDeleteDebate = (id) => API.delete(`/admin/debate/${id}`);
export const adminDeleteArgument = (id) => API.delete(`/admin/argument/${id}`);
export const adminGetReports = () => API.get('/admin/reports');
export const adminBanUser = (id) => API.patch(`/admin/users/${id}/ban`);
export const adminGetStats = () => API.get('/admin/stats');
