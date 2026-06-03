import { type AxiosInstance } from "axios";

interface CreateEventParams {
  api: AxiosInstance;
  data: {
    name: string;
    description?: string;
  };
}

interface CreateEventResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    createdBy: string;
    isActive: boolean;
    archivedAt: string | null;
    workspaceId: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export const createEvent = async ({
  api,
  data,
}: CreateEventParams): Promise<CreateEventResponse> => {
  const response = await api.post("/events", data);
  return response.data;
};

export interface GetEventsParams {
  api: AxiosInstance;
  workspaceId: string;
}

export interface Event {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  archivedAt: string | null;
  workspaceId: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface GetEventsResponse {
  success: boolean;
  data: Event[];
}

export const getEvents = async ({
  api,
  workspaceId,
}: GetEventsParams): Promise<GetEventsResponse> => {
  const response = await api.get(`/${workspaceId}/events`);
  return response.data;
};

export interface GetEventByIdParams {
  api: AxiosInstance;
  workspaceId: string;
  eventId: string;
}

export interface GetEventByIdResponse {
  success: boolean;
  data: Event;
}

export const getEventById = async ({
  api,
  workspaceId,
  eventId,
}: GetEventByIdParams): Promise<GetEventByIdResponse> => {
  const response = await api.get(`/${workspaceId}/events/${eventId}`);
  return response.data;
};

export interface UpdateEventParams {
  api: AxiosInstance;
  workspaceId: string;
  eventId: string;
  data: {
    name?: string;
    description?: string;
  };
}

export const updateEvent = async ({
  api,
  workspaceId,
  eventId,
  data,
}: UpdateEventParams): Promise<GetEventByIdResponse> => {
  const response = await api.patch(`/${workspaceId}/events/${eventId}`, data);
  return response.data;
};

export interface DeleteEventParams {
  api: AxiosInstance;
  workspaceId: string;
  eventId: string;
}

export const deleteEvent = async ({
  api,
  workspaceId,
  eventId,
}: DeleteEventParams): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(`/${workspaceId}/events/${eventId}`);
  return response.data;
};
