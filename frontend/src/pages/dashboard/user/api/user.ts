import { type AxiosInstance } from "axios";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  createdAt: string;
  deletedAt?: string | null;
}

export interface UserResponse {
  success: boolean;
  user: User;
}

export interface DeletedUser {
  id: string;
  softDeleted: boolean;
}

export interface DeletedUserResponse {
  success: boolean;
  user: DeletedUser;
}

export interface UpdatedUserResponse {
  success: boolean;
  user: User;
}

interface UpdateUserParams {
  api: AxiosInstance;
  data: {
    firstName?: string;
    lastName?: string;
    avatarFile?: File | null;
  };
}

interface ApiContextParam {
  api: AxiosInstance;
}

export const getUser = async ({
  api,
}: ApiContextParam): Promise<UserResponse> => {
  const response = await api.get("/users");
  console.log("getUser response:", response.data);
  return response.data;
};

export const deleteUser = async ({
  api,
}: ApiContextParam): Promise<DeletedUserResponse> => {
  const response = await api.delete("/users");
  return response.data;
};

export const updateUser = async ({
  api,
  data,
}: UpdateUserParams): Promise<UpdatedUserResponse> => {
  const formData = new FormData();

  if (data.firstName) formData.append("firstName", data.firstName);
  if (data.lastName) formData.append("lastName", data.lastName);

  if (data.avatarFile) {
    formData.append("file", data.avatarFile);
  }

  const response = await api.put("/users", formData);
  return response.data;
};
