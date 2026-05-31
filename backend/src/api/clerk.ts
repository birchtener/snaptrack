import axios from "axios";

export const deleteUser = async (userId: string): Promise<boolean> => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY is not set in environment variables.");
    return false;
  }
  const options = {
    method: "DELETE",
    url: `https://api.clerk.com/v1/users/${userId}`,
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  };

  try {
    const { data } = await axios.request(options);
    if (process.env.NODE_ENV === "development") {
      console.log("User deleted from Clerk:", data);
    }
    return true;
  } catch (error) {
    return false;
  }
};

interface UpdateUserParams {
  userId: string;
  firstName?: string;
  lastName?: string;
  password?: string;
}

export const updateUser = async (
  params: UpdateUserParams,
): Promise<boolean> => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY is not set in environment variables.");
    return false;
  }

  const { userId, firstName, lastName, password } = params;
  const options = {
    method: "PATCH",
    url: `https://api.clerk.com/v1/users/${userId}`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secretKey}`,
    },
    data: {
      first_name: firstName,
      last_name: lastName,
      password,
    },
  };

  try {
    const { data } = await axios.request(options);
    if (process.env.NODE_ENV === "development") {
      console.log("User updated in Clerk:", data);
    }
    return true;
  } catch (error) {
    console.error("Failed to update user in Clerk:", error);
    return false;
  }
};

export const updateUserAvatar = async (
  userId: string,
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string | null> => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("CLERK_SECRET_KEY is not set in environment variables.");
    return null;
  }
  const blob = new Blob([fileBuffer.buffer as ArrayBuffer], { type: mimeType });
  const form = new FormData();
  form.append("file", blob, fileName);

  const options = {
    method: "POST",
    url: `https://api.clerk.com/v1/users/${userId}/profile_image`,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${secretKey}`,
    },
    data: form,
  };

  try {
    const { data } = await axios.request(options);
    if (process.env.NODE_ENV === "development") {
      console.log("User avatar updated in Clerk:", data);
    }
    return data.image_url;
  } catch (error) {
    console.error("Failed to update user avatar in Clerk:", error);
    return null;
  }
};
