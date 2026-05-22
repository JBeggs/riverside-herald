export interface ExternalProduct {
  id: string
  name: string
  slug?: string
  description: string
  price: number
  currency: string
  imageUrl: string
  externalUrl: string
  category?: string
  categorySlug?: string
}

export const BUSINESS_PRODUCTS: Record<string, ExternalProduct[]> = {
  'javamallow': [
    {
      id: 'jm-1',
      name: 'Vanilla Bean Bourbon Marshmallows',
      description: 'Hand-crafted gourmet marshmallows infused with premium vanilla bean and a hint of bourbon.',
      price: 85.00,
      currency: 'ZAR',
      imageUrl: 'https://3pillars.pythonanywhere.com/media/media/Vanilla-Bean-Bourbon-Marshmallows-6-square.jpg',
      externalUrl: 'https://javamallow.co.za/products/vanilla-bean-bourbon',
      category: 'Gourmet'
    },
    {
      id: 'jm-2',
      name: 'Salted Caramel Swirl',
      description: 'Velvety marshmallows with a rich salted caramel swirl. The perfect balance of sweet and salty.',
      price: 75.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://javamallow.co.za/products/salted-caramel',
      category: 'Gourmet'
    },
    {
      id: 'jm-3',
      name: 'Double Chocolate Fudge',
      description: 'Deep, dark cocoa marshmallows packed with chunks of homemade chocolate fudge.',
      price: 90.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://javamallow.co.za/products/double-chocolate',
      category: 'Indulgent'
    },
    {
      id: 'jm-4',
      name: 'Toasted Coconut',
      description: 'Light and airy marshmallows rolled in freshly toasted organic coconut flakes.',
      price: 70.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1548685913-fe6678babe8d?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://javamallow.co.za/products/toasted-coconut',
      category: 'Classic'
    },
    {
      id: 'jm-5',
      name: 'Espresso Infusion',
      description: 'Made with single-origin espresso for a sophisticated morning or evening treat.',
      price: 80.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://javamallow.co.za/products/espresso-infusion',
      category: 'Coffee'
    },
    {
      id: 'jm-6',
      name: 'Gourmet Gift Box',
      description: 'A selection of our finest flavors, beautifully packaged for the perfect gift.',
      price: 250.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1549462980-6a6200418477?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://javamallow.co.za/products/gift-box',
      category: 'Gifts'
    }
  ],
  'past-and-present': [
    {
      id: 'pp-1',
      name: 'Vintage Leather Travel Trunk',
      description: 'Authentic early 20th-century leather trunk with brass fittings and original lining.',
      price: 4500.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1583244532610-2ca23d1af560?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://pastandpresent.co.za/products/vintage-trunk',
      category: 'Furniture'
    },
    {
      id: 'pp-2',
      name: 'Antique Brass Telescope',
      description: 'Beautifully restored maritime telescope on a mahogany tripod stand.',
      price: 3200.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1616628188506-4ad8de474c70?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://pastandpresent.co.za/products/brass-telescope',
      category: 'Collectibles'
    },
    {
      id: 'pp-3',
      name: 'Victorian Pocket Watch',
      description: 'Fully functional gold-plated pocket watch with intricate engravings.',
      price: 1850.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ad5?auto=format&fit=crop&q=80&w=400',
      externalUrl: 'https://pastandpresent.co.za/products/pocket-watch',
      category: 'Accessories'
    }
  ],
  'the-riverside-herald': [
    {
      id: 'rh-1',
      name: 'Premium Annual Subscription',
      description: 'Unlimited access to all articles, exclusive investigative reports, and ad-free experience.',
      price: 1200.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=400',
      externalUrl: '/subscribe',
      category: 'Subscription'
    },
    {
      id: 'rh-2',
      name: 'Riverside Herald Tote Bag',
      description: 'Durable organic cotton tote bag featuring our classic logo.',
      price: 150.00,
      currency: 'ZAR',
      imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400',
      externalUrl: '/shop/tote-bag',
      category: 'Merchandise'
    }
  ]
}
