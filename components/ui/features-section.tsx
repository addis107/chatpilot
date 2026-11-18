'use client'

import { LazyMotion, domAnimation, m } from 'motion/react'
import {
  MessageSquare,
  UserPlus,
  CalendarDays,
  ShoppingCart,
  PackageSearch,
  Headset
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const
const FONT = "'Onest', ui-sans-serif, system-ui, sans-serif"

type Feature = { icon: LucideIcon; title: string; desc: string }

const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: 'Answer questions',
    desc: 'Replies instantly from your business info — prices, hours, policies — and never makes anything up.'
  },
  {
    icon: UserPlus,
    title: 'Capture leads',
    desc: 'Spots an interested visitor, collects their name and email, and drops the lead straight in your inbox.'
  },
  {
    icon: CalendarDays,
    title: 'Book appointments',
    desc: 'Takes a preferred time and books it, then hands the customer a reference code to track.'
  },
  {
    icon: ShoppingCart,
    title: 'Take orders',
    desc: 'Shows your products, places the order, and sends it to you with a tracking code attached.'
  },
  {
    icon: PackageSearch,
    title: 'Check status',
    desc: 'Looks up an order or booking by code or email and tells the customer exactly where it stands.'
  },
  {
    icon: Headset,
    title: 'Hand off to a human',
    desc: "When it can't help, it routes the question to your team by email or your n8n automation."
  }
]

export default function FeaturesSection() {
  return (
    <LazyMotion features={domAnimation}>
      <section
        id='features'
        style={{ fontFamily: FONT }}
        className='bg-[#f3ece9] px-6 py-20 sm:py-24'
      >
        <div className='mx-auto max-w-6xl'>
          {/* Heading */}
          <div className='mx-auto max-w-2xl text-center'>
            <m.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: EASE }}
              className='text-[12px] font-semibold uppercase tracking-[0.18em] text-[#ec6745]'
            >
              What your agent can do
            </m.p>
            <m.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
              className='mt-3 text-3xl font-semibold tracking-tight text-[#234e4b] sm:text-[2.6rem] sm:leading-[1.08]'
            >
              One agent. Every customer job.
            </m.h2>
            <m.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: 0.1, ease: EASE }}
              className='mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-[#6c817e]'
            >
              Turn on only the skills your business needs. Your agent handles the
              rest on your website, around the clock.
            </m.p>
          </div>

          {/* Feature grid */}
          <div className='mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <m.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                className='group rounded-2xl border border-[#e3d9d3] bg-white p-6 shadow-[0_6px_18px_rgb(35_78_75/0.05)] transition-colors hover:border-[#ec6745]'
              >
                <div className='grid size-12 place-items-center rounded-xl bg-[#ec6745] text-white shadow-[0_6px_16px_-4px_rgb(236_103_69/0.5)]'>
                  <Icon className='size-6' strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className='mt-5 text-[1.15rem] font-semibold text-[#234e4b]'>
                  {title}
                </h3>
                <p className='mt-2 text-[15px] leading-relaxed text-[#6c817e]'>
                  {desc}
                </p>
              </m.div>
            ))}
          </div>

          {/* CTA */}
          <m.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            className='mt-14 text-center'
          >
            <a
              href='/dashboard'
              className='inline-flex h-12 items-center rounded-full bg-[#ec6745] px-7 text-[15px] font-medium text-white transition-colors hover:bg-[#d9542f]'
            >
              Build your agent →
            </a>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}
