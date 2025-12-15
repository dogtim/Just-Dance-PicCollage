import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';

export interface LeaderboardEntry {
    id?: string;
    userName: string;
    videoName: string;
    score: number;
    timestamp: any; // Firestore Timestamp
}

const COLLECTION_NAME = 'leaderboard';

export const saveScore = async (userName: string, videoName: string, score: number) => {
    if (!userName || !videoName) return;

    try {
        await addDoc(collection(db, COLLECTION_NAME), {
            userName,
            videoName,
            score,
            timestamp: Timestamp.now()
        });
        console.log("Score saved to leaderboard");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};

export const getLeaderboard = async (videoName?: string, limitCount = 20): Promise<LeaderboardEntry[]> => {
    try {
        let q = query(collection(db, COLLECTION_NAME), orderBy('score', 'desc'), limit(limitCount));

        if (videoName) {
            // Note: Compound queries might require an index in Firestore
            q = query(
                collection(db, COLLECTION_NAME),
                where('videoName', '==', videoName),
                orderBy('score', 'desc'),
                limit(limitCount)
            );
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LeaderboardEntry));
    } catch (e) {
        console.error("Error getting leaderboard: ", e);
        return [];
    }
};
