'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { resumeFileAccept } from '@/lib/media';
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
  const [title, setTitle] = useState('Professional Resume');
  const [versionLabel, setVersionLabel] = useState('');
  const [isActive, setIsActive] = useState(true);

  const query = useQuery({
    queryKey: ['admin-resumes'],
    queryFn: () => apiRequest<ResumeRecord[]>({ url: '/admin/resumes' }),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('Please select a resume file');
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
    <section className="premium-panel space-y-8 p-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Resume Manager</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Every resume version is stored in GridFS and activated separately. PDF, DOC, and DOCX are supported, while
          inline preview is best for PDF.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate();
        }}
        className="section-card grid gap-4 px-5 py-5 lg:grid-cols-4"
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="glass-input"
          placeholder="Title"
        />
        <input
          value={versionLabel}
          onChange={(event) => setVersionLabel(event.target.value)}
          className="glass-input"
          placeholder="Version label"
        />
        <input
          type="file"
          accept={resumeFileAccept}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="glass-input"
        />
        <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          Set active
        </label>
        <button
          type="submit"
          className="gradient-button lg:col-span-4"
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload resume file'}
        </button>
      </form>

      <div className="space-y-4">
        {(query.data ?? []).map((resume) => (
          <article key={resume.id} className="section-card hover-lift px-5 py-5">
            <p className="font-semibold text-foreground">{resume.title}</p>
            <p className="mt-1 text-sm text-foreground/68">{resume.versionLabel}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {!resume.isActive ? (
                <button
                  type="button"
                  onClick={() => activateMutation.mutate(resume.id)}
                  className="ghost-button px-3 py-2 text-xs"
                >
                  Activate
                </button>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Active
                </span>
              )}
              <button
                type="button"
                onClick={() => archiveMutation.mutate(resume.id)}
                className="ghost-button px-3 py-2 text-xs"
              >
                Archive
              </button>
              {!resume.isActive ? (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(resume.id)}
                  className="rounded-full border border-rose-200/80 bg-rose-50/80 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 dark:bg-rose-500/10"
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
