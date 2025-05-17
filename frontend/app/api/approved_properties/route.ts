import { mockProperties } from '../../data/mockProperties';
import { NextResponse } from 'next/server';

export async function GET() {
  const approved = mockProperties.filter((p) => p.status === 'approved');
  return NextResponse.json(approved);
}
