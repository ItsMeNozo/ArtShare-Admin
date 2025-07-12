import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../../api/baseApi';
import { UserStatus } from '../../../constants/user';
import { User, UserFormData } from '../../../types/user';
import { signUp, updateUserPassword } from '../../auth/api/auth-api';
import { useUpdateUserMutation } from './useUserQueries';

interface UseUserFormProps {
  initialUser: User | null;
  isCreatingNewUser: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const getInitialDialogFormData = (
  user: User | null,
  isCreating: boolean,
): UserFormData => {
  if (isCreating || !user) {
    return {
      username: '',
      email: '',
      fullName: '',
      profilePictureUrl: '',
      bio: '',
      birthday: undefined,
      roles: ['USER'],
      password: '',
      status: UserStatus.ACTIVE,
    };
  }
  return {
    username: user.username,
    email: user.email,
    fullName: user.fullName ?? '',
    profilePictureUrl: user.profilePictureUrl ?? '',
    bio: user.bio ?? '',
    birthday: user.birthday
      ? (new Date(user.birthday).toISOString().split('T')[0] as any)
      : undefined,
    roles: user.roles.map((ur) => ur),
    password: '',
    status: user.status || UserStatus.ACTIVE,
  };
};

const validationSchema = (isCreating: boolean) =>
  Yup.object({
    username: Yup.string()
      .min(3, 'Must be at least 3 characters')
      .required('Username is required'),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    fullName: Yup.string(),
    profilePictureUrl: Yup.string(),
    bio: Yup.string().max(500, 'Bio cannot exceed 500 characters'),
    birthday: Yup.date().nullable(),
    roles: Yup.array().min(1, 'At least one role must be selected').required(),
    password: isCreating
      ? Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required for new users')
      : Yup.string(),
    status: Yup.string()
      .oneOf(Object.values(UserStatus))
      .required('Status is required'),
  });

const getErrorMessage = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/weak-password':
        return 'The password is too weak.';
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

export const useUserForm = ({
  initialUser,
  isCreatingNewUser,
  onSuccess,
  onError,
}: UseUserFormProps) => {
  const updateUserMutation = useUpdateUserMutation();

  const executeCreateUser = async (values: UserFormData) => {
    if (!values.email || !values.password) {
      throw new Error('Email and password are required for new users.');
    }

    const { newUser } = await signUp(
      values.email,
      values.password,
      values.username,
    );
    const userIdForBackend = newUser.id || (newUser as any).uid;
    if (!userIdForBackend) {
      throw new Error('Failed to get ID from the new Firebase user.');
    }

    const { password, ...createUserData } = values;
    await updateUserMutation.mutateAsync({
      userId: userIdForBackend,
      formData: createUserData,
    });

    return newUser;
  };

  const executeUpdateUser = async (values: UserFormData, user: User) => {
    if (!user?.id) {
      throw new Error('Cannot update user: User ID is missing.');
    }

    if (values.password) {
      await updateUserPassword(values.password);
    }

    const { password, ...updateUserData } = values;
    await updateUserMutation.mutateAsync({
      userId: user.id,
      formData: updateUserData,
    });
  };

  const rollbackFirebaseUser = async (firebaseUser: any) => {
    console.error('Backend operation failed. Rolling back Firebase user...');
    try {
      const userId = firebaseUser.id || (firebaseUser as any).uid;
      await api.delete(`/admin/users/${userId}`);
    } catch (rollbackError) {
      console.error(
        'CRITICAL: FAILED to roll back Firebase user. Manual cleanup required for user ID:',
        firebaseUser.id,
        rollbackError,
      );
    }
  };

  const handleFormSubmit = async (values: UserFormData) => {
    let createdFirebaseAuthUser = null;
    try {
      if (isCreatingNewUser) {
        createdFirebaseAuthUser = await executeCreateUser(values);
      } else {
        await executeUpdateUser(values, initialUser!);
      }
      onSuccess(
        `User ${isCreatingNewUser ? 'created' : 'updated'} successfully.`,
      );
    } catch (error: any) {
      if (createdFirebaseAuthUser) {
        await rollbackFirebaseUser(createdFirebaseAuthUser);
      }
      onError(getErrorMessage(error));
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
