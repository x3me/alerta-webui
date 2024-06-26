import { DTO, IIncident, INote } from '@/common/interfaces'
import axios, { CancelTokenSource } from 'axios'
import api from '.'

let queryInProgress: CancelTokenSource
type IncidentDTO = DTO & { incident: IIncident }
type NotesDTO = DTO & { notes: INote[] }

export default {
  getIncident: async (incidentId: string) =>
    api.get<IncidentDTO>(`/incidents/${incidentId}`).then((res) => res.data),

  createIncident: async (data: Partial<IIncident>) =>
    api.post<IncidentDTO>(`/incidents`, data).then((res) => res.data),

  updateIncident: async (incidentId: string, data: Partial<IIncident>) =>
    api
      .put<IncidentDTO>(`/incidents/${incidentId}`, data)
      .then((res) => res.data),

  setStatus: async (incidentId: string, data: object) => {
    return api
      .put<IncidentDTO>(`/incidents/${incidentId}/status`, data)
      .then((res) => res.data)
  },
  actionIncident: async (incidentId: string, data: object) => {
    return api
      .put<IncidentDTO>(`/incidents/${incidentId}/action`, data)
      .then((res) => res.data)
  },
  addNote: async (incidentId: string, note: string) => {
    return api
      .post(`/incidents/${incidentId}/notes`, {
        text: note
      })
      .then((res) => res.data)
  },
  getNotes: async (incidentId: string) => {
    return api
      .get<NotesDTO>(`/incidents/${incidentId}/notes`)
      .then((res) => res.data)
  },
  updateNote: async (incidentId: string, noteId: string, data: object) => {
    return api
      .put(`/incidents/${incidentId}/notes/${noteId}`, data)
      .then((res) => res.data)
  },
  deleteNote: async (incidentId: string, noteId: string) => {
    return api
      .delete(`/incidents/${incidentId}/notes/${noteId}`)
      .then((res) => res.data)
  },
  getIncidents: async (query: object) => {
    if (query && queryInProgress)
      queryInProgress.cancel(
        'Too many search requests. Cancelling current query.'
      )

    queryInProgress = axios.CancelToken.source()
    return api
      .get('/incidents', {
        params: query,
        cancelToken: queryInProgress.token
      })
      .then((res) => res.data)
  },

  deleteIncident: async (incidentId: string) => {
    return api.delete(`/incidents/${incidentId}`).then((res) => res.data)
  },
  getEnvironments: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/environments', config).then((res) => res.data)
  },
  getServices: async (query: object) => {
    const config = {
      params: query
    }
    return api.get('/services', config).then((res) => res.data)
  }
}
