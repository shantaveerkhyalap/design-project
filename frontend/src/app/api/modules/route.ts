import { NextResponse } from 'next/server';
import { cropModules } from '@/data/modules';

export async function GET() {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(cropModules);
}
