import Link from 'next/link'
export default function Home() {
  return (
    <div>
      <h1>Website Content will be shown here</h1>
      <h2>
        Dashboard === <Link href="/dashboard" className='underline text-blue-600 hover:text-black-600 hover:text-[20px]'>Dashboard</Link>{' '}
      </h2>
    </div>
  );
}
