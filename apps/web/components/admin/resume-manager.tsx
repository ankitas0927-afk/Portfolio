'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/providers/auth-provider';

type ResumeRecord = {
  id: string;
  title: string;
  versionLabel: string;
  isActive: boolean;
  publicationStatus: string;
};

export function ResumeManager() {
  const { apiRequest } = useAuth();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('Ankita Singh Resume');
  const [versionLabel, setVersionLabel] = useState('');
  const [isActive, setIsActive] = useState(true);

  const query = useQuery({
    queryKey: ['admin-resumes'],
    queryFn: () => apiRequest<ResumeRecord[]>({ url: '/admin/resumes' }),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('Please select a resume PDF');
      }
      const data = new FormData();
      data.append('file', file);
      data.append('title', title);
      data.append('versionLabel', versionLabel);
      data.append('isActive', String(isActive));
      data.append('publicationStatus', 'published');
      return apiRequest({
        url: '/admin/resumes',
        method: 'POST',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Resume uploaded');
      setFile(null);
      setVersionLabel('');
      void queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/admin/resumes/${id}/activate`, method: 'PATCH' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/admin/resumes/${id}/archive`, method: 'PATCH' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest({ url: `/admin/resumes/${id}`, method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-resumes'] });
    },
  });

  return (
    <section className="space-y-8 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-soft">
      <div>
        <h2 className="font-display text-2xl font-semibold">Resume Manager</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Every resume version is stored in GridFS and activated separately.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate();
        }}
        className="grid gap-4 rounded-[1.75rem] border border-border/60 bg-background/70 p-5 lg:grid-cols-4"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
          placeholder="Title"
        />
        <input
          value={versionLabel}
          onChange={(event) => setVersionLabel(event.target.value)}
          className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
          placeholder="Version label"
        />
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
        />
        <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          Set active
        </label>
        <button
          type="submit"
          className="rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] px-5 py-3 text-sm font-semibold text-white lg:col-span-4"
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload resume'}
        </button>
      </form>

      <div className="space-y-4">
        {(query.data ?? []).map((resume) => (
          <article key={resume.id} className="rounded-[1.5rem] border border-border/60 bg-background/70 p-5">
            <p className="font-semibold text-foreground">{resume.title}</p>
            <p className="mt-1 text-sm text-foreground/68">{resume.versionLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!resume.isActive ? (
                <button
                  type="button"
                  onClick={() => activateMutation.mutate(resume.id)}
                  className="rounded-full border border-border/70 px-3 py-2 text-xs font-semibold"
                >
                  Activate
                </button>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              )}
              <button
                type="button"
                onClick={() => archiveMutation.mutate(resume.id)}
                className="rounded-full border border-border/70 px-3 py-2 text-xs font-semibold"
              >
                Archive
              </button>
              {!resume.isActive ? (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(resume.id)}
                  className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600"
                >
                  Delete
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
