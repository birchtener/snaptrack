import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../api/useApi";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  type Event,
} from "../api/events";

export const useEvents = (workspaceId: string) => {
  const { api } = useApi();

  return useQuery({
    queryKey: ["workspaces", workspaceId, "events"],
    queryFn: () => getEvents({ api, workspaceId }),
    enabled: !!workspaceId,
  });
};

export const useEventById = (workspaceId: string, eventId: string) => {
  const { api } = useApi();

  return useQuery({
    queryKey: ["workspaces", workspaceId, "events", eventId],
    queryFn: () => getEventById({ api, workspaceId, eventId }),
    enabled: !!workspaceId && !!eventId,
  });
};

export const useCreateEvent = (workspaceId: string) => {
  const { api } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createEvent({ api, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "events"],
      });
    },
  });
};

export const useUpdateEvent = () => {
  const { api } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      workspaceId: string;
      eventId: string;
      data: { name?: string; description?: string };
    }) =>
      updateEvent({
        api,
        workspaceId: variables.workspaceId,
        eventId: variables.eventId,
        data: variables.data,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", variables.workspaceId, "events"],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "workspaces",
          variables.workspaceId,
          "events",
          variables.eventId,
        ],
      });
    },
  });
};

export const useDeleteEvent = () => {
  const { api } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { workspaceId: string; eventId: string }) =>
      deleteEvent({
        api,
        workspaceId: variables.workspaceId,
        eventId: variables.eventId,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", variables.workspaceId, "events"],
      });
    },
  });
};
