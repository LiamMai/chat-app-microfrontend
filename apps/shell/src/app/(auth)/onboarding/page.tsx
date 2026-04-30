'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormState } from '@/hooks/use-form-state';
import { useAsyncAction } from '@/hooks/use-async-action';
import { userApi } from '@/lib/api/client';

const TOTAL_STEPS = 3;
const CURRENT_STEP = 1;
const MAX_BIO_LENGTH = 150;

function PersonSilhouette() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <circle cx="26" cy="20" r="10" fill="#c7c7c7" />
      <path d="M6 46c0-11.046 8.954-20 20-20s20 8.954 20 20" fill="#c7c7c7" />
    </svg>
  );
}

function CameraAddIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect width="22" height="22" rx="11" fill="#0095F6" />
      <path d="M11 7v8M7 11h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setField] = useFormState({
    avatarPreview: null as string | null,
    avatarFile: null as File | null,
    displayName: '',
    username: '',
    bio: '',
  });
  const { isLoading, error, setError, execute } = useAsyncAction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.avatarPreview) URL.revokeObjectURL(form.avatarPreview);
    setField('avatarFile', file);
    setField('avatarPreview', URL.createObjectURL(file));
    e.target.value = '';
  }

  function handleBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (e.target.value.length <= MAX_BIO_LENGTH) setField('bio', e.target.value);
  }

  function handleContinue() {
    execute(async () => {
      if (form.avatarFile) {
        const avatarRes = await userApi.updateAvatar(form.avatarFile);
        if (!avatarRes.success) {
          setError(avatarRes.message ?? 'Avatar upload failed.');
          return;
        }
      }

      const profileRes = await userApi.updateProfile({
        firstName: form.displayName.trim(),
        username: form.username.trim(),
        bio: form.bio.trim() || undefined,
      });

      if (!profileRes.success) {
        setError(profileRes.message ?? 'Profile update failed.');
        return;
      }

      router.push('/');
    });
  }

  const canContinue = form.displayName.trim().length > 0 && form.username.trim().length > 0;

  return (
    <div className="auth-animate w-full" style={{ maxWidth: 350 }}>
      <div className="ig-card px-8 pt-8 pb-6 flex flex-col items-center gap-5">

        {/* Step indicator */}
        <div className="flex items-center gap-[6px]" aria-label={`Step ${CURRENT_STEP} of ${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === CURRENT_STEP - 1 ? 8 : 6,
                height: i === CURRENT_STEP - 1 ? 8 : 6,
                background: i === CURRENT_STEP - 1 ? '#262626' : '#dbdbdb',
              }}
            />
          ))}
        </div>

        {/* Heading */}
        <div className="text-center">
          <h2 className="text-[16px] font-semibold" style={{ color: '#262626' }}>
            Set up your profile
          </h2>
          <p className="text-[13px] mt-1" style={{ color: '#8e8e8e' }}>
            Add a photo and tell people a bit about yourself.
          </p>
        </div>

        {/* Avatar upload */}
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={isLoading}
          className="relative focus:outline-none"
          aria-label="Upload profile photo"
        >
          <span
            className="flex items-center justify-center rounded-full"
            style={{
              width: 90,
              height: 90,
              padding: 3,
              background: form.avatarPreview
                ? '#dbdbdb'
                : 'linear-gradient(135deg, #fdf497, #fd5949, #d6249f, #285AEB)',
            }}
          >
            <span
              className="rounded-full overflow-hidden flex items-center justify-center bg-[#efefef]"
              style={{ width: 84, height: 84 }}
            >
              {form.avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.avatarPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <PersonSilhouette />
              )}
            </span>
          </span>

          <span className="absolute bottom-0 right-0">
            <CameraAddIcon />
          </span>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Form fields */}
        <div className="w-full flex flex-col gap-[6px]">
          <input
            className="ig-input"
            type="text"
            placeholder="Display name"
            autoComplete="name"
            value={form.displayName}
            onChange={(e) => setField('displayName', e.target.value)}
            disabled={isLoading}
          />

          {/* Username with @ prefix */}
          <div className="relative">
            <span
              className="absolute left-[9px] top-1/2 -translate-y-1/2 text-[12px] select-none pointer-events-none"
              style={{ color: '#8e8e8e' }}
            >
              @
            </span>
            <input
              className="ig-input pl-[22px]"
              type="text"
              placeholder="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Bio textarea */}
          <div className="relative">
            <textarea
              className="ig-input resize-none"
              placeholder="Bio"
              rows={3}
              value={form.bio}
              onChange={handleBioChange}
              disabled={isLoading}
              style={{ paddingBottom: 20 }}
            />
            <span
              className="absolute right-[8px] bottom-[6px] text-[11px]"
              style={{ color: form.bio.length >= MAX_BIO_LENGTH ? '#ed4956' : '#8e8e8e' }}
            >
              {form.bio.length} / {MAX_BIO_LENGTH}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-[13px] text-center w-full" style={{ color: '#ed4956' }}>
            {error}
          </p>
        )}

        {/* Actions row */}
        <div className="w-full flex items-center justify-between mt-1">
          <Link
            href="/login"
            className="text-[13px]"
            style={{ color: '#8e8e8e' }}
          >
            Skip for now
          </Link>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || isLoading}
            className="ig-gradient-btn py-[7px] px-6 rounded-lg text-white text-[14px] font-semibold"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
