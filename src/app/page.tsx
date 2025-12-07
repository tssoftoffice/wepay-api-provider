import { redirect } from 'next/navigation'

export default function HomePage() {
    redirect('/register?role=PARTNER_OWNER')
}
