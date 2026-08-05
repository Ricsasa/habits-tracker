import { redirect } from 'next/navigation';

// Adding an activity is the home screen now; this route stays for old links/bookmarks.
export default function AddActivityPage() {
  redirect('/');
}
