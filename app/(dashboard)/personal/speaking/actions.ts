'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { db } from '@/lib/db';
import { speakingTopics, speakingVideos } from '@/lib/schema';
import { requireUser } from '@/lib/session-helpers';
import { awardStars, touchStreakForToday } from '@/lib/gamification';

const TOPIC_BANK = [
  'Describe a patient interaction that changed your perspective.',
  'Explain a medical concept to someone with no science background.',
  'What drew you to medicine, and why New Zealand?',
  'Persuade a room of skeptical peers to try a new study method.',
  'Tell a 2-minute story about a time you failed and what you learned.',
  'Explain the risks and benefits of a treatment to a worried patient.',
  'Give a toast at a friend’s graduation.',
  'Describe your typical day to a stranger, making it interesting.',
];

export async function createTopic(formData: FormData) {
  const user = await requireUser();

  const topic = String(formData.get('topic') ?? '').trim();
  if (!topic) return;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db.insert(speakingTopics).values({
    userId: user.userId,
    topicDate: format(new Date(), 'yyyy-MM-dd'),
    topic,
    notes,
  });

  revalidatePath('/personal/speaking');
  revalidatePath('/');
}

export async function generateTodayTopic() {
  const user = await requireUser();
  const topic = TOPIC_BANK[Math.floor(Math.random() * TOPIC_BANK.length)];

  await db.insert(speakingTopics).values({
    userId: user.userId,
    topicDate: format(new Date(), 'yyyy-MM-dd'),
    topic,
  });

  revalidatePath('/personal/speaking');
  revalidatePath('/');
}

export async function deleteTopic(topicId: string) {
  const user = await requireUser();
  await db
    .delete(speakingTopics)
    .where(and(eq(speakingTopics.id, topicId), eq(speakingTopics.userId, user.userId)));

  revalidatePath('/personal/speaking');
}

export async function addSpeakingVideo(formData: FormData) {
  const user = await requireUser();

  const videoUrl = String(formData.get('videoUrl') ?? '').trim();
  if (!videoUrl) return;

  const topicId = String(formData.get('topicId') ?? '') || null;
  const selfRatingRaw = String(formData.get('selfRating') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await db.insert(speakingVideos).values({
    userId: user.userId,
    topicId,
    videoUrl,
    selfRating: selfRatingRaw ? Number(selfRatingRaw) : null,
    notes,
  });

  await awardStars(user.userId, 10, 'Practiced public speaking');
  await touchStreakForToday(user.userId);

  revalidatePath('/personal/speaking');
  revalidatePath('/');
}

export async function deleteSpeakingVideo(videoId: string) {
  const user = await requireUser();
  await db
    .delete(speakingVideos)
    .where(and(eq(speakingVideos.id, videoId), eq(speakingVideos.userId, user.userId)));

  revalidatePath('/personal/speaking');
}
