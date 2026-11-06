'use server';

import { revalidatePath } from 'next/cache';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function createJob(data) {
    try {
        const res = await fetch(`${baseURL}/api/jobs`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await res.json();
        revalidatePath('/deshboard/recruiter/jobs');
        return result;
    } catch (error) {
        console.error("Error creating job:", error);
        return { error: error.message };
    }
}
