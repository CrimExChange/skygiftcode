import { CheckoutForm } from '@/components/CheckoutForm';
import { PRICING } from '@/lib/policy';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function CheckoutPage({ params }: { params: { value: string } }) {
  const value = parseInt(params.value);
  
  if (![300, 500, 1000].includes(value)) {
    return notFound();
  }

  const priceInfo = PRICING[value as 300 | 500 | 1000];

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold">Checkout</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-gray-900">{priceInfo.label}</h2>
          <p className="text-gray-500">Grab Gift Card Redemption Code</p>
        </div>

        <CheckoutForm value={value as 300 | 500 | 1000} />
      </div>
    </main>
  );
}
