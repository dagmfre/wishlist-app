import { getUser } from '@/lib/auth-server'
import { redirect } from 'next/navigation'
import HomePage from './HomePage'

export default async function Home() {
  const user = await getUser()
  
  // If user is authenticated, redirect to wishlist
  if (user) {
    redirect('/wishlist')
  }
  
  return <HomePage />
}

export const metadata = {
  title: 'Wishlist App - Save Your Favorite Items',
  description: 'Create and manage your personal wishlist. Save items you love and keep track of things you want.',
}