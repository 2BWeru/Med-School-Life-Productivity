'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { addSpeakingVideo } from './actions';

type Topic = { id: string; topic: string };

export function VideoForm({ topics }: { topics: Topic[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    await addSpeakingVideo(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleAction} className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="videoUrl">Video link</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          placeholder="Paste a link (YouTube, Drive, phone upload...)"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="topicId">Topic</Label>
        <Select id="topicId" name="topicId" defaultValue="">
          <option value="">None</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.topic.slice(0, 40)}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="selfRating">Self rating (1-5)</Label>
        <Input id="selfRating" name="selfRating" type="number" min={1} max={5} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Save video</Button>
      </div>
    </form>
  );
}
