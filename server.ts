// Local: /server.ts

import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

import express, { Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { baserowServer } from './src/shared/services/baserowServerClient.js';
import fetch from 'node-fetch';

const app = express();
const port = 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
  console.error("ERRO CRÍTICO: As credenciais do Google não foram encontradas...");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.get('/api/google/auth/connect', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId é obrigatório' });

  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', scope: scopes, prompt: 'consent', state: userId.toString(),
  });
  res.json({ url });
});

app.get('/api/google/auth/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const userId = state as string;
  const closePopupScript = `<script>window.close();</script>`;

  if (!code) {
    console.error("Callback do Google recebido sem o código de autorização.");
    return res.send(closePopupScript);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    const { refresh_token } = tokens;

    if (refresh_token) {
      console.log('Refresh Token obtido e será salvo para o usuário:', userId);
      await baserowServer.patch('711', parseInt(userId), { google_refresh_token: refresh_token });
    } else {
      console.warn('Nenhum refresh_token foi recebido para o usuário:', userId);
    }
    
    res.send(closePopupScript);

  } catch (error) {
    console.error('--- ERRO DETALHADO NA TROCA DE TOKEN DO GOOGLE ---', error);
    res.send(closePopupScript);
  }
});

app.post('/api/google/auth/disconnect', async (req: Request, res: Response) => {
    const { userId } = req.body;
    await baserowServer.patch('711', parseInt(userId), { google_refresh_token: null });
    console.log(`Desconectando calendário para o usuário ${userId}`);
    res.json({ success: true, message: 'Conta Google desconectada.' });
});

app.post('/api/google/calendar/create-event', async (req: Request, res: Response) => {
    const { userId, eventData, candidate, job } = req.body;
    if (!userId || !eventData || !candidate || !job) {
        return res.status(400).json({ success: false, message: 'Dados insuficientes.' });
    }

    try {
        const userResponse = await baserowServer.getRow('711', parseInt(userId));
        const refreshToken = userResponse.google_refresh_token;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Usuário não conectado ao Google Calendar.' });
        }
        
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const eventDescription = `Entrevista com o candidato: ${candidate.nome}.\n` +
                                 `Telefone: ${candidate.telefone || 'Não informado'}\n\n` +
                                 `--- Detalhes adicionais ---\n` +
                                 `${eventData.details || 'Nenhum detalhe adicional.'}`;
        const event = {
            summary: eventData.title,
            description: eventDescription,
            start: { dateTime: eventData.start, timeZone: 'America/Sao_Paulo' },
            end: { dateTime: eventData.end, timeZone: 'America/Sao_Paulo' },
            reminders: { useDefault: true },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary', requestBody: event,
        });
        
        // --- MUDANÇA IMPORTANTE AQUI ---
        console.log('Evento criado no Google Calendar com sucesso. Resposta detalhada do Google:');
        console.log(response.data); // Loga a resposta completa do Google

        if (process.env.N8N_SCHEDULE_WEBHOOK_URL) {
            console.log('Disparando webhook para o n8n...');
            const webhookPayload = {
                recruiter: userResponse, candidate: candidate, job: job,
                interview: {
                    title: eventData.title, startTime: eventData.start, endTime: eventData.end,
                    details: eventData.details, googleEventLink: response.data.htmlLink
                }
            };
            try {
                fetch(process.env.N8N_SCHEDULE_WEBHOOK_URL, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(webhookPayload)
                });
                console.log('Webhook para n8n disparado com sucesso.');
            } catch (webhookError) {
                console.error("Erro ao disparar o webhook para o n8n:", webhookError);
            }
        }
        res.json({ success: true, message: 'Evento criado com sucesso!', data: response.data });
    } catch (error) {
        console.error('Erro ao criar evento no Google Calendar:', error);
        res.status(500).json({ success: false, message: 'Falha ao criar evento.' });
    }
});

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});