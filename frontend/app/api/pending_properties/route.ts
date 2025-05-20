import { mockProperties } from '../../data/mockProperties';
import { NextResponse } from 'next/server';

export async function GET() {
//   const pending = mockProperties.filter((p) => p.status === 'pending');
//   return NextResponse.json(pending);
return NextResponse.json(mockProperties);
}
