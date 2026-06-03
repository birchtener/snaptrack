import { type AxiosInstance } from "axios";

export interface FieldDefinition {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  userRole?: "owner" | "admin" | "scanner";
  studentMetadataSchema: FieldDefinition[] | null;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  members?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "owner" | "admin" | "scanner";
  }[];
}

export interface SingleWorkspaceResponse {
  success: boolean;
  data: Workspace;
}

export interface GetWorkspacesResponse {
  success: boolean;
  data: Workspace[];
}

interface CreateWorkspaceParams {
  api: AxiosInstance;
  data: {
    name: string;
    fieldDefinitions?: FieldDefinition[];
  };
}

interface UpdateWorkspaceParams {
  api: AxiosInstance;
  workspaceId: string;
  data: {
    name?: string;
    fieldDefinitions?: FieldDefinition[];
  };
}

interface BaseWorkspaceContext {
  api: AxiosInstance;
  workspaceId: string;
}

export const createWorkspace = async ({
  api,
  data,
}: CreateWorkspaceParams): Promise<SingleWorkspaceResponse> => {
  const response = await api.post<SingleWorkspaceResponse>("/workspaces", data);
  return response.data;
};

export const getWorkspaces = async ({
  api,
}: {
  api: AxiosInstance;
}): Promise<GetWorkspacesResponse> => {
  const response = await api.get<GetWorkspacesResponse>("/workspaces");
  return response.data;
};

export const getWorkspaceById = async ({
  api,
  workspaceId,
}: BaseWorkspaceContext): Promise<SingleWorkspaceResponse> => {
  const response = await api.get<SingleWorkspaceResponse>(
    `/workspaces/${workspaceId}`,
  );
  return response.data;
};

export const updateWorkspace = async ({
  api,
  workspaceId,
  data,
}: UpdateWorkspaceParams): Promise<SingleWorkspaceResponse> => {
  const response = await api.put<SingleWorkspaceResponse>(
    `/workspaces/${workspaceId}`,
    data,
  );
  return response.data;
};

export const deleteWorkspace = async ({
  api,
  workspaceId,
}: BaseWorkspaceContext): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(
    `/workspaces/${workspaceId}`,
  );
  return response.data;
};
