import { NextRequest, NextResponse } from 'next/server'
import { db, dbReady } from '@/lib/db'
import { z } from 'zod'

const rsvpSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(60, 'Nama maksimal 60 karakter'),
  attendance: z.enum(['HADIR', 'TIDAK_HADIR']),
  guests: z.number().int().min(1).max(10).default(1),
  message: z.string().trim().min(1, 'Ucapan wajib diisi').max(500, 'Ucapan maksimal 500 karakter'),
})

export async function GET() {
  try {
    await dbReady
    const wishes = await db.rsvp.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    const totalGuests = wishes
      .filter((w) => w.attendance === 'HADIR')
      .reduce((sum, w) => sum + w.guests, 0)

    return NextResponse.json({
      wishes,
      stats: {
        total: wishes.length,
        hadir: wishes.filter((w) => w.attendance === 'HADIR').length,
        tidakHadir: wishes.filter((w) => w.attendance === 'TIDAK_HADIR').length,
        totalGuests,
      },
    })
  } catch (error) {
    console.error('GET /api/rsvp error:', error)
    return NextResponse.json({ error: 'Gagal memuat ucapan' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbReady
    const body = await request.json()
    const parsed = rsvpSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Data tidak valid'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, attendance, guests, message } = parsed.data

    const wish = await db.rsvp.create({
      data: {
        name,
        attendance,
        guests: attendance === 'HADIR' ? guests : 0,
        message,
      },
    })

    return NextResponse.json({ wish }, { status: 201 })
  } catch (error) {
    console.error('POST /api/rsvp error:', error)
    return NextResponse.json({ error: 'Gagal mengirim ucapan' }, { status: 500 })
  }
}
