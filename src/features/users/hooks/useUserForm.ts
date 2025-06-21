import { useFormik } from "formik";
import * as Yup from "yup";
import { User, UserFormData } from "../../../types/user";
import { UserStatus } from "../../../constants/user";
import { useUpdateUserMutation } from "./user.queries";
import { signUp, updateUserPassword } from "../../auth/api/auth-api";
import api from "../../../api/baseApi";
import { createUser } from "../api/user.api";

const getInitialDialogFormData = (
  user: User | null,
  isCreating: boolean,
): UserFormData => {
  if (isCreating || !user) {
    return {
      username: "",
      email: "",
      fullName: "",
      profilePictureUrl: "",
      bio: "",
      birthday: undefined,
      roles: ["USER"],
      password: "",
      status: UserStatus.ACTIVE,
    };
  }
  return {
    username: user.username,
    email: user.email,
    fullName: user.fullName || "",
    profilePictureUrl: user.profilePictureUrl || "",
    bio: user.bio || "",
    birthday: user.birthday
      ? (new Date(user.birthday).toISOString().split("T")[0] as any)
      : undefined,
    roles: user.roles.map((ur) => ur),
    password: "",
    status: user.status || UserStatus.ACTIVE,
  };
};

const validationSchema = (isCreating: boolean) =>
  Yup.object({
    username: Yup.string()
      .min(3, "Must be at least 3 characters")
      .required("Username is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    fullName: Yup.string(),
    profilePictureUrl: Yup.string(),
    bio: Yup.string().max(500, "Bio cannot exceed 500 characters"),
    birthday: Yup.date().nullable(),
    roles: Yup.array().min(1, "At least one role must be selected").required(),
    password: isCreating
      ? Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required for new users")
      : Yup.string(),
    status: Yup.string()
      .oneOf(Object.values(UserStatus))
      .required("Status is required"),
  });

interface UseUserFormProps {
  initialUser: User | null;
  isCreatingNewUser: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const useUserForm = ({
  initialUser,
  isCreatingNewUser,
  onSuccess,
  onError,
}: UseUserFormProps) => {
  const updateUserMutation = useUpdateUserMutation();

  const handleFormSubmit = async (values: UserFormData) => {
    let createdFirebaseAuthUser = null;
    try {
      if (isCreatingNewUser) {
        if (!values.email || !values.password) {
          throw new Error("Email and password are required.");
        }

        const firebaseResponse = await signUp(
          values.email,
          values.password,
          values.username,
        );
        createdFirebaseAuthUser = firebaseResponse.newUser;
        const userIdForBackend =
          createdFirebaseAuthUser.id || (createdFirebaseAuthUser as any).uid;
        if (!userIdForBackend)
          throw new Error("Failed to get ID from new Firebase user.");

        const { password, ...createUserData } = values;

        await updateUserMutation.mutateAsync({
          userId: userIdForBackend,
          formData: createUserData,
        });
      } else {
        if (!initialUser?.id)
          throw new Error("Cannot update user: ID is missing.");

        if (values.password) {
          await updateUserPassword(values.password);
        }

        const { password, ...updateUserData } = values;

        await updateUserMutation.mutateAsync({
          userId: initialUser.id,
          formData: updateUserData,
        });
      }
      onSuccess(
        `User ${isCreatingNewUser ? "created" : "updated"} successfully.`,
      );
    } catch (error: any) {
      if (isCreatingNewUser && createdFirebaseAuthUser) {
        console.error(
          "Backend user creation failed. Attempting to roll back Firebase user...",
        );
        try {
          const userId =
            createdFirebaseAuthUser.id || (createdFirebaseAuthUser as any).uid;
          await api.delete(`/admin/users/${userId}`);
        } catch (rollbackError) {
          console.error(
            "CRITICAL: FAILED to roll back Firebase user. Manual cleanup required.",
            rollbackError,
          );
        }
      }

      let messageToShow = "An unexpected error occurred. Please try again.";
      if (error?.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            messageToShow = "This email is already registered.";
            break;
          case "auth/invalid-email":
            messageToShow = "The email address is not valid.";
            break;
          case "auth/weak-password":
            messageToShow = "The password is too weak.";
            break;
          default:
            messageToShow = error.message;
            break;
        }
      } else if (error instanceof Error) {
        messageToShow = error.message;
      }
      onError(messageToShow);
    }
  };

  const formik = useFormik<UserFormData>({
    initialValues: getInitialDialogFormData(initialUser, isCreatingNewUser),
    validationSchema: validationSchema(isCreatingNewUser),
    onSubmit: handleFormSubmit,
    enableReinitialize: true,
  });

  return formik;
};
