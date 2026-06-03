import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "../../../../api/useApi";
import { getUser, updateUser, deleteUser } from "../api/user";
import { useNavigate } from "react-router-dom";

export const useCurrentUser = () => {
  const { api } = useApi();

  return useQuery({
    queryKey: ["user"],
    queryFn: () => getUser({ api }),
  });
};

export const useUpdateUser = () => {
  const { api } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      firstName?: string;
      lastName?: string;
      avatarFile?: File | null;
    }) => updateUser({ api, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useDeleteUser = () => {
  const { api } = useApi();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => deleteUser({ api }),
    onSuccess: () => {
      navigate("/login");
    },
  });
};
