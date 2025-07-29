// Local: src/shared/services/baserowServerClient.ts

import fetch, { HeadersInit, RequestInit } from 'node-fetch';

const BASE_URL = 'https://dados.focoserv.com.br/api/database/rows/table';
const API_KEY = process.env.VITE_BASEROW_API_KEY;

const apiRequest = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  tableId: string,
  path: string = '',
  body?: Record<string, any>
) => {
  if (!API_KEY) {
    const errorMessage = "A chave da API do Baserow (VITE_BASEROW_API_KEY) não foi encontrada no ambiente do servidor.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  let finalUrl = `${BASE_URL}/${tableId}/${path}`;

  if (method === 'GET' || method === 'POST' || method === 'PATCH') {
    if (finalUrl.includes('?')) {
      finalUrl += '&user_field_names=true';
    } else {
      finalUrl += '?user_field_names=true';
    }
  }
  
  const headers: HeadersInit = { 'Authorization': `Token ${API_KEY}` };
  if (method !== 'GET' && body) {
    headers['Content-Type'] = 'application/json';
  }
  const options: RequestInit = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(finalUrl, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Não foi possível ler o corpo do erro.' }));
      console.error(`--- ERRO DETALHADO DO BASEROW (Status: ${response.status}) ---:`, errorData);
      throw new Error(`Erro na comunicação com o banco de dados (Status: ${response.status})`);
    }
    if (response.status === 204) {
      return {}; 
    }
    return await response.json();
  } catch (error) {
    console.error('Falha na requisição para o Baserow a partir do servidor:', error);
    throw error;
  }
};

export const baserowServer = {
  get: (tableId: string, params: string = '') => apiRequest('GET', tableId, params),
  getRow: (tableId: string, rowId: number) => apiRequest('GET', tableId, `${rowId}/`),
  post: (tableId: string, data: Record<string, any>) => apiRequest('POST', tableId, `?user_field_names=true`, data),
  patch: (tableId: string, rowId: number, data: Record<string, any>) => apiRequest('PATCH', tableId, `${rowId}/?user_field_names=true`, data),
  delete: (tableId: string, rowId: number) => apiRequest('DELETE', tableId, `${rowId}/`),
};