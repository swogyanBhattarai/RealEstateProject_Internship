import { mockProperties } from '../../data/mockProperties';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id } = await req.json();
  const property = mockProperties.find((p) => p.id === id);
  if (property) {
    property.status = 'approved';
    return NextResponse.json({ message: 'Property approved', property });
  } else {
    return NextResponse.json({ message: 'Property not found' }, { status: 404 });
  }
}
