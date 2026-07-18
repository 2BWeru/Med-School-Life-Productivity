import { desc, eq } from 'drizzle-orm';
import { format, parseISO } from 'date-fns';
import { db } from '@/lib/db';
import { speakingTopics, speakingVideos } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteRowButton } from '@/components/dashboard/delete-row-button';
import { TopicForm } from './topic-form';
import { VideoForm } from './video-form';
import { deleteTopic, deleteSpeakingVideo } from './actions';

export const dynamic = 'force-dynamic';

export default async function SpeakingPage() {
  const user = await requireUser();

  const [topics, videos] = await Promise.all([
    db.query.speakingTopics.findMany({
      where: eq(speakingTopics.userId, user.userId),
      orderBy: [desc(speakingTopics.topicDate)],
    }),
    db.query.speakingVideos.findMany({
      where: eq(speakingVideos.userId, user.userId),
      orderBy: [desc(speakingVideos.recordedAt)],
      with: { topic: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Public Speaking"
        description="A fresh prompt to practice, and a place to log your videos."
      />

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s prompt</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TopicForm />
          <div className="flex flex-col divide-y divide-border">
            {topics.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(t.topicDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <DeleteRowButton action={deleteTopic.bind(null, t.id)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your videos</CardTitle>
          <CardDescription>
            Paste a link after recording — in-browser recording with automatic storage is a
            fast-follow once Vercel Blob storage is set up on this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <VideoForm topics={topics} />
          <div className="flex flex-col divide-y divide-border">
            {videos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos logged yet.</p>
            ) : (
              videos.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <a
                      href={v.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-semibold text-primary hover:underline"
                    >
                      {v.topic?.topic ?? 'Untitled practice'}
                    </a>
                    <p className="truncate text-xs text-muted-foreground">
                      {format(v.recordedAt, 'MMM d, yyyy')}
                      {v.selfRating ? ` · self-rated ${v.selfRating}/5` : ''}
                    </p>
                  </div>
                  <DeleteRowButton action={deleteSpeakingVideo.bind(null, v.id)} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
