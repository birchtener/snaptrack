import api from "./axios";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
}

export const syncUser = async (userData: UserData) => {
  const response = await api.post("/api/v1/user/sync", userData);
  return response.data;
};
