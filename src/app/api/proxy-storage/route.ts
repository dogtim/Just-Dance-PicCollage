import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
        return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    try {
        const storageRef = ref(storage, path);
        const url = await getDownloadURL(storageRef);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Storage fetch failed: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Storage Proxy Error:', error);
        return NextResponse.json({ error: 'Failed to fetch storage item' }, { status: 500 });
    }
}
