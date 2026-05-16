import Header from '@/components/Header'
import StaffAppClient from './StaffAppClient'

export const metadata = {
  title: 'Employment Application | SoCal Academy of Knowledge',
  description: 'Application for salaried employment at SoCal Academy of Knowledge',
}

export default function StaffApplicationPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 py-16 px-4">
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-4">
            Employment Application
          </h1>
          <p className="text-slate-600 text-lg">
            SoCal Academy of Knowledge is looking for dedicated, professional staff to join our administration team. 
            Please fill out the form below to apply for a salaried position.
          </p>
        </div>
        
        <StaffAppClient />
      </div>
    </main>
  )
}
