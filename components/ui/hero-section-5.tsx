'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function HeroSection() {
  return (
    <>
      <main className="overflow-x-hidden">
        <section>
          <div className="py-24 md:pb-32 lg:pb-36 lg:pt-72">
            <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
              <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
                <div className="space-y-32 lg:space-y-48">
                  <div className="min-h-[42vh] flex flex-col justify-center">
                    <h1 className="mt-8 max-w-2xl text-balance text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
                      Leira
                    </h1>
                    <p className="mt-8 max-w-2xl text-balance text-lg md:text-xl">
                      Charm.Allure.Liscious
                    </p>
                  </div>

                  <div className="min-h-[42vh] flex flex-col justify-center">
                    <h2 className="max-w-3xl text-balance text-4xl md:text-5xl xl:text-6xl">
                      India&apos;s First Luxury Intimate Perfume for Women
                    </h2>
                    <p className="mt-8 max-w-3xl text-balance text-lg md:text-xl">
                      Discover India&apos;s first essential oil-based feminine perfume designed for natural intimate
                      care, long-lasting freshness, and romantic confidence.
                    </p>

                    <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                      <Button asChild size="lg" className="h-12 rounded-full pl-5 pr-3 text-base">
                        <Link href="/shop">
                          <span className="text-nowrap">Shop Now</span>
                          <ChevronRight className="ml-1" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="ghost"
                        className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5"
                      >
                        <Link href="/shop">
                          <span className="text-nowrap">Discover Your Scent</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-2/3 absolute inset-1 overflow-hidden rounded-3xl border border-black/10 sm:aspect-video lg:rounded-[3rem] dark:border-white/5">
              <motion.img
                src="/images/Intro.JPEG"
                alt="Leira perfume collection"
                className="size-full object-cover opacity-65 dark:opacity-50"
                animate={{ scale: [1, 1.06, 1], x: [0, 8, 0], y: [0, -6, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </section>
        <section className="bg-background pb-2">
          <div className="group relative m-auto max-w-7xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:pr-6">
                <p className="text-end text-sm">Powering the best teams</p>
              </div>
              <div className="relative py-6 md:w-[calc(100%-11rem)]">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                  {[
                    'Nvidia',
                    'Column',
                    'GitHub',
                    'Nike',
                    'Lemon Squeezy',
                    'Laravel',
                    'Lilly',
                    'OpenAI',
                  ].map((brand) => (
                    <div
                      key={brand}
                      className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-center text-xs font-medium text-neutral-700"
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

