import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const exists = await fs.pathExists(dataDir);
    
    return NextResponse.json({ 
      success: true, 
      message: 'API route working', 
      dataDirectoryExists: exists 
    });
  } catch (error) {
    console.error('Error in test API route:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 