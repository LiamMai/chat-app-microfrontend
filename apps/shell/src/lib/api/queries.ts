'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, userApi } from './client';
import type { AuthRouteResponse, UserRouteResponse } from './types';

export const queryKeys = {
  currentUser: ['user', 'me'] as const,
} as const;

interface LoginVars {
  email: string;
  password: string;
}

interface RegisterVars {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

interface UpdateProfileVars {
  firstName?: string;
  username?: string;
  bio?: string;
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<AuthRouteResponse, Error, LoginVars>({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (res) => {
      if (res.success && res.user) qc.setQueryData(queryKeys.currentUser, res.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation<AuthRouteResponse, Error, RegisterVars>({
    mutationFn: (data) => authApi.register(data),
    onSuccess: (res) => {
      if (res.success && res.user) qc.setQueryData(queryKeys.currentUser, res.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation<AuthRouteResponse, Error, void>({
    mutationFn: () => authApi.logout(),
    onSuccess: () => qc.clear(),
  });
}

export function useRefresh() {
  const qc = useQueryClient();
  return useMutation<AuthRouteResponse, Error, void>({
    mutationFn: () => authApi.refresh(),
    onSuccess: (res) => {
      if (res.success && res.user) qc.setQueryData(queryKeys.currentUser, res.user);
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<UserRouteResponse, Error, UpdateProfileVars>({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: (res) => {
      if (res.success && res.user) qc.setQueryData(queryKeys.currentUser, res.user);
    },
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation<UserRouteResponse, Error, File>({
    mutationFn: (file) => userApi.updateAvatar(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.currentUser }),
  });
}
