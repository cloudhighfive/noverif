// src/components/landing/Testimonials.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Finally, a payment gateway that respects privacy!",
    author: "CryptoTrader123",
    role: "Crypto Enthusiast",
    rating: 5,
  },
  {
    quote: "Setting up my account was incredibly fast. No verification headaches!",
    author: "AnonymousUser",
    role: "Business Owner",
    rating: 5,
  },
  {
    quote: "The wallet integration is seamless. Best payment service I've used.",
    author: "BlockchainDev",
    role: "Software Developer",
    rating: 4,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-dark-950">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold mb-4">
            <span className="gradient-text">What Our Users Say</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what people are saying about NoVerif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-primary-500/30">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white text-lg mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;