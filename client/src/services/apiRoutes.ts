// Centralização das rotas da API (mock/local)
export const ApiRoutes = {
  onboarding: {
    createOrUpdate: { method: 'POST', path: '/onboarding/create' },
    getByUserId: (userId: string) => ({ method: 'GET', path: `/onboarding/${userId}` }),
    update: (id: string) => ({ method: 'PUT', path: `/onboarding/${id}` }),
    addFile: { method: 'POST', path: '/onboarding/files/add' },
    listAll: { method: 'GET', path: '/onboarding' },
    delete: (id: string) => ({ method: 'DELETE', path: `/onboarding/${id}` }),
  },
  auth: {
    login: { method: 'POST', path: '/auth/login' },
    register: { method: 'POST', path: '/auth/register' },
  },
};

export default ApiRoutes;
