import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Why reelXpress? | The high-speed edge for vertical storytelling',
  description:
    'Experience high-velocity on-demand vertical storytelling. Shot exclusively on flagship iPhone rigs with live on-spot editing and delivery in minutes.',
};

export default function ReelXpressPage() {
  redirect('/#why-us');
}
