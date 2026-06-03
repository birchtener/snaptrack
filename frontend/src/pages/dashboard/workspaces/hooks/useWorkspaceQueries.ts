import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../api/useApi";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  type FieldDefinition,
} from "../api/workspaces";

export const useWorkspaces = () => {
  const { api } = useApi();

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getWorkspaces({ api }),
  });
};

export const useWorkspaceById = (workspaceId: string) => {
  const { api } = useApi();

  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceById({ api, workspaceId }),
    enabled: !!workspaceId,
  });
};

export const useCreateWorkspace = () => {
  const { api } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      fieldDefinitions?: FieldDefinition[];
    }) => createWorkspace({ api, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};

export const useUpdateWorkspace = () => {
  const { api } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      workspaceId: string;
      data: { name?: string; fieldDefinitions?: FieldDefinition[] };
    }) =>
      updateWorkspace({
        api,
        workspaceId: variables.workspaceId,
        data: variables.data,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", variables.workspaceId],
      });
    },
  });
};

export const useDeleteWorkspace = () => {
  const { api } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => deleteWorkspace({ api, workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
